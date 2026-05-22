import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1779233425804 implements MigrationInterface {
  name = 'MasterScript1779233425804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD "who_updated" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD "when_updated" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP COLUMN "who_updated"`,
    );
  }
}
