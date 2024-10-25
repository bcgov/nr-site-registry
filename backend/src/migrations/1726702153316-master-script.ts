import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1726702153316 implements MigrationInterface {
  name = 'MasterScript1726702153316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE INDEX "sp_id" ON "sites"."site_partic_roles" ("id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "sites"."sp_id"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
  }
}
