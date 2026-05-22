import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1779476152853 implements MigrationInterface {
  name = 'MasterScript1779476152853';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    // do nothing
  }
}
