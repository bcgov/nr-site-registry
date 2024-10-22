import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1725402104541 implements MigrationInterface {
  name = 'MasterScript1725402104541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" DROP COLUMN "whenUpdated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" ADD "when_updated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."historylog" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
