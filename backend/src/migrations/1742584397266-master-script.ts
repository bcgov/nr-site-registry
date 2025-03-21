import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1742584397266 implements MigrationInterface {
  name = 'MasterScript1742584397266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_download" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_download" DROP CONSTRAINT "PK_0bcb06db567ffea12eeb73f59fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_download" ADD CONSTRAINT "PK_527ef6494b7619c04af75fb8abd" PRIMARY KEY ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_download" DROP CONSTRAINT "PK_527ef6494b7619c04af75fb8abd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_download" ADD CONSTRAINT "PK_0bcb06db567ffea12eeb73f59fa" PRIMARY KEY ("pid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."lto_download" DROP COLUMN "id"`,
    );
  }
}
