import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727197794924 implements MigrationInterface {
  name = 'MasterScript1727197794924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" DROP CONSTRAINT "FK_938ad8c705f3e2de4f81f3af1ef"`,
    );
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
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_43192994f2226491bec18fec2cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" ADD CONSTRAINT "FK_938ad8c705f3e2de4f81f3af1ef" FOREIGN KEY ("question_id") REFERENCES "sites"."profile_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" ADD CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab" FOREIGN KEY ("sprof_site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD CONSTRAINT "FK_84d86cc243b265a436e3ab616c3" FOREIGN KEY ("site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0" FOREIGN KEY ("site_id", "date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_43192994f2226491bec18fec2cd" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_43192994f2226491bec18fec2cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP CONSTRAINT "FK_84d86cc243b265a436e3ab616c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" DROP CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" DROP CONSTRAINT "FK_938ad8c705f3e2de4f81f3af1ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_43192994f2226491bec18fec2cd" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" ADD CONSTRAINT "FK_938ad8c705f3e2de4f81f3af1ef" FOREIGN KEY ("question_id") REFERENCES "sites"."profile_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
