import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1726702018875 implements MigrationInterface {
  name = 'MasterScript1726702018875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD "user_action" character varying(30) DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD "sr_action" character varying(30) DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "PK_1aaebab8e7887a0e11b6c287482"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "PK_722a77eaa38cb95dac512ee7aa9" PRIMARY KEY ("sp_id", "pr_code", "id")`,
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
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "PK_722a77eaa38cb95dac512ee7aa9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "PK_1aaebab8e7887a0e11b6c287482" PRIMARY KEY ("sp_id", "pr_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP COLUMN "sr_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP COLUMN "user_action"`,
    );
  }
}
