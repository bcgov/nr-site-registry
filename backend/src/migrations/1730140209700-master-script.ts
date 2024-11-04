import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1730140209700 implements MigrationInterface {
  name = 'MasterScript1730140209700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_ef5d35263f0cc2773256c285647"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_df9a943e1b0b8d86df36971b144"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "UQ_ef5d35263f0cc2773256c285647"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "UQ_df9a943e1b0b8d86df36971b144"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "psnorg_id", "sdoc_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "UQ_ea8bfa64c824437bf5638070eeb" UNIQUE ("dpr_code", "psnorg_id", "sdoc_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_df9a943e1b0b8d86df36971b144" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_ef5d35263f0cc2773256c285647" FOREIGN KEY ("sdoc_id") REFERENCES "sites"."site_docs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_ef5d35263f0cc2773256c285647"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_df9a943e1b0b8d86df36971b144"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "UQ_ea8bfa64c824437bf5638070eeb"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "UQ_df9a943e1b0b8d86df36971b144" UNIQUE ("psnorg_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "UQ_ef5d35263f0cc2773256c285647" UNIQUE ("sdoc_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "sdoc_id", "psnorg_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_df9a943e1b0b8d86df36971b144" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_ef5d35263f0cc2773256c285647" FOREIGN KEY ("sdoc_id") REFERENCES "sites"."site_docs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
