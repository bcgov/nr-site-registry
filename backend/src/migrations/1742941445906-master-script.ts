import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1742941445906 implements MigrationInterface {
  name = 'MasterScript1742941445906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD "completor_partic_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD "contact_partic_id" bigint`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP COLUMN "contact_partic_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP COLUMN "completor_partic_id"`,
    );
  }
}
