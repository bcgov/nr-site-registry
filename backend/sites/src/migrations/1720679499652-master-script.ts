import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1720679499652 implements MigrationInterface {
    name = 'MasterScript1720679499652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" DROP CONSTRAINT "FK_6471f79c175957991b7ac06448d"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" DROP CONSTRAINT "PK_14d140998bafd5d7c9db226e5ef"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" ADD CONSTRAINT "PK_14d140998bafd5d7c9db226e5ef" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "sites"."idx_folio_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" DROP COLUMN "folio_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" ADD "folio_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`);
        await queryRunner.query(`CREATE INDEX "idx_folio_id" ON "sites"."folio_contents" ("folio_id") `);
        await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "spatial_ref_sys_pkey" ON "sites"."spatial_ref_sys" ("srid") `);
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" ADD CONSTRAINT "FK_6471f79c175957991b7ac06448d" FOREIGN KEY ("folio_id") REFERENCES "sites"."folio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" DROP CONSTRAINT "FK_6471f79c175957991b7ac06448d"`);
        await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
        await queryRunner.query(`DROP INDEX "sites"."idx_folio_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" DROP COLUMN "folio_id"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" ADD "folio_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_folio_id" ON "sites"."folio_contents" ("folio_id") `);
        await queryRunner.query(`ALTER TABLE "sites"."folio" DROP CONSTRAINT "PK_14d140998bafd5d7c9db226e5ef"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "sites"."folio" ADD CONSTRAINT "PK_14d140998bafd5d7c9db226e5ef" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "sites"."folio_contents" ADD CONSTRAINT "FK_6471f79c175957991b7ac06448d" FOREIGN KEY ("folio_id") REFERENCES "sites"."folio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
