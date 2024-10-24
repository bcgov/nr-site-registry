import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1720718950929 implements MigrationInterface {
  name = 'MasterScript1720718950929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" DROP COLUMN "folio_content_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "spatial_ref_sys_pkey" ON "sites"."spatial_ref_sys" ("srid") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" ADD "folio_content_id" character varying(50) NOT NULL`,
    );
  }
}
