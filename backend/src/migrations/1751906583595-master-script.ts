import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1751906583595 implements MigrationInterface {
  name = 'MasterScript1751906583595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "sites"."site_subdivisions_site_subdiv_id_seq" OWNED BY "sites"."site_subdivisions"."site_subdiv_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "site_subdiv_id" SET DEFAULT nextval('"sites"."site_subdivisions_site_subdiv_id_seq"')`,
    );
    await queryRunner.query(`
      SELECT setval(
        'sites.site_subdivisions_site_subdiv_id_seq',
        COALESCE((SELECT MAX(site_subdiv_id) FROM sites.site_subdivisions), 1)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "site_subdiv_id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `DROP SEQUENCE "sites"."site_subdivisions_site_subdiv_id_seq"`,
    );
  }
}
