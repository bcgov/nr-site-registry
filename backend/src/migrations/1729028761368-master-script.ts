import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1729028761368 implements MigrationInterface {
  name = 'MasterScript1729028761368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "UQ_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "psnorg_id", "sdoc_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e" FOREIGN KEY ("dpr_code") REFERENCES "sites"."doc_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "UQ_4f9b4ac9bd8d02e44e73516902e" UNIQUE ("dpr_code")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "sdoc_id", "psnorg_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e" FOREIGN KEY ("dpr_code") REFERENCES "sites"."doc_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
