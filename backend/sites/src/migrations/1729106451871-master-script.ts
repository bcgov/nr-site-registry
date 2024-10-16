import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1729106451871 implements MigrationInterface {
  name = 'MasterScript1729106451871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" DROP CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP CONSTRAINT "FK_84d86cc243b265a436e3ab616c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" DROP CONSTRAINT "FK_fcba3242e7d187740cf099e5c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "PK_12d8e8cd3b984567cacbc3ae269"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "PK_0a0ceed6b2a8309a042c3ee1b91" PRIMARY KEY ("site_id", "date_completed", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_2cca26154be730cfec15ef6cb09"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_profiles_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "PK_0a0ceed6b2a8309a042c3ee1b91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "PK_6832d989c13361b647eb2ce12d6" PRIMARY KEY ("date_completed", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "PK_6832d989c13361b647eb2ce12d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "PK_ff8a337252eb6cc03fa239c86c8" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "UQ_4f9b4ac9bd8d02e44e73516902e" UNIQUE ("dpr_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE INDEX "site_profiles_id" ON "sites"."site_profiles" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_profiles_pkey" ON "sites"."site_profiles" ("date_completed", "site_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "psnorg_id", "sdoc_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_2cca26154be730cfec15ef6cb09" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e" FOREIGN KEY ("dpr_code") REFERENCES "sites"."doc_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_2cca26154be730cfec15ef6cb09"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_profiles_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."site_profiles_id"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "UQ_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "sdoc_id", "psnorg_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e" FOREIGN KEY ("dpr_code") REFERENCES "sites"."doc_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "PK_ff8a337252eb6cc03fa239c86c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "PK_6832d989c13361b647eb2ce12d6" PRIMARY KEY ("date_completed", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "PK_6832d989c13361b647eb2ce12d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "PK_0a0ceed6b2a8309a042c3ee1b91" PRIMARY KEY ("site_id", "date_completed", "id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_profiles_pkey" ON "sites"."site_profiles" ("site_id", "date_completed") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_2cca26154be730cfec15ef6cb09" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "PK_0a0ceed6b2a8309a042c3ee1b91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "PK_12d8e8cd3b984567cacbc3ae269" PRIMARY KEY ("site_id", "date_completed")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" ADD CONSTRAINT "FK_fcba3242e7d187740cf099e5c66" FOREIGN KEY ("site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0" FOREIGN KEY ("site_id", "date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD CONSTRAINT "FK_84d86cc243b265a436e3ab616c3" FOREIGN KEY ("site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" ADD CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab" FOREIGN KEY ("sprof_site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
