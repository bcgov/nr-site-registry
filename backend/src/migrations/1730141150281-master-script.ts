import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1730141150281 implements MigrationInterface {
  name = 'MasterScript1730141150281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" DROP CONSTRAINT "FK_6a823f4bdaf2485661fa50b8246"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_staffs_psnorg_id_start_date_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" DROP CONSTRAINT "UQ_6a823f4bdaf2485661fa50b8246"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" DROP CONSTRAINT "UQ_ca2c3e875aa5e455ee86bf8e02e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_staffs_psnorg_id_start_date_key" ON "sites"."site_staffs" ("psnorg_id", "start_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" ADD CONSTRAINT "UQ_7544573ebdd7a4b82ff680f4823" UNIQUE ("psnorg_id", "start_date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" ADD CONSTRAINT "FK_6a823f4bdaf2485661fa50b8246" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" DROP CONSTRAINT "FK_6a823f4bdaf2485661fa50b8246"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" DROP CONSTRAINT "UQ_7544573ebdd7a4b82ff680f4823"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_staffs_psnorg_id_start_date_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" ADD CONSTRAINT "UQ_ca2c3e875aa5e455ee86bf8e02e" UNIQUE ("start_date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" ADD CONSTRAINT "UQ_6a823f4bdaf2485661fa50b8246" UNIQUE ("psnorg_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_staffs_psnorg_id_start_date_key" ON "sites"."site_staffs" ("psnorg_id", "start_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" ADD CONSTRAINT "FK_6a823f4bdaf2485661fa50b8246" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
