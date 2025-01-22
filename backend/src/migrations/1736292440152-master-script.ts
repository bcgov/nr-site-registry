import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1736292440152 implements MigrationInterface {
  name = 'MasterScript1736292440152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
  }
}
