import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1729287051332 implements MigrationInterface {
  name = 'MasterScript1729287051332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
  }
}
