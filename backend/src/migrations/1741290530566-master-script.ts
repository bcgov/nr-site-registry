import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1741290530566 implements MigrationInterface {
  name = 'MasterScript1741290530566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP COLUMN "filePath"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD "bucket_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD "object_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD "who_deleted" character varying(30)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD "when_deleted" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_658bd2d307dc4205b529993cddd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "site_subdiv_id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_658bd2d307dc4205b529993cddd" FOREIGN KEY ("subdiv_id") REFERENCES "sites"."subdivisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_658bd2d307dc4205b529993cddd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "site_subdiv_id" SET DEFAULT nextval('sites.site_subdivision_site_subdiv_id_seq')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "id" SET DEFAULT nextval('sites.subdivision_id_seq')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_658bd2d307dc4205b529993cddd" FOREIGN KEY ("subdiv_id") REFERENCES "sites"."subdivisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP COLUMN "when_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP COLUMN "who_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP COLUMN "object_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP COLUMN "bucket_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD "filePath" character varying`,
    );
  }
}
