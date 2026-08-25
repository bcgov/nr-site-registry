import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { LTSAService } from './ltsa.service';

const repository = () => ({
  create: jest.fn((value) => value),
  save: jest.fn(async (value) => value),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  find: jest.fn(async () => []),
  findOne: jest.fn(),
  findOneByOrFail: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('LTSAService hardening', () => {
  const subdivisions = repository();
  const current = repository();
  const previous = repository();
  const links = repository();
  const runs = repository();
  const records = repository();
  const audits = repository();
  const logger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const metrics = {
    recordLtsaLockConflict: jest.fn(),
    recordLtsaRun: jest.fn(),
    recordLtsaRecords: jest.fn(),
    recordLtsaStageFailure: jest.fn(),
    refreshLtsaGauges: jest.fn(),
  };
  const queryRunner = {
    connect: jest.fn(),
    query: jest.fn(),
    release: jest.fn(),
  };
  const dataSource = {
    options: {},
    createQueryRunner: jest.fn(() => queryRunner),
    transaction: jest.fn(),
    query: jest.fn(),
  };

  const makeService = () =>
    new LTSAService(
      subdivisions as any,
      current as any,
      previous as any,
      links as any,
      logger as any,
      dataSource as any,
      runs as any,
      records as any,
      audits as any,
      metrics as any,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    queryRunner.query.mockResolvedValue([{ acquired: true }]);
    runs.findOne.mockResolvedValue(null);
    runs.save.mockImplementation(async (value) => ({
      recordsSeen: 0,
      recordsReturned: 0,
      recordsLoaded: 0,
      malformedRecords: 0,
      changedRecords: 0,
      subdivisionUpdates: 0,
      subdivisionInserts: 0,
      siteSubdivisionInserts: 0,
      errorCategory: null,
      ...value,
      id: '10',
      startedAt: new Date(),
    }));
    dataSource.query.mockResolvedValue([]);
  });

  it('parses valid records and counts malformed lines without logging content', async () => {
    const service = makeService();
    const content = [
      `000000001A${'Legal description'.padEnd(255)}`,
      'bad',
    ].join('\n');

    const result = await service.loadLtoData(content);

    expect(result).toEqual({
      recordsProcessed: 2,
      recordsLoaded: 1,
      malformedRecords: 1,
    });
    expect(current.save).toHaveBeenCalledTimes(1);
    expect(logger.log).not.toHaveBeenCalled();
  });

  it('rejects a concurrent load with a retryable conflict', async () => {
    const path = join(tmpdir(), `ltsa-lock-${Date.now()}.txt`);
    await writeFile(path, '000000001A');
    queryRunner.query.mockResolvedValueOnce([{ acquired: false }]);

    await expect(
      makeService().processFile({
        path,
        originalname: 'parcel.txt',
        size: 10,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
    expect(metrics.recordLtsaLockConflict).toHaveBeenCalledWith('load');
    expect(metrics.recordLtsaStageFailure).toHaveBeenCalledWith('load', 'lock');
    await unlink(path);
  });

  it('reprocesses a previously successful identical file', async () => {
    const path = join(tmpdir(), `ltsa-duplicate-${Date.now()}.txt`);
    await writeFile(path, '000000001A');
    const prior = {
      id: '4',
      operation: 'load',
      status: 'success',
      completedAt: new Date(),
    };
    runs.findOne.mockResolvedValue(prior);
    dataSource.transaction.mockResolvedValue({
      load: {
        recordsProcessed: 1,
        recordsLoaded: 1,
        malformedRecords: 0,
      },
      merge: {
        recordsProcessed: 0,
        subdivisionUpdates: 0,
        subdivisionInserts: 0,
        siteSubdivisionInserts: 0,
      },
      warningMessage: null,
      completedAt: new Date(),
    });

    const result = await makeService().processFile({
      path,
      originalname: 'parcel.txt',
      size: 10,
    });

    expect(result.duplicate).toBe(true);
    expect(result.status).toBe('success');
    expect(result.changedRecords).toBe(0);
    expect(dataSource.transaction).toHaveBeenCalled();
    expect(runs.update).toHaveBeenCalledWith(
      '10',
      expect.objectContaining({ duplicateOfRunId: '4' }),
    );
    await unlink(path);
  });

  it('rejects zero valid records and records failure outside rollback', async () => {
    const path = join(tmpdir(), `ltsa-invalid-${Date.now()}.txt`);
    await writeFile(path, 'malformed');
    dataSource.transaction.mockImplementation(async (callback) =>
      callback({
        getRepository: jest.fn(() => records),
      }),
    );

    await expect(
      makeService().processFile({
        path,
        originalname: 'parcel.txt',
        size: 9,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(runs.update).toHaveBeenCalledWith(
      '10',
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'validation',
        errorMessage: 'The uploaded file contains no valid LTSA records',
      }),
    );
    expect(queryRunner.query).toHaveBeenLastCalledWith(
      'SELECT pg_advisory_unlock($1)',
      expect.any(Array),
    );
    await unlink(path);
  });

  it('records a safe failure when the atomic merge transaction rolls back', async () => {
    const path = join(tmpdir(), `ltsa-rollback-${Date.now()}.txt`);
    await writeFile(path, '000000001A');
    const manager = {
      connection: { options: {} },
      getRepository: jest.fn(() => records),
      query: jest
        .fn()
        .mockRejectedValue(new Error('sensitive merge database detail')),
    };
    dataSource.transaction.mockImplementation(async (callback) =>
      callback(manager),
    );

    await expect(
      makeService().processFile({
        path,
        originalname: 'parcel.txt',
        size: 10,
      }),
    ).rejects.toThrow('sensitive merge database detail');

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(runs.update).toHaveBeenCalledWith(
      '10',
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'internal_error',
        errorMessage: 'LTSA operation failed',
      }),
    );
    expect(metrics.recordLtsaStageFailure).toHaveBeenCalledWith(
      'load',
      'merge',
    );
    await unlink(path);
  });

  it('records dump runs and returned-record metrics', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ pidno: '000000001' }]),
    };
    subdivisions.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(makeService().processDump(1)).resolves.toEqual([
      { pidno: '000000001' },
    ]);
    expect(runs.save).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'dump_1', filename: null }),
    );
    expect(metrics.recordLtsaRecords).toHaveBeenCalledWith(
      'dump_1',
      'returned',
      1,
    );
    expect(metrics.recordLtsaRun).toHaveBeenCalledWith(
      'dump_1',
      'success',
      expect.any(Number),
    );
  });

  it('durably records a sanitized dump query failure', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockRejectedValue(new Error('postgres password=secret')),
    };
    subdivisions.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(makeService().processDump(2)).rejects.toThrow(
      'postgres password=secret',
    );
    expect(runs.update).toHaveBeenCalledWith(
      '10',
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'internal_error',
        errorMessage: 'LTSA operation failed',
      }),
    );
    expect(metrics.recordLtsaStageFailure).toHaveBeenCalledWith(
      'dump_2',
      'unknown',
    );
  });

  it('reports low-detail durable status and last-success age', async () => {
    const completedAt = new Date(Date.now() - 5000);
    runs.findOne.mockImplementation(async ({ where }) => ({
      id: '20',
      operation: Array.isArray(where) ? where[0].operation : where.operation,
      status: 'success',
      startedAt: new Date(Date.now() - 6000),
      completedAt,
      fileChecksum: 'a'.repeat(64),
      recordsReturned: 1,
      recordsLoaded: 2,
      malformedRecords: 0,
      changedRecords: 1,
      errorCategory: null,
    }));

    const result = await makeService().getStatus();
    const load = (
      result.operations as Record<
        string,
        {
          lastSuccessfulRun: Record<string, unknown>;
          lastSuccessAgeSeconds: number;
        }
      >
    ).load;

    expect(load.lastSuccessfulRun).toEqual(
      expect.objectContaining({
        operation: 'load',
        fileHash: `sha256:${'a'.repeat(64)}`,
      }),
    );
    expect(load.lastSuccessAgeSeconds).toBeGreaterThanOrEqual(5);
    expect(JSON.stringify(result)).not.toContain('filename');
  });

  it('retains recent staging batches and protects comparison batches', async () => {
    await (makeService() as any).applyRetention('10', '9');

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('runs.completed_at < $1'),
      [expect.any(Date), ['10', '9']],
    );
    expect(records.delete).not.toHaveBeenCalled();
  });

  it('sanitizes unexpected persisted failures and status output', async () => {
    const service = makeService();
    await (service as any).recordFailure(
      '10',
      new Error('password=secret database unavailable'),
    );
    expect(runs.update).toHaveBeenCalledWith(
      '10',
      expect.objectContaining({
        errorCategory: 'internal_error',
        errorMessage: 'LTSA operation failed',
      }),
    );
    expect(
      JSON.stringify(
        (service as any).runSummary({
          id: '10',
          operation: 'load',
          status: 'failed',
          errorCategory: 'internal_error',
        }),
      ),
    ).not.toContain('password');
  });
});
