import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1729183789534 implements MigrationInterface {
    name = 'MasterScript1729183789534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."historylog" RENAME COLUMN "snapshot_data" TO "data"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."historylog" RENAME COLUMN "data" TO "snapshot_data"`);
    }

}
