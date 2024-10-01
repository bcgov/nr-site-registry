import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727466334834 implements MigrationInterface {
  name = 'MasterScript1727466334834';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD "filePath" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD "user_action" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD "sr_action" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ALTER COLUMN "sp_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ALTER COLUMN "sp_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP COLUMN "sr_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP COLUMN "user_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP COLUMN "filePath"`,
    );
  }
}
