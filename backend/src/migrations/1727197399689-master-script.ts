import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727197399689 implements MigrationInterface {
  name = 'MasterScript1727197399689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_aafdda946ab5c8dd00cae4d9544"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_c67f7496519aa992316fe7b4b21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_07815f2409991b176f8b9ea1755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_371e7c30224542fe70e1b3e84a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_aafdda946ab5c8dd00cae4d9544" FOREIGN KEY ("completor_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_c67f7496519aa992316fe7b4b21" FOREIGN KEY ("contact_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_07815f2409991b176f8b9ea1755" FOREIGN KEY ("rwm_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_371e7c30224542fe70e1b3e84a7" FOREIGN KEY ("site_reg_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_371e7c30224542fe70e1b3e84a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_07815f2409991b176f8b9ea1755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_c67f7496519aa992316fe7b4b21"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_aafdda946ab5c8dd00cae4d9544"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_371e7c30224542fe70e1b3e84a7" FOREIGN KEY ("site_reg_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_07815f2409991b176f8b9ea1755" FOREIGN KEY ("rwm_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_c67f7496519aa992316fe7b4b21" FOREIGN KEY ("contact_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_aafdda946ab5c8dd00cae4d9544" FOREIGN KEY ("completor_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
