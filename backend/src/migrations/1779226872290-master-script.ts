import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1779226872290 implements MigrationInterface {
  name = 'MasterScript1779226872290';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD "user_action" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD "sr_action" character varying(30)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP COLUMN "sr_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP COLUMN "user_action"`,
    );
  }
}
