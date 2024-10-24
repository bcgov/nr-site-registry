import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1720564517033 implements MigrationInterface {
  name = 'MasterScript1720564517033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."folio" ("who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "whenCreated" TIMESTAMP NOT NULL DEFAULT now(), "whenUpdated" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying(100) NOT NULL, "description" character varying(500) NOT NULL, "folio_content_id" character varying(50) NOT NULL, CONSTRAINT "PK_14d140998bafd5d7c9db226e5ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_folio_user_id" ON "sites"."folio" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."folio_contents" ("who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "whenCreated" TIMESTAMP NOT NULL DEFAULT now(), "whenUpdated" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "site_id" bigint NOT NULL, "folio_id" uuid NOT NULL, CONSTRAINT "PK_93328ac71e159ae70361df4de76" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_folio_id" ON "sites"."folio_contents" ("folio_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "spatial_ref_sys_pkey" ON "sites"."spatial_ref_sys" ("srid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" ADD CONSTRAINT "FK_6471f79c175957991b7ac06448d" FOREIGN KEY ("folio_id") REFERENCES "sites"."folio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" ADD CONSTRAINT "FK_d3defe0c4c2bb854b462596c9e1" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" DROP CONSTRAINT "FK_d3defe0c4c2bb854b462596c9e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" DROP CONSTRAINT "FK_6471f79c175957991b7ac06448d"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(`DROP INDEX "sites"."idx_folio_id"`);
    await queryRunner.query(`DROP TABLE "sites"."folio_contents"`);
    await queryRunner.query(`DROP INDEX "sites"."idx_folio_user_id"`);
    await queryRunner.query(`DROP TABLE "sites"."folio"`);
  }
}
