import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1729275924909 implements MigrationInterface {
  name = 'MasterScript1729275924909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE "sites"."subdivision_id_seq" OWNED BY "sites"."subdivisions"."id"`,
    );
    await queryRunner.query(
      `SELECT setval('sites.subdivision_id_seq', (SELECT MAX(id) FROM "sites"."subdivisions"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "id" SET DEFAULT nextval('sites.subdivision_id_seq')`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE "sites"."site_subdivision_site_subdiv_id_seq" OWNED BY "sites"."site_subdivisions"."site_subdiv_id"`,
    );
    await queryRunner.query(
      `SELECT setval('sites.site_subdivision_site_subdiv_id_seq', (SELECT MAX(site_subdiv_id) FROM "sites"."site_subdivisions"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "site_subdiv_id" SET DEFAULT nextval('sites.site_subdivision_site_subdiv_id_seq')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "site_subdiv_id" SET DEFAULT null`,
    );
    await queryRunner.query(
      `DROP SEQUENCE "sites"."site_subdivision_site_subdiv_id_seq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "id" SET DEFAULT null`,
    );
    await queryRunner.query(`DROP SEQUENCE "sites"."subdivision_id_seq"`);
  }
}
