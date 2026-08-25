import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { DataType, newDb } from 'pg-mem';
import { DataSource, EntitySchema, Repository } from 'typeorm';
import { LtsaRecord } from '../src/app/entities/ltsaRecord.entity';
import { LtsaRecordAudit } from '../src/app/entities/ltsaRecordAudit.entity';
import { LtsaRun } from '../src/app/entities/ltsaRun.entity';
import { LtoDownload } from '../src/app/entities/ltoDownload.entity';
import { LtoPrevDownload } from '../src/app/entities/ltoPrevDownload.entity';
import { SiteSubdivisions } from '../src/app/entities/siteSubdivisions.entity';
import { Subdivisions } from '../src/app/entities/subdivisions.entity';
import { LoggerService } from '../src/app/logger/logger.service';
import { LTSAService } from '../src/app/services/ltsa/ltsa.service';

const subdivisionSchema = new EntitySchema<Subdivisions>({
  name: 'Subdivisions',
  target: Subdivisions,
  tableName: 'subdivisions',
  columns: {
    id: { type: 'bigint', primary: true, generated: 'increment' },
    dateNoted: { name: 'date_noted', type: Date },
    pid: { type: String, length: 9, nullable: true, unique: true },
    pin: { type: String, length: 9, nullable: true, unique: true },
    bcaaFolioNumber: {
      name: 'bcaa_folio_number',
      type: String,
      length: 20,
      nullable: true,
    },
    legalDescription: {
      name: 'legal_description',
      type: String,
      length: 255,
      nullable: true,
    },
    crownLandsFileNo: {
      name: 'crown_lands_file_no',
      type: String,
      length: 7,
      nullable: true,
    },
    pidStatusCd: { name: 'pid_status_cd', type: String, length: 1 },
    validPid: {
      name: 'valid_pid',
      type: String,
      length: 1,
      nullable: true,
    },
    whoCreated: { name: 'who_created', type: String, length: 30 },
    whenCreated: { name: 'when_created', type: Date },
    whoUpdated: {
      name: 'who_updated',
      type: String,
      length: 30,
      nullable: true,
    },
    whenUpdated: { name: 'when_updated', type: Date, nullable: true },
  },
});

const siteSubdivisionSchema = new EntitySchema<SiteSubdivisions>({
  name: 'SiteSubdivisions',
  target: SiteSubdivisions,
  tableName: 'site_subdivisions',
  columns: {
    siteSubdivId: {
      name: 'site_subdiv_id',
      type: 'bigint',
      primary: true,
      generated: 'increment',
    },
    siteId: { name: 'site_id', type: 'bigint' },
    subdivId: { name: 'subdiv_id', type: 'bigint' },
    dateNoted: { name: 'date_noted', type: Date },
    initialIndicator: {
      name: 'initial_indicator',
      type: String,
      length: 1,
    },
    whoCreated: { name: 'who_created', type: String, length: 30 },
    whoUpdated: {
      name: 'who_updated',
      type: String,
      length: 30,
      nullable: true,
    },
    whenCreated: { name: 'when_created', type: Date },
    whenUpdated: { name: 'when_updated', type: Date, nullable: true },
    sprofDateCompleted: {
      name: 'sprof_date_completed',
      type: Date,
      nullable: true,
    },
    sendToSr: { name: 'send_to_sr', type: String, length: 1 },
  },
});

describe('LTSA database integration', () => {
  let dataSource: DataSource;
  let workDirectory: string;
  const logger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as unknown as LoggerService;

  const createService = () =>
    new LTSAService(
      dataSource.getRepository(Subdivisions),
      {} as Repository<LtoDownload>,
      {} as Repository<LtoPrevDownload>,
      dataSource.getRepository(SiteSubdivisions),
      logger,
      dataSource,
      dataSource.getRepository(LtsaRun),
      dataSource.getRepository(LtsaRecord),
      dataSource.getRepository(LtsaRecordAudit),
    );

  const fixedWidthRecord = (
    pid: string,
    status: string,
    description: string,
    childPid?: string,
    childStatus?: string,
    childDescription?: string,
  ) =>
    `${pid}${status}${description.padEnd(255, ' ')}${
      childPid
        ? `${childPid}${childStatus}${(childDescription ?? '').padEnd(255, ' ')}`
        : ''
    }`;

  beforeAll(async () => {
    const database = newDb({ autoCreateForeignKeyIndices: true });
    database.public.registerFunction({
      name: 'current_database',
      returns: DataType.text,
      implementation: () => 'ltsa_test',
    });
    database.public.registerFunction({
      name: 'version',
      returns: DataType.text,
      implementation: () => 'PostgreSQL 16',
    });
    database.public.registerFunction({
      name: 'pg_try_advisory_lock',
      args: [DataType.integer],
      returns: DataType.bool,
      implementation: () => true,
    });
    database.public.registerFunction({
      name: 'pg_advisory_unlock',
      args: [DataType.integer],
      returns: DataType.bool,
      implementation: () => true,
    });
    dataSource = await database.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [
        LtsaRun,
        LtsaRecord,
        LtsaRecordAudit,
        subdivisionSchema,
        siteSubdivisionSchema,
      ],
      synchronize: true,
    });
    await dataSource.initialize();
    workDirectory = await mkdtemp(join(tmpdir(), 'ltsa-e2e-'));
  });

  afterAll(async () => {
    await dataSource.destroy();
    await rm(workDirectory, { recursive: true, force: true });
  });

  it('commits one batch atomically and safely reprocesses it', async () => {
    const filePath = join(
      workDirectory,
      'PARCEL_DESCRIPTION_RESPONSE_TEST.TXT',
    );
    const line = `000000001A${'LEGAL DESCRIPTION'.padEnd(255, ' ')}`;
    await writeFile(filePath, `${line}\n`, 'utf8');

    const service = createService();
    const upload = {
      originalname: 'PARCEL_DESCRIPTION_RESPONSE_TEST.TXT',
      path: filePath,
      size: Buffer.byteLength(`${line}\n`),
    };

    const first = await service.processFile(upload);
    const second = await service.processFile(upload);

    expect(first).toEqual(
      expect.objectContaining({
        status: 'success',
        outcome: 'success',
        fileHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        recordsLoaded: 1,
        changedRecords: 1,
        recordsSkipped: 0,
        warnings: [],
      }),
    );
    expect(second).toEqual(
      expect.objectContaining({
        status: 'success',
        duplicate: true,
        recordsLoaded: 1,
        changedRecords: 0,
      }),
    );
    expect(await dataSource.getRepository(Subdivisions).count()).toBe(1);
    expect(await dataSource.getRepository(LtsaRun).count()).toBe(2);
    expect(await dataSource.getRepository(LtsaRecordAudit).count()).toBe(1);
  });

  it('preserves parent, child, status, site-link, warning, and audit rules', async () => {
    const subdivisions = dataSource.getRepository(Subdivisions);
    const links = dataSource.getRepository(SiteSubdivisions);
    const parent = await subdivisions.save(
      subdivisions.create({
        dateNoted: new Date(),
        pid: '000000010',
        pin: null,
        bcaaFolioNumber: 'FOLIO-10',
        crownLandsFileNo: 'CLF-10',
        pidStatusCd: 'A',
        legalDescription: 'OLD DESCRIPTION',
        validPid: 'Y',
        whoCreated: 'TEST',
        whenCreated: new Date(),
      }),
    );
    await links.save(
      links.create({
        siteId: '100',
        subdivId: parent.id,
        dateNoted: new Date(),
        initialIndicator: 'Y',
        whoCreated: 'TEST',
        whenCreated: new Date(),
        sendToSr: 'Y',
      }),
    );

    const filePath = join(
      workDirectory,
      'PARCEL_DESCRIPTION_RESPONSE_CHILD.TXT',
    );
    const valid = fixedWidthRecord(
      '000000010',
      'A',
      'NEW PARENT DESCRIPTION',
      '000000011',
      'B',
      'CHILD DESCRIPTION',
    );
    const invalidParent = fixedWidthRecord(
      '000000012',
      'X',
      'CANCELLED',
      '000000013',
      'A',
      'SHOULD NOT LOAD',
    );
    await writeFile(filePath, `${valid}\nmalformed\n${invalidParent}\n`);

    const result = await createService().processFile({
      originalname: 'PARCEL_DESCRIPTION_RESPONSE_CHILD.TXT',
      path: filePath,
      size: Buffer.byteLength(`${valid}\nmalformed\n${invalidParent}\n`),
    });

    expect(result.status).toBe('warning');
    expect(result.recordsSkipped).toBe(1);
    const child = await subdivisions.findOneByOrFail({ pid: '000000011' });
    expect(child).toEqual(
      expect.objectContaining({
        pin: null,
        bcaaFolioNumber: 'FOLIO-10',
        crownLandsFileNo: 'CLF-10',
        legalDescription: 'CHILD DESCRIPTION',
        pidStatusCd: 'B',
        validPid: 'Y',
      }),
    );
    expect(
      await links.findOne({
        where: { siteId: '100', subdivId: child.id },
      }),
    ).toEqual(
      expect.objectContaining({
        initialIndicator: 'N',
        sendToSr: 'Y',
        whoCreated: 'LTO-LOAD',
      }),
    );
    expect(await subdivisions.findOneByOrFail({ pid: '000000012' })).toEqual(
      expect.objectContaining({ validPid: null }),
    );
    expect(
      await subdivisions.findOne({ where: { pid: '000000013' } }),
    ).toBeNull();

    const runAudits = await dataSource.getRepository(LtsaRecordAudit).find({
      where: { runId: result.runId },
    });
    expect(
      runAudits.map(({ targetTable, action }) => [targetTable, action]),
    ).toEqual(
      expect.arrayContaining([
        ['subdivisions', 'update'],
        ['subdivisions', 'insert'],
        ['site_subdivisions', 'insert'],
      ]),
    );
  });
});
