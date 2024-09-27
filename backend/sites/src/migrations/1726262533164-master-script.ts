import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1726262533164 implements MigrationInterface {
  name = 'MasterScript1726262533164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_80a7d02a903118a3f172b6ced70"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."event_partics_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_9312e97df117437b5f4dbbf5943"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_2505178e3ef3a93cc34964207c2" PRIMARY KEY ("event_id", "sp_id", "epr_code", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_403fc38ed2fc14975735dc004a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_8644abc153426cfacb67a8f5602"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_2505178e3ef3a93cc34964207c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_8510b586742cdbeba99ca617f8e" PRIMARY KEY ("sp_id", "epr_code", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_8510b586742cdbeba99ca617f8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_9eba03c6198141f94ebf65b7926" PRIMARY KEY ("epr_code", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_9eba03c6198141f94ebf65b7926"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_58620dd3e5c1e9bab07c676f731" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `CREATE INDEX "ep_id" ON "sites"."event_partics" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "event_partics_pkey" ON "sites"."event_partics" ("epr_code", "event_id", "psnorg_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_8644abc153426cfacb67a8f5602" FOREIGN KEY ("epr_code") REFERENCES "sites"."event_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_403fc38ed2fc14975735dc004a9" FOREIGN KEY ("event_id") REFERENCES "sites"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_403fc38ed2fc14975735dc004a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_8644abc153426cfacb67a8f5602"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."event_partics_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."ep_id"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_58620dd3e5c1e9bab07c676f731"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_9eba03c6198141f94ebf65b7926" PRIMARY KEY ("epr_code", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_9eba03c6198141f94ebf65b7926"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_8510b586742cdbeba99ca617f8e" PRIMARY KEY ("sp_id", "epr_code", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_8510b586742cdbeba99ca617f8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_2505178e3ef3a93cc34964207c2" PRIMARY KEY ("event_id", "sp_id", "epr_code", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_8644abc153426cfacb67a8f5602" FOREIGN KEY ("epr_code") REFERENCES "sites"."event_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_403fc38ed2fc14975735dc004a9" FOREIGN KEY ("event_id") REFERENCES "sites"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "PK_2505178e3ef3a93cc34964207c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "PK_9312e97df117437b5f4dbbf5943" PRIMARY KEY ("event_id", "sp_id", "epr_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "event_partics_pkey" ON "sites"."event_partics" ("event_id", "sp_id", "epr_code") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_80a7d02a903118a3f172b6ced70" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
