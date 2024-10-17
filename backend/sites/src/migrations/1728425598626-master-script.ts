import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1728425598626 implements MigrationInterface {
  name = 'MasterScript1728425598626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" DROP CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP CONSTRAINT "FK_84d86cc243b265a436e3ab616c3"`,
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
      `ALTER TABLE "sites"."snapshots" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
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
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "user_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "sr_action" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE INDEX "site_profiles_id" ON "sites"."site_profiles" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_profiles_pkey" ON "sites"."site_profiles" ("date_completed", "site_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_2cca26154be730cfec15ef6cb09" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_2cca26154be730cfec15ef6cb09"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_profiles_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."site_profiles_id"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "sr_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."subdivisions" ALTER COLUMN "user_action" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
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
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "when_created"`,
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
      `ALTER TABLE "sites"."site_profile_land_uses" ADD CONSTRAINT "FK_84d86cc243b265a436e3ab616c3" FOREIGN KEY ("site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0" FOREIGN KEY ("site_id", "date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" ADD CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab" FOREIGN KEY ("sprof_site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
