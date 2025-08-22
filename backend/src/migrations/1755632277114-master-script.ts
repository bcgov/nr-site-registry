import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1755632277114 implements MigrationInterface {
  name = 'MasterScript1755632277114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."schedule2_reference" ("id" SERIAL NOT NULL, "code" character varying(10) NOT NULL, "description" character varying(255) NOT NULL, CONSTRAINT "UQ_2286ef31505e45f5bd3832456e1" UNIQUE ("code"), CONSTRAINT "PK_83b739b48fb8ce0d6331359b517" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "schedule2_reference_code" ON "sites"."schedule2_reference" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_profile_schedule2_ref" ("user_action" character varying(30), "sr_action" character varying(30), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "schedule2_reference_code" character varying NOT NULL, "site_profile_id" uuid NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, CONSTRAINT "UQ_d8de6d5606fe23339be1580a80e" UNIQUE ("site_profile_id", "schedule2_reference_code"), CONSTRAINT "PK_ba4fdaeb12d4490b91f56b88888" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_schedule2_ref" ADD CONSTRAINT "FK_c31ff7a5fc49fc6d87797b09d44" FOREIGN KEY ("site_profile_id") REFERENCES "sites"."site_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_schedule2_ref" ADD CONSTRAINT "FK_28b192cbd0ff2fe4539b80318a9" FOREIGN KEY ("schedule2_reference_code") REFERENCES "sites"."schedule2_reference"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_schedule2_ref" DROP CONSTRAINT "FK_28b192cbd0ff2fe4539b80318a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_schedule2_ref" DROP CONSTRAINT "FK_c31ff7a5fc49fc6d87797b09d44"`,
    );
    await queryRunner.query(`DROP TABLE "sites"."site_profile_schedule2_ref"`);
    await queryRunner.query(`DROP INDEX "sites"."schedule2_reference_code"`);
    await queryRunner.query(`DROP TABLE "sites"."schedule2_reference"`);
  }
}
