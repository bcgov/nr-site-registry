import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1719628513869 implements MigrationInterface {
    name = 'MasterScript1719628513869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sites"."idx_user_id_site_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_user_id_site_id" ON "sites"."recent_views" ("user_id", "site_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sites"."idx_user_id_site_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`CREATE INDEX "idx_user_id_site_id" ON "sites"."recent_views" ("site_id", "user_id") `);
    }

}
