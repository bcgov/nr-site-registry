import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1726592231871 implements MigrationInterface {
  name = 'MasterScript1726592231871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD "user_action" character varying(30) DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD "sr_action" character varying(30) DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP COLUMN "sr_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP COLUMN "user_action"`,
    );
  }
}
