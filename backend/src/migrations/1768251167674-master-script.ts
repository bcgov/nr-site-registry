import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1768251167674 implements MigrationInterface {
  name = 'MasterScript1768251167674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD "when_deleted" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP COLUMN "when_deleted"`,
    );
  }
}
