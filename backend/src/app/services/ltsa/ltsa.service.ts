import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import {
  DataSource,
  EntityManager,
  LessThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { LtsaRecord } from '../../entities/ltsaRecord.entity';
import { LtsaRecordAudit } from '../../entities/ltsaRecordAudit.entity';
import { LtsaOperation, LtsaRun } from '../../entities/ltsaRun.entity';
import { LtoDownload } from '../../entities/ltoDownload.entity';
import { LtoPrevDownload } from '../../entities/ltoPrevDownload.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { LoggerService } from '../../logger/logger.service';
import {
  LtsaFailureStage,
  OperationalMetricsService,
} from '../../metrics/operational-metrics.service';

const ADVISORY_LOCK_KEY = 1524471241;
const CHUNK_SIZE = 1000;
const AUDIT_RETENTION_DAYS = 90;

const POSITIONS = {
  pid: [0, 9],
  status: [9, 10],
  description: [10, 265],
  childPid: [265, 274],
  childStatus: [274, 275],
  childDescription: [275, 530],
} as const;

const INVALID_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const UNICODE_QUOTES = /[\u2018\u2019\u201C\u201D\u2032\u2033]/g;
const UNICODE_DASHES = /[\u2013\u2014]/g;
const UNICODE_SPACES = /[\u00A0\u2000-\u200B\u2028\u2029]/g;

export interface LtsaUpload {
  originalname: string;
  size: number;
  path: string;
}

export interface LtsaProcessResult {
  status: 'success' | 'warning';
  outcome: 'success' | 'warning';
  message: string;
  runId: string;
  timestamp: string;
  filename: string;
  fileHash: string;
  size: number;
  duplicate: boolean;
  recordsProcessed: number;
  recordsLoaded: number;
  recordsSkipped: number;
  malformedRecords: number;
  changedRecords: number;
  warnings: string[];
  mergeResults: {
    recordsProcessed: number;
    subdivisionUpdates: number;
    subdivisionInserts: number;
    siteSubdivisionInserts: number;
  };
}

type ParsedRecord = Omit<LtsaRecord, 'id' | 'runId'>;
type MergeResult = LtsaProcessResult['mergeResults'];

class LtsaStageError extends Error {
  constructor(
    readonly stage: LtsaFailureStage,
    readonly originalError: unknown,
  ) {
    super(
      originalError instanceof Error
        ? originalError.message
        : String(originalError),
    );
  }
}

@Injectable()
export class LTSAService {
  constructor(
    @InjectRepository(Subdivisions)
    private readonly subdivisionsRepository: Repository<Subdivisions>,
    @InjectRepository(LtoDownload)
    private readonly ltoDownloadRepository: Repository<LtoDownload>,
    @InjectRepository(LtoPrevDownload)
    private readonly ltoPrevDownloadRepository: Repository<LtoPrevDownload>,
    @InjectRepository(SiteSubdivisions)
    private readonly siteSubdivisionsRepository: Repository<SiteSubdivisions>,
    private readonly sitesLogger: LoggerService,
    @Optional() private readonly dataSource: DataSource,
    @Optional()
    @InjectRepository(LtsaRun)
    private readonly ltsaRunRepository: Repository<LtsaRun>,
    @Optional()
    @InjectRepository(LtsaRecord)
    private readonly ltsaRecordRepository: Repository<LtsaRecord>,
    @Optional()
    @InjectRepository(LtsaRecordAudit)
    private readonly ltsaAuditRepository: Repository<LtsaRecordAudit>,
    @Optional()
    private readonly metrics?: OperationalMetricsService,
  ) {}

  async getSubdivisionsPids(type: number): Promise<{ pidno: string }[]> {
    if (type !== 1 && type !== 2) {
      throw new BadRequestException(
        'Type parameter must be either 1 or 2',
      );
    }

    const comparison = type === 1 ? '<' : '>=';
    return this.subdivisionsRepository
      .createQueryBuilder('subdivision')
      .select("LPAD(subdivision.pid, 9, '0')", 'pidno')
      .where('subdivision.pid IS NOT NULL')
      .andWhere(`LPAD(subdivision.pid, 9, '0') ${comparison} :boundary`, {
        boundary: '025000000',
      })
      .distinct(true)
      .orderBy('pidno', 'ASC')
      .getRawMany();
  }

  async processDump(type: 1 | 2): Promise<{ pidno: string }[]> {
    this.requireHardenedDependencies();
    const operation: LtsaOperation = type === 1 ? 'dump_1' : 'dump_2';
    const started = process.hrtime.bigint();
    let run: LtsaRun | undefined;
    try {
      run = await this.ltsaRunRepository.save(
        this.ltsaRunRepository.create({
          operation,
          status: 'processing',
          filename: null,
          fileSize: null,
          fileChecksum: null,
          previousSuccessfulRunId: null,
          duplicateOfRunId: null,
        }),
      );
      const data = await this.getSubdivisionsPids(type);
      const completedAt = new Date();
      await this.ltsaRunRepository.update(run.id, {
        status: 'success',
        completedAt,
        recordsSeen: data.length,
        recordsReturned: data.length,
      });
      this.metrics?.recordLtsaRecords(operation, 'returned', data.length);
      this.metrics?.recordLtsaRun(
        operation,
        'success',
        this.elapsedSeconds(started),
      );
      await this.metrics?.refreshLtsaGauges();
      return data;
    } catch (error) {
      this.logUnexpectedFailure(operation, error);
      if (run?.id) await this.recordFailure(run.id, error);
      this.metrics?.recordLtsaStageFailure(operation, 'unknown');
      this.metrics?.recordLtsaRun(
        operation,
        'failure',
        this.elapsedSeconds(started),
      );
      await this.metrics?.refreshLtsaGauges();
      throw error;
    }
  }

  async processFile(file: LtsaUpload): Promise<LtsaProcessResult> {
    this.requireHardenedDependencies();
    const operation: LtsaOperation = 'load';
    const started = process.hrtime.bigint();
    const lockRunner = this.dataSource.createQueryRunner();
    let lockHeld = false;
    let run: LtsaRun | undefined;
    let stage: LtsaFailureStage = 'unknown';
    let duplicate: LtsaRun | null = null;

    try {
      run = await this.ltsaRunRepository.save(
        this.ltsaRunRepository.create({
          operation,
          status: 'processing',
          filename: file.originalname,
          fileSize: String(file.size),
          fileChecksum: null,
          previousSuccessfulRunId: null,
          duplicateOfRunId: null,
        }),
      );
      stage = 'parse';
      const checksum = await this.checksum(file.path);
      await this.ltsaRunRepository.update(run.id, { fileChecksum: checksum });

      stage = 'lock';
      await lockRunner.connect();
      lockHeld = await this.tryAcquireLock(lockRunner);
      if (!lockHeld) {
        this.metrics?.recordLtsaLockConflict('load');
        throw new ConflictException({
          status: 'conflict',
          code: 'LTSA_RUN_IN_PROGRESS',
          retryable: true,
          message: 'Another LTSA load is currently running',
        });
      }

      const previous = await this.findLatestSuccessfulRun(operation);
      duplicate = await this.ltsaRunRepository.findOne({
        where: [
          { operation, fileChecksum: checksum, status: 'success' },
          { operation, fileChecksum: checksum, status: 'warning' },
        ],
        order: { completedAt: 'DESC' },
      });
      await this.ltsaRunRepository.update(run.id, {
        previousSuccessfulRunId: previous?.id ?? null,
        duplicateOfRunId: duplicate?.id ?? null,
      });
      run.previousSuccessfulRunId = previous?.id ?? null;
      run.duplicateOfRunId = duplicate?.id ?? null;
      run.fileChecksum = checksum;

      const outcome = await this.dataSource.transaction(async (manager) => {
        stage = 'stage';
        const load = await this.loadFileIntoBatch(manager, file.path, run.id);
        if (load.recordsLoaded === 0) {
          stage = 'validation';
          throw new BadRequestException(
            'The uploaded file contains no valid LTSA records',
          );
        }

        stage = 'merge';
        const merge = await this.mergeBatch(
          manager,
          run.id,
          previous?.id ?? null,
        );
        const warningMessage =
          load.malformedRecords > 0
            ? `${load.malformedRecords} malformed record(s) were skipped`
            : null;
        const completedAt = new Date();

        await manager.getRepository(LtsaRun).update(run.id, {
          status: warningMessage ? 'warning' : 'success',
          completedAt,
          recordsSeen: load.recordsProcessed,
          recordsLoaded: load.recordsLoaded,
          malformedRecords: load.malformedRecords,
          changedRecords: merge.recordsProcessed,
          subdivisionUpdates: merge.subdivisionUpdates,
          subdivisionInserts: merge.subdivisionInserts,
          siteSubdivisionInserts: merge.siteSubdivisionInserts,
          warningMessage,
        });
        return { load, merge, warningMessage, completedAt };
      });

      Object.assign(run, {
        status: outcome.warningMessage ? 'warning' : 'success',
        completedAt: outcome.completedAt,
        recordsSeen: outcome.load.recordsProcessed,
        recordsLoaded: outcome.load.recordsLoaded,
        malformedRecords: outcome.load.malformedRecords,
        changedRecords: outcome.merge.recordsProcessed,
        subdivisionUpdates: outcome.merge.subdivisionUpdates,
        subdivisionInserts: outcome.merge.subdivisionInserts,
        siteSubdivisionInserts: outcome.merge.siteSubdivisionInserts,
        warningMessage: outcome.warningMessage,
      });
      try {
        await this.applyRetention(run.id, previous?.id ?? null);
      } catch (retentionError) {
        this.metrics?.recordLtsaStageFailure(operation, 'retention');
        this.sitesLogger.warn(
          `LTSA retention failed after successful run ${run.id}: ${
            retentionError instanceof Error
              ? retentionError.message
              : String(retentionError)
          }`,
        );
      }
      this.metrics?.recordLtsaRecords(operation, 'loaded', run.recordsLoaded);
      this.metrics?.recordLtsaRecords(
        operation,
        'skipped',
        run.malformedRecords,
      );
      this.metrics?.recordLtsaRecords(operation, 'changed', run.changedRecords);
      this.metrics?.recordLtsaRun(
        operation,
        run.status === 'warning' ? 'warning' : 'success',
        this.elapsedSeconds(started),
      );
      await this.metrics?.refreshLtsaGauges();
      return this.toResponse(run, duplicate !== null);
    } catch (error) {
      const failureStage =
        error instanceof LtsaStageError ? error.stage : stage;
      const originalError =
        error instanceof LtsaStageError ? error.originalError : error;
      this.logUnexpectedFailure(operation, originalError);
      if (run?.id) {
        await this.recordFailure(run.id, originalError);
        await this.metrics?.refreshLtsaGauges();
      }
      this.metrics?.recordLtsaStageFailure(operation, failureStage);
      this.metrics?.recordLtsaRun(
        operation,
        'failure',
        this.elapsedSeconds(started),
      );
      throw originalError;
    } finally {
      if (lockHeld) {
        try {
          await lockRunner.query('SELECT pg_advisory_unlock($1)', [
            ADVISORY_LOCK_KEY,
          ]);
        } catch (unlockError) {
          this.sitesLogger.error(
            'Failed to release LTSA advisory lock',
            unlockError instanceof Error
              ? unlockError.message
              : String(unlockError),
          );
        }
      }
      try {
        await lockRunner.release();
      } catch {
        // A failed connection has no session resources to release.
      }
    }
  }

  async getStatus(): Promise<Record<string, unknown>> {
    this.requireHardenedDependencies();
    const operations: LtsaOperation[] = ['dump_1', 'dump_2', 'load'];
    const latestRuns = await Promise.all(
      operations.map((operation) =>
        this.ltsaRunRepository.findOne({
          where: { operation },
          order: { startedAt: 'DESC' },
        }),
      ),
    );
    const latestSuccesses = await Promise.all(
      operations.map((operation) => this.findLatestSuccessfulRun(operation)),
    );
    await this.metrics?.refreshLtsaGauges();
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      operations: Object.fromEntries(
        operations.map((operation, index) => [
          operation,
          {
            latestRun: latestRuns[index]
              ? this.runSummary(latestRuns[index])
              : null,
            lastSuccessfulRun: latestSuccesses[index]
              ? this.runSummary(latestSuccesses[index])
              : null,
            lastSuccessAgeSeconds: latestSuccesses[index]?.completedAt
              ? Math.max(
                  0,
                  Math.floor(
                    (Date.now() -
                      latestSuccesses[index].completedAt.getTime()) /
                      1000,
                  ),
                )
              : null,
          },
        ]),
      ),
    };
  }

  /**
   * Legacy methods remain callable for synchronous integrations. New uploads use
   * processFile(), which provides locking, transactional merge, and durable runs.
   */
  async cleanLtoTables(): Promise<void> {
    await this.ltoPrevDownloadRepository.clear();
    const current = await this.ltoDownloadRepository.find();
    for (let index = 0; index < current.length; index += CHUNK_SIZE) {
      const chunk = current.slice(index, index + CHUNK_SIZE).map((record) =>
        this.ltoPrevDownloadRepository.create({
          pid: record.pid,
          pidStatusCd: record.pidStatusCd,
          legalDescription: record.legalDescription,
          childPid: record.childPid,
          childPidStatusCd: record.childPidStatusCd,
          childLegalDescription: record.childLegalDescription,
        }),
      );
      await this.ltoPrevDownloadRepository.save(chunk);
    }
    await this.ltoDownloadRepository.clear();
  }

  async loadLtoData(fileContent: string): Promise<{
    recordsProcessed: number;
    recordsLoaded: number;
    malformedRecords: number;
  }> {
    const lines = fileContent.split(/\r?\n/).filter((line) => line.length > 0);
    const parsed = lines
      .map((line, index) => this.parseLine(line, index + 1))
      .filter((record): record is ParsedRecord => record !== null);
    for (let index = 0; index < parsed.length; index += CHUNK_SIZE) {
      await this.ltoDownloadRepository.save(
        parsed.slice(index, index + CHUNK_SIZE).map((record) =>
          this.ltoDownloadRepository.create({
            pid: record.pid,
            pidStatusCd: record.pidStatusCd,
            legalDescription: record.legalDescription,
            childPid: record.childPid,
            childPidStatusCd: record.childPidStatusCd,
            childLegalDescription: record.childLegalDescription,
          }),
        ),
      );
    }
    return {
      recordsProcessed: lines.length,
      recordsLoaded: parsed.length,
      malformedRecords: lines.length - parsed.length,
    };
  }

  async mergeLtoDescriptions(): Promise<MergeResult> {
    if (!this.dataSource) {
      throw new Error('Database connection is required for LTSA merge');
    }
    return this.dataSource.transaction(async (manager) => {
      const temporaryRun = await manager.getRepository(LtsaRun).save({
        operation: 'load',
        status: 'processing',
        filename: 'legacy',
        fileSize: '0',
        fileChecksum: 'legacy',
        previousSuccessfulRunId: null,
        duplicateOfRunId: null,
      });
      const recordsTable = this.tableName(manager, 'ltsa_records');
      const downloadTable = this.tableName(manager, 'lto_download');
      await manager.query(
        `
        INSERT INTO ${recordsTable}
          (run_id, line_number, pid, pid_status_cd, legal_description,
           child_pid, child_pid_status_cd, child_legal_description)
        SELECT $1, id, pid, pid_status_cd, legal_description,
               child_pid, child_pid_status_cd, child_legal_description
        FROM ${downloadTable}
      `,
        [temporaryRun.id],
      );
      return this.mergeBatch(manager, temporaryRun.id, null);
    });
  }

  private async loadFileIntoBatch(
    manager: EntityManager,
    path: string,
    runId: string,
  ): Promise<{
    recordsProcessed: number;
    recordsLoaded: number;
    malformedRecords: number;
  }> {
    const input = createReadStream(path, { encoding: 'utf8' });
    const lines = createInterface({ input, crlfDelay: Infinity });
    const repository = manager.getRepository(LtsaRecord);
    let recordsProcessed = 0;
    let recordsLoaded = 0;
    let malformedRecords = 0;
    let chunk: Array<Partial<LtsaRecord>> = [];

    try {
      for await (const rawLine of lines) {
        if (rawLine.length === 0) continue;
        recordsProcessed++;
        const parsed = this.parseLine(rawLine, recordsProcessed);
        if (!parsed) {
          malformedRecords++;
          continue;
        }
        chunk.push({ ...parsed, runId });
        if (chunk.length >= CHUNK_SIZE) {
          try {
            await repository.insert(chunk);
          } catch (error) {
            throw new LtsaStageError('stage', error);
          }
          recordsLoaded += chunk.length;
          chunk = [];
        }
      }
      if (chunk.length > 0) {
        try {
          await repository.insert(chunk);
        } catch (error) {
          throw new LtsaStageError('stage', error);
        }
        recordsLoaded += chunk.length;
      }
    } catch (error) {
      if (error instanceof LtsaStageError) throw error;
      throw new LtsaStageError('parse', error);
    }
    return { recordsProcessed, recordsLoaded, malformedRecords };
  }

  private parseLine(rawLine: string, lineNumber: number): ParsedRecord | null {
    const line = rawLine
      .replace(INVALID_CHARS, ' ')
      .replace(UNICODE_QUOTES, "'")
      .replace(UNICODE_DASHES, '-')
      .replace(UNICODE_SPACES, ' ');
    if (line.length < POSITIONS.status[1]) return null;

    const pid = line.slice(...POSITIONS.pid).trim();
    if (!/^\d{9}$/.test(pid)) return null;

    const field = (position: readonly [number, number]): string | null => {
      if (line.length <= position[0]) return null;
      return line.slice(position[0], position[1]).trim() || null;
    };
    const pidStatusCd = field(POSITIONS.status);
    const childPid = field(POSITIONS.childPid);
    const childPidStatusCd = field(POSITIONS.childStatus);
    if (
      !pidStatusCd ||
      (childPid && !/^\d{9}$/.test(childPid)) ||
      (childPid && !childPidStatusCd)
    ) {
      return null;
    }
    return {
      lineNumber,
      pid,
      pidStatusCd,
      legalDescription: field(POSITIONS.description),
      childPid,
      childPidStatusCd,
      childLegalDescription: field(POSITIONS.childDescription),
    };
  }

  private async mergeBatch(
    manager: EntityManager,
    runId: string,
    previousRunId: string | null,
  ): Promise<MergeResult> {
    const recordsTable = this.tableName(manager, 'ltsa_records');
    const changed = await this.getChangedRecords(manager, runId, previousRunId);
    const allParents: Array<{ pid: string }> = await manager.query(
      `SELECT DISTINCT pid FROM ${recordsTable} WHERE run_id = $1`,
      [runId],
    );
    const authoritativeParents = new Set(allParents.map(({ pid }) => pid));
    const result: MergeResult = {
      recordsProcessed: changed.length,
      subdivisionUpdates: 0,
      subdivisionInserts: 0,
      siteSubdivisionInserts: 0,
    };

    // Parent records are authoritative. Processing them first removes the old
    // timestamp heuristic while preserving parent-over-child precedence.
    for (const record of changed) {
      const parent = await this.upsertSubdivision(
        manager,
        record.pid,
        record.pidStatusCd,
        record.legalDescription,
      );
      result[parent.inserted ? 'subdivisionInserts' : 'subdivisionUpdates']++;
      await this.auditSubdivision(manager, runId, record.id, parent);
    }

    for (const record of changed) {
      if (['X', 'E'].includes(record.pidStatusCd ?? '') || !record.childPid) {
        continue;
      }
      const child = await this.upsertChild(
        manager,
        record,
        authoritativeParents.has(record.childPid),
      );
      if (child.inserted) result.subdivisionInserts++;
      if (child.updated) result.subdivisionUpdates++;
      if (child.inserted || child.updated) {
        await this.auditSubdivision(manager, runId, record.id, child);
      }
      result.siteSubdivisionInserts += await this.copySiteLinks(
        manager,
        runId,
        record.id,
        record.pid,
        child.entity.id,
      );
    }
    return result;
  }

  private async getChangedRecords(
    manager: EntityManager,
    runId: string,
    previousRunId: string | null,
  ): Promise<LtsaRecord[]> {
    const recordsTable = this.tableName(manager, 'ltsa_records');
    return manager.query(
      `WITH unique_current AS (
         SELECT DISTINCT ON (
           pid, pid_status_cd, legal_description, child_pid,
           child_pid_status_cd, child_legal_description
         ) *
         FROM ${recordsTable}
         WHERE run_id = $1
         ORDER BY pid, pid_status_cd, legal_description, child_pid,
                  child_pid_status_cd, child_legal_description, id
       )
       SELECT current.id,
              current.run_id AS "runId",
              current.line_number AS "lineNumber",
              current.pid,
              current.pid_status_cd AS "pidStatusCd",
              current.legal_description AS "legalDescription",
              current.child_pid AS "childPid",
              current.child_pid_status_cd AS "childPidStatusCd",
              current.child_legal_description AS "childLegalDescription"
       FROM unique_current current
       LEFT JOIN ${recordsTable} previous
         ON previous.run_id = $2
        AND previous.pid = current.pid
        AND (previous.pid_status_cd = current.pid_status_cd
             OR (previous.pid_status_cd IS NULL AND current.pid_status_cd IS NULL))
        AND (previous.legal_description = current.legal_description
             OR (previous.legal_description IS NULL AND current.legal_description IS NULL))
        AND (previous.child_pid = current.child_pid
             OR (previous.child_pid IS NULL AND current.child_pid IS NULL))
        AND (previous.child_pid_status_cd = current.child_pid_status_cd
             OR (previous.child_pid_status_cd IS NULL AND current.child_pid_status_cd IS NULL))
        AND (previous.child_legal_description = current.child_legal_description
             OR (previous.child_legal_description IS NULL AND current.child_legal_description IS NULL))
       WHERE $2::bigint IS NULL OR previous.id IS NULL
       ORDER BY current.id`,
      [runId, previousRunId],
    );
  }

  private async upsertSubdivision(
    manager: EntityManager,
    pid: string,
    status: string | null,
    description: string | null,
  ): Promise<{
    entity: Subdivisions;
    before: Record<string, unknown> | null;
    inserted: boolean;
    updated: boolean;
  }> {
    const repository = manager.getRepository(Subdivisions);
    const paddedPid = pid.padStart(9, '0');
    const existing = await repository.findOne({ where: { pid: paddedPid } });
    const before = existing ? this.subdivisionSnapshot(existing) : null;
    const now = new Date();
    if (existing) {
      existing.pidStatusCd = status;
      existing.legalDescription = description;
      existing.validPid = this.validPid(status);
      existing.whoUpdated = 'LTO-LOAD';
      existing.whenUpdated = now;
      return {
        entity: await repository.save(existing),
        before,
        inserted: false,
        updated: true,
      };
    }
    const entity = repository.create({
      dateNoted: now,
      pid: paddedPid,
      pidStatusCd: status,
      legalDescription: description,
      validPid: this.validPid(status),
      whoCreated: 'LTO-LOAD',
      whenCreated: now,
    });
    return {
      entity: await repository.save(entity),
      before: null,
      inserted: true,
      updated: false,
    };
  }

  private async upsertChild(
    manager: EntityManager,
    record: LtsaRecord,
    parentAuthoritative: boolean,
  ): Promise<{
    entity: Subdivisions;
    before: Record<string, unknown> | null;
    inserted: boolean;
    updated: boolean;
  }> {
    const repository = manager.getRepository(Subdivisions);
    const childPid = record.childPid.padStart(9, '0');
    const existing = await repository.findOne({ where: { pid: childPid } });
    if (existing) {
      const before = this.subdivisionSnapshot(existing);
      if (parentAuthoritative) {
        return { entity: existing, before, inserted: false, updated: false };
      }
      existing.pidStatusCd = record.childPidStatusCd;
      existing.legalDescription = record.childLegalDescription;
      existing.validPid = this.validPid(record.childPidStatusCd);
      existing.whoUpdated = 'LTO-LOAD';
      existing.whenUpdated = new Date();
      return {
        entity: await repository.save(existing),
        before,
        inserted: false,
        updated: true,
      };
    }

    const parent = await repository.findOne({
      where: { pid: record.pid.padStart(9, '0') },
    });
    if (!parent) {
      throw new Error(`Parent subdivision not found for PID ${record.pid}`);
    }
    const now = new Date();
    const child = repository.create({
      dateNoted: now,
      pin: parent.pin,
      pid: childPid,
      bcaaFolioNumber: parent.bcaaFolioNumber,
      legalDescription: record.childLegalDescription,
      crownLandsFileNo: parent.crownLandsFileNo,
      pidStatusCd: record.childPidStatusCd,
      validPid: this.validPid(record.childPidStatusCd),
      whoCreated: 'LTO-LOAD',
      whenCreated: now,
    });
    return {
      entity: await repository.save(child),
      before: null,
      inserted: true,
      updated: false,
    };
  }

  private async copySiteLinks(
    manager: EntityManager,
    runId: string,
    sourceRecordId: string,
    parentPid: string,
    childSubdivisionId: string,
  ): Promise<number> {
    const subdivisionRepository = manager.getRepository(Subdivisions);
    const linkRepository = manager.getRepository(SiteSubdivisions);
    const parent = await subdivisionRepository.findOne({
      where: { pid: parentPid.padStart(9, '0') },
    });
    if (!parent) return 0;
    const links = await linkRepository.find({ where: { subdivId: parent.id } });
    let inserted = 0;
    for (const link of links) {
      const existing = await linkRepository.findOne({
        where: { siteId: link.siteId, subdivId: childSubdivisionId },
      });
      if (existing) continue;
      const now = new Date();
      const created = await linkRepository.save(
        linkRepository.create({
          siteId: link.siteId,
          subdivId: childSubdivisionId,
          dateNoted: now,
          initialIndicator: 'N',
          whoCreated: 'LTO-LOAD',
          whenCreated: now,
          sendToSr: 'Y',
        }),
      );
      try {
        await manager.getRepository(LtsaRecordAudit).insert({
          runId,
          sourceRecordId,
          targetTable: 'site_subdivisions',
          targetId: created.siteSubdivId,
          action: 'insert',
          beforeValue: null,
          afterValue: this.siteLinkSnapshot(created),
        });
      } catch (error) {
        throw new LtsaStageError('audit', error);
      }
      inserted++;
    }
    return inserted;
  }

  private async auditSubdivision(
    manager: EntityManager,
    runId: string,
    sourceRecordId: string,
    change: {
      entity: Subdivisions;
      before: Record<string, unknown> | null;
      inserted: boolean;
    },
  ): Promise<void> {
    try {
      await manager.getRepository(LtsaRecordAudit).insert({
        runId,
        sourceRecordId,
        targetTable: 'subdivisions',
        targetId: change.entity.id,
        action: change.inserted ? 'insert' : 'update',
        beforeValue: change.before,
        afterValue: this.subdivisionSnapshot(change.entity),
      });
    } catch (error) {
      throw new LtsaStageError('audit', error);
    }
  }

  private subdivisionSnapshot(entity: Subdivisions): Record<string, unknown> {
    return {
      id: entity.id,
      pid: entity.pid,
      pin: entity.pin,
      pidStatusCd: entity.pidStatusCd,
      legalDescription: entity.legalDescription,
      validPid: entity.validPid,
      bcaaFolioNumber: entity.bcaaFolioNumber,
      crownLandsFileNo: entity.crownLandsFileNo,
      whoCreated: entity.whoCreated,
      whenCreated: entity.whenCreated,
      whoUpdated: entity.whoUpdated,
      whenUpdated: entity.whenUpdated,
    };
  }

  private siteLinkSnapshot(entity: SiteSubdivisions): Record<string, unknown> {
    return {
      siteSubdivId: entity.siteSubdivId,
      siteId: entity.siteId,
      subdivId: entity.subdivId,
      dateNoted: entity.dateNoted,
      initialIndicator: entity.initialIndicator,
      sendToSr: entity.sendToSr,
      whoCreated: entity.whoCreated,
      whenCreated: entity.whenCreated,
    };
  }

  private validPid(status: string | null): string | null {
    return status === 'X' || status === 'E' ? null : 'Y';
  }

  private async tryAcquireLock(queryRunner: QueryRunner): Promise<boolean> {
    const rows: Array<{ acquired: boolean }> = await queryRunner.query(
      'SELECT pg_try_advisory_lock($1) AS acquired',
      [ADVISORY_LOCK_KEY],
    );
    return rows[0]?.acquired === true;
  }

  private async checksum(path: string): Promise<string> {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    return hash.digest('hex');
  }

  private async findLatestSuccessfulRun(
    operation: LtsaOperation,
  ): Promise<LtsaRun | null> {
    return this.ltsaRunRepository.findOne({
      where: [
        { operation, status: 'success' },
        { operation, status: 'warning' },
      ],
      order: { completedAt: 'DESC' },
    });
  }

  private async recordFailure(runId: string, error: unknown): Promise<void> {
    const safe = this.safeFailure(error);
    try {
      await this.ltsaRunRepository.update(runId, {
        status: 'failed',
        completedAt: new Date(),
        errorCategory: safe.category,
        errorMessage: safe.message,
      });
    } catch (recordingError) {
      this.sitesLogger.error(
        `Failed to record LTSA run ${runId} failure`,
        recordingError instanceof Error
          ? recordingError.message
          : String(recordingError),
      );
    }
  }

  private async applyRetention(
    currentRunId: string,
    previousRunId: string | null,
  ): Promise<void> {
    const cutoff = new Date(
      Date.now() - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );
    await this.ltsaAuditRepository.delete({ createdAt: LessThan(cutoff) });
    const keep = previousRunId ? [currentRunId, previousRunId] : [currentRunId];
    const recordsTable = this.dataSourceTableName('ltsa_records');
    const runsTable = this.dataSourceTableName('ltsa_runs');
    await this.dataSource.query(
      `DELETE FROM ${recordsTable} records
       USING ${runsTable} runs
       WHERE records.run_id = runs.id
         AND runs.completed_at < $1
         AND NOT (records.run_id = ANY($2::bigint[]))`,
      [cutoff, keep],
    );
  }

  private toResponse(run: LtsaRun, duplicate: boolean): LtsaProcessResult {
    const warning = run.status === 'warning';
    const outcome = warning ? 'warning' : 'success';
    return {
      status: outcome,
      outcome,
      message: duplicate
        ? 'File reprocessed successfully'
        : warning
          ? 'File processed successfully with malformed records skipped'
          : 'File processed successfully',
      runId: run.id,
      timestamp: (run.completedAt ?? new Date()).toISOString(),
      filename: run.filename ?? '',
      fileHash: run.fileChecksum ? `sha256:${run.fileChecksum}` : '',
      size: Number(run.fileSize ?? 0),
      duplicate,
      recordsProcessed: run.recordsSeen,
      recordsLoaded: run.recordsLoaded,
      recordsSkipped: run.malformedRecords,
      malformedRecords: run.malformedRecords,
      changedRecords: run.changedRecords,
      warnings: run.warningMessage ? [run.warningMessage] : [],
      mergeResults: {
        recordsProcessed: run.changedRecords,
        subdivisionUpdates: run.subdivisionUpdates,
        subdivisionInserts: run.subdivisionInserts,
        siteSubdivisionInserts: run.siteSubdivisionInserts,
      },
    };
  }

  private runSummary(run: LtsaRun): Record<string, unknown> {
    return {
      id: run.id,
      operation: run.operation,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      fileHash: run.fileChecksum ? `sha256:${run.fileChecksum}` : null,
      recordsReturned: run.recordsReturned,
      recordsLoaded: run.recordsLoaded,
      malformedRecords: run.malformedRecords,
      changedRecords: run.changedRecords,
      errorCategory: run.errorCategory,
    };
  }

  private elapsedSeconds(started: bigint): number {
    return Number(process.hrtime.bigint() - started) / 1_000_000_000;
  }

  private tableName(manager: EntityManager, table: string): string {
    const schema = (manager.connection.options as { schema?: string }).schema;
    const quote = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;
    return schema ? `${quote(schema)}.${quote(table)}` : quote(table);
  }

  private dataSourceTableName(table: string): string {
    const schema = (this.dataSource.options as { schema?: string }).schema;
    const quote = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;
    return schema ? `${quote(schema)}.${quote(table)}` : quote(table);
  }

  private safeFailure(error: unknown): {
    category: string;
    message: string;
  } {
    if (error instanceof HttpException && error.getStatus() < 500) {
      const response = error.getResponse();
      const rawMessage =
        typeof response === 'string'
          ? response
          : (response as { message?: string | string[] }).message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : rawMessage;
      return {
        category: error.getStatus() === 409 ? 'conflict' : 'validation',
        message: (message || 'LTSA request was rejected').slice(0, 500),
      };
    }
    return {
      category: 'internal_error',
      message: 'LTSA operation failed',
    };
  }

  private logUnexpectedFailure(operation: LtsaOperation, error: unknown): void {
    if (error instanceof HttpException && error.getStatus() < 500) return;
    this.sitesLogger.error(
      `LTSA ${operation} failed`,
      error instanceof Error ? error.name : 'Unknown internal error',
    );
  }

  private requireHardenedDependencies(): void {
    if (
      !this.dataSource ||
      !this.ltsaRunRepository ||
      !this.ltsaRecordRepository ||
      !this.ltsaAuditRepository
    ) {
      throw new Error('LTSA persistence providers are not configured');
    }
  }
}
