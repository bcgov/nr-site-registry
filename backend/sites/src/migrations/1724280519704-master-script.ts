import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1724280519704 implements MigrationInterface {
  name = 'MasterScript1724280519704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."historylog" ("who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "whenCreated" TIMESTAMP NOT NULL DEFAULT now(), "whenUpdated" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "user_id" character varying(100) NOT NULL, "snapshot_data" jsonb NOT NULL, CONSTRAINT "PK_535e9145b9e9a05981d27b8e051" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_historylog_user_id" ON "sites"."historylog" ("user_id") `,
    );
    // await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
    await queryRunner.query(`DROP INDEX "sites"."idx_historylog_user_id"`);
    await queryRunner.query(`DROP TABLE "sites"."historylog"`);
  }
}
