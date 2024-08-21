import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1723843107947 implements MigrationInterface {
    name = 'MasterScript1723843107947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."site_docs" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_docs" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."land_histories" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."land_histories" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_profiles" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_profiles" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_partics" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_partics" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."event_partics" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."event_partics" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."events" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."events" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD "sr_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ADD "user_action" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ADD "sr_action" character varying(30)`);
   
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
   
        await queryRunner.query(`ALTER TABLE "sites"."sites" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."events" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."events" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."event_partics" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."event_partics" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_partics" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_partics" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_profiles" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_profiles" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."land_histories" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."land_histories" DROP COLUMN "user_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_docs" DROP COLUMN "sr_action"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_docs" DROP COLUMN "user_action"`);
    }

}
