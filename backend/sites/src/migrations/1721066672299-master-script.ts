import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1721066672299 implements MigrationInterface {
    name = 'MasterScript1721066672299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."events" ADD "required_action" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "sites"."events" DROP COLUMN "required_action"`);
    }

}
