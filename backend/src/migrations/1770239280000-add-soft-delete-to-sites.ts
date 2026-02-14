import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToSites1770239280000 implements MigrationInterface {
  name = 'AddSoftDeleteToSites1770239280000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ADD "who_deleted" character varying(255) DEFAULT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ADD "when_deleted" TIMESTAMP DEFAULT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_sites_who_deleted" ON "sites"."sites" ("who_deleted") WHERE "who_deleted" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sites_when_deleted" ON "sites"."sites" ("when_deleted") WHERE "when_deleted" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "sites"."idx_sites_when_deleted"`);
    await queryRunner.query(`DROP INDEX "sites"."idx_sites_who_deleted"`);

    await queryRunner.query(
      `ALTER TABLE "sites"."sites" DROP COLUMN "when_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" DROP COLUMN "who_deleted"`,
    );
  }
}
