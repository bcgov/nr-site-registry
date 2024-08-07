import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1722021920902 implements MigrationInterface {
    name = 'MasterScript1722021920902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot"`);
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot_user_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "user_id" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_snapshot" ON "sites"."snapshots" ("transaction_id", "user_id", "site_id") `);
        await queryRunner.query(`CREATE INDEX "idx_snapshot_user_id" ON "sites"."snapshots" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot_user_id"`);
        await queryRunner.query(`DROP INDEX "sites"."idx_snapshot"`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."snapshots" ADD "user_id" character varying(30) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_snapshot_user_id" ON "sites"."snapshots" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_snapshot" ON "sites"."snapshots" ("user_id", "site_id", "transaction_id") `);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
    }

}
