import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1726262631140 implements MigrationInterface {
  name = 'MasterScript1726262631140';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "sp_id" DROP NOT NULL`,
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
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "sp_id" SET NOT NULL`,
    );
  }
}
