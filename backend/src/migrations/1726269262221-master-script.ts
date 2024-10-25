import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1726269262221 implements MigrationInterface {
  name = 'MasterScript1726269262221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "sp_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "sp_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
  }
}
