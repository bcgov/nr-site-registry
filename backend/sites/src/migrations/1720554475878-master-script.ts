import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1720554475878 implements MigrationInterface {
    name = 'MasterScript1720554475878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
        await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "spatial_ref_sys_pkey" ON "sites"."spatial_ref_sys" ("srid") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
    }

}
