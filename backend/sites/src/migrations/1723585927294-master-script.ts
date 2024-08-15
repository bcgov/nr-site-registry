import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1723585927294 implements MigrationInterface {
    name = 'MasterScript1723585927294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "created"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "updated"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "who_created" character varying(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "who_updated" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot"`);
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot_user_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "user_id" character varying(100) NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_snapshot" ON "sites"."snapshots" ("transaction_id", "user_id", "site_id") `);
        await queryRunner.query(`CREATE INDEX "idx_snapshot_user_id" ON "sites"."snapshots" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot_user_id"`);
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot"`);
        // await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "user_id" character varying(30) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_snapshot_user_id" ON "sites"."snapshots" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_snapshot" ON "sites"."snapshots" ("user_id", "site_id", "transaction_id") `);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "whenUpdated"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "whenCreated"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "who_updated"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "who_created"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "updated" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "created" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
