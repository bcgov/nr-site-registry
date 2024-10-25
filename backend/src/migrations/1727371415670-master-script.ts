import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727371415670 implements MigrationInterface {
  name = 'MasterScript1727371415670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ADD "user_action" character varying(30) DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ADD "sr_action" character varying(30) DEFAULT ''`,
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
      `ALTER TABLE "sites"."subdivisions" DROP COLUMN "sr_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" DROP COLUMN "user_action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
