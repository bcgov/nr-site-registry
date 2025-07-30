import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1751901897737 implements MigrationInterface {
  name = 'MasterScript1751901897737';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_658bd2d307dc4205b529993cddd"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "sites"."subdivisions_id_seq" OWNED BY "sites"."subdivisions"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "id" SET DEFAULT nextval('"sites"."subdivisions_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_658bd2d307dc4205b529993cddd" FOREIGN KEY ("subdiv_id") REFERENCES "sites"."subdivisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      SELECT setval(
        'sites.subdivisions_id_seq',
        COALESCE((SELECT MAX(id) FROM sites.subdivisions), 1)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_658bd2d307dc4205b529993cddd"`,
    );

    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "sites"."subdivisions_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_658bd2d307dc4205b529993cddd" FOREIGN KEY ("subdiv_id") REFERENCES "sites"."subdivisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
