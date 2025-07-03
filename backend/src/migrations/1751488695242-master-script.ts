import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1751488695242 implements MigrationInterface {
  name = 'MasterScript1751488695242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "sites"."site_gen_desc_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."site_bco"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "rwm_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "rwm_general_desc_flag" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "site_bco" ON "sites"."sites" ("bcer_code", "class_code", "id", "sst_code") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "sites"."site_bco"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "rwm_general_desc_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "rwm_flag" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "site_bco" ON "sites"."sites" ("id", "bcer_code", "sst_code", "class_code", "rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_gen_desc_flag" ON "sites"."sites" ("rwm_general_desc_flag") `,
    );
  }
}
