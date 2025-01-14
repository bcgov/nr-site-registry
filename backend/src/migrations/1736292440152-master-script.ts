import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1736292440152 implements MigrationInterface {
  name = 'MasterScript1736292440152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "sdoc_id", "psnorg_id") `,
    );
  }
}
