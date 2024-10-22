import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727110563450 implements MigrationInterface {
  name = 'MasterScript1727110563450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "FK_da8e17d429388c732e1cb261efd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "FK_4171a309de795d40009f2049ca7"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_partic_roles_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "PK_722a77eaa38cb95dac512ee7aa9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "PK_483022c3e704caa38e16534e72c" PRIMARY KEY ("sp_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "PK_483022c3e704caa38e16534e72c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "PK_24d07e3203eb0e7c8355742ce46" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_partic_roles_pkey" ON "sites"."site_partic_roles" ("pr_code", "sp_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "FK_da8e17d429388c732e1cb261efd" FOREIGN KEY ("pr_code") REFERENCES "sites"."partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "FK_4171a309de795d40009f2049ca7" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "FK_4171a309de795d40009f2049ca7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "FK_da8e17d429388c732e1cb261efd"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_partic_roles_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "PK_24d07e3203eb0e7c8355742ce46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "PK_483022c3e704caa38e16534e72c" PRIMARY KEY ("sp_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "PK_483022c3e704caa38e16534e72c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "PK_722a77eaa38cb95dac512ee7aa9" PRIMARY KEY ("sp_id", "id", "pr_code")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_partic_roles_pkey" ON "sites"."site_partic_roles" ("pr_code", "sp_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "FK_4171a309de795d40009f2049ca7" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "FK_da8e17d429388c732e1cb261efd" FOREIGN KEY ("pr_code") REFERENCES "sites"."partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
