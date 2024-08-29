import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1724949893440 implements MigrationInterface {
    name = 'MasterScript1724949893440'

    public async up(queryRunner: QueryRunner): Promise<void> {       
        await queryRunner.query(`ALTER TABLE "sites"."historylog" ADD "site_id" character varying NOT NULL`);      
    }

    public async down(queryRunner: QueryRunner): Promise<void> {       
        await queryRunner.query(`ALTER TABLE "sites"."historylog" DROP COLUMN "site_id"`);      
    }

}
