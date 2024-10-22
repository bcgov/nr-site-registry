import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727110288462 implements MigrationInterface {
  name = 'MasterScript1727110288462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
  }
}
