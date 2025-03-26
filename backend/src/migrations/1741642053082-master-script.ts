import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1741642053082 implements MigrationInterface {
  name = 'MasterScript1741642053082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD "who_deleted" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD "when_deleted" TIMESTAMP`,
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
      `ALTER TABLE "sites"."site_doc_partics" DROP COLUMN "when_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP COLUMN "who_deleted"`,
    );
  }
}
