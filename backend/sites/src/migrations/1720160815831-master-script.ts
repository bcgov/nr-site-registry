import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1720160815831 implements MigrationInterface {
  name = 'MasterScript1720160815831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."cart" ("who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "whenCreated" TIMESTAMP NOT NULL DEFAULT now(), "whenUpdated" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying(100) NOT NULL, "site_id" bigint NOT NULL, "price" double precision NOT NULL, CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_cart_user_id" ON "sites"."cart" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "spatial_ref_sys_pkey" ON "sites"."spatial_ref_sys" ("srid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" ADD CONSTRAINT "FK_716512915c3949e849a3bdf6fea" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" DROP CONSTRAINT "FK_716512915c3949e849a3bdf6fea"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "longdeg" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "latdeg" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "actual_cost_of_remediations" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ALTER COLUMN "estimated_cost_of_remediations" TYPE double precision`,
    );
    await queryRunner.query(`DROP INDEX "sites"."idx_cart_user_id"`);
    await queryRunner.query(`DROP TABLE "sites"."cart"`);
  }
}
