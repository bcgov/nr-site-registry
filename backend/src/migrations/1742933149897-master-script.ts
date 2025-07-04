import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1742933149897 implements MigrationInterface {
  name = 'MasterScript1742933149897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_prev_download" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_prev_download" DROP CONSTRAINT "PK_ca5a3547d8e33dcb25c3dbe64cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_prev_download" ADD CONSTRAINT "PK_e130ce535b697199ee8909aba6b" PRIMARY KEY ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_prev_download" DROP CONSTRAINT "PK_e130ce535b697199ee8909aba6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_prev_download" ADD CONSTRAINT "PK_ca5a3547d8e33dcb25c3dbe64cd" PRIMARY KEY ("pid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_prev_download" DROP COLUMN "id"`,
    );
  }
}
