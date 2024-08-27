import { MigrationInterface, QueryRunner } from "typeorm";

export class MasterScript1721142257872 implements MigrationInterface {
    name = 'MasterScript1721142257872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "sites"."site_subdivisions_site_id_subdiv_id_sprof_date_completed_key"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_a832b6c43076e628fe78d50fb45"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "UQ_a832b6c43076e628fe78d50fb45"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "UQ_658bd2d307dc4205b529993cddd"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "UQ_71b14e3856335e7dc23fc28897b"`);
        await queryRunner.query(`CREATE INDEX "site_subdivisions_site_id_subdiv_id_sprof_date_completed_key" ON "sites"."site_subdivisions" ("site_id", "sprof_date_completed", "subdiv_id") `);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_a832b6c43076e628fe78d50fb45" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_658bd2d307dc4205b529993cddd" FOREIGN KEY ("subdiv_id") REFERENCES "sites"."subdivisions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_658bd2d307dc4205b529993cddd"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_a832b6c43076e628fe78d50fb45"`);
        await queryRunner.query(`DROP INDEX "sites"."site_subdivisions_site_id_subdiv_id_sprof_date_completed_key"`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "UQ_71b14e3856335e7dc23fc28897b" UNIQUE ("sprof_date_completed")`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "UQ_658bd2d307dc4205b529993cddd" UNIQUE ("subdiv_id")`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "UQ_a832b6c43076e628fe78d50fb45" UNIQUE ("site_id")`);
        await queryRunner.query(`ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_a832b6c43076e628fe78d50fb45" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE UNIQUE INDEX "site_subdivisions_site_id_subdiv_id_sprof_date_completed_key" ON "sites"."site_subdivisions" ("site_id", "subdiv_id", "sprof_date_completed") `);
    }

}
