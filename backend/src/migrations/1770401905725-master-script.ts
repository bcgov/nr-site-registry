import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1770401905725 implements MigrationInterface {
  name = 'MasterScript1770401905725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD "who_deleted" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD "when_deleted" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD "who_restored" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD "when_restored" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP COLUMN "when_restored"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP COLUMN "who_restored"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP COLUMN "when_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP COLUMN "who_deleted"`,
    );
  }
}
