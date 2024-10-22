import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1720806339469 implements MigrationInterface {
  name = 'MasterScript1720806339469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" ADD "folio_id" character varying(100) NOT NULL`,
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
      `ALTER TABLE "sites"."folio" DROP COLUMN "folio_id"`,
    );
  }
}
