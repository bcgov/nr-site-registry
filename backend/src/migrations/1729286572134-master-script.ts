import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1729286572134 implements MigrationInterface {
  name = 'MasterScript1729286572134';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "rwm_note_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "rwm_note_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "rwm_note_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "rwm_note_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "rwm_note_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "rwm_note_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
  }
}
