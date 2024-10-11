import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1727986369633 implements MigrationInterface {
  name = 'MasterScript1727986369633';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "PK_d73a722a21ace208f93cc8dd811"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "PK_ca496174a1a8f907f8cd0f0837d" PRIMARY KEY ("site_id", "site_id_associated_with", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "FK_25c8c940d25f3407fbff0e00d9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "FK_fad080594a9ae08bb4a3faacdb9"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_assocs_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "PK_ca496174a1a8f907f8cd0f0837d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "PK_0d76d8dc9aacdf3cd8b0e2bf953" PRIMARY KEY ("site_id_associated_with", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "PK_0d76d8dc9aacdf3cd8b0e2bf953"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "PK_667ed01f656e15df6c4da69173e" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_assocs_pkey" ON "sites"."site_assocs" ("site_id", "site_id_associated_with") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "FK_25c8c940d25f3407fbff0e00d9e" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "FK_fad080594a9ae08bb4a3faacdb9" FOREIGN KEY ("site_id_associated_with") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "FK_fad080594a9ae08bb4a3faacdb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "FK_25c8c940d25f3407fbff0e00d9e"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_assocs_pkey"`);
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ALTER COLUMN "geometry" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "PK_667ed01f656e15df6c4da69173e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "PK_0d76d8dc9aacdf3cd8b0e2bf953" PRIMARY KEY ("site_id_associated_with", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "PK_0d76d8dc9aacdf3cd8b0e2bf953"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "PK_ca496174a1a8f907f8cd0f0837d" PRIMARY KEY ("site_id", "site_id_associated_with", "id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_assocs_pkey" ON "sites"."site_assocs" ("site_id", "site_id_associated_with") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "FK_fad080594a9ae08bb4a3faacdb9" FOREIGN KEY ("site_id_associated_with") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "FK_25c8c940d25f3407fbff0e00d9e" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "PK_ca496174a1a8f907f8cd0f0837d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "PK_d73a722a21ace208f93cc8dd811" PRIMARY KEY ("site_id", "site_id_associated_with")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP COLUMN "id"`,
    );
  }
}
