import { LtsaHardening1784070000000 } from './1784070000000-LtsaHardening';

describe('LtsaHardening1784070000000', () => {
  const queryRunner = {
    connection: { options: { schema: 'sites' } },
    query: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('creates operation-aware constrained LTSA tables', async () => {
    await new LtsaHardening1784070000000().up(queryRunner as any);
    const sql = queryRunner.query.mock.calls.map(([query]) => query).join('\n');

    expect(sql).toContain('"sites"."ltsa_runs"');
    expect(sql).toContain('"operation" varchar(16) NOT NULL');
    expect(sql).toContain(
      `CHECK ("status" IN ('processing', 'success', 'warning', 'failed'))`,
    );
    expect(sql).not.toContain(`'skipped'`);
    expect(sql).toContain('"filename" varchar(255)');
    expect(sql).toContain('"records_returned" integer NOT NULL DEFAULT 0');
  });

  it('drops dependent tables before run metadata', async () => {
    await new LtsaHardening1784070000000().down(queryRunner as any);

    expect(queryRunner.query.mock.calls.map(([query]) => query)).toEqual([
      'DROP TABLE "sites"."ltsa_record_audits"',
      'DROP TABLE "sites"."ltsa_records"',
      'DROP TABLE "sites"."ltsa_runs"',
    ]);
  });
});
