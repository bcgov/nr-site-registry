import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSubdivisionsSequence1773695380136
  implements MigrationInterface
{
  name = 'FixSubdivisionsSequence1773695380136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix the DEFAULT so the ID column uses the correct sequence
    await queryRunner.query(`
      ALTER TABLE sites.subdivisions
        ALTER COLUMN id SET DEFAULT nextval('sites.subdivision_id_seq'::regclass);
    `);

    // Ensure the sequence is owned by the ID column
    await queryRunner.query(`
      ALTER SEQUENCE sites.subdivision_id_seq
        OWNED BY sites.subdivisions.id;
    `);

    // Resync the sequence so the next ID is valid
    await queryRunner.query(`
      SELECT setval(
        'sites.subdivision_id_seq',
        GREATEST((SELECT COALESCE(MAX(id), 0) FROM sites.subdivisions), 1),
        (SELECT COUNT(*) > 0 FROM sites.subdivisions)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sites.subdivisions
        ALTER COLUMN id DROP DEFAULT;
    `);
  }
}
