import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1736362019288 implements MigrationInterface {
  name = 'MasterScript1736362019288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "latdeg" double precision NOT NULL, "longdeg" double precision NOT NULL, CONSTRAINT "PK_1afab86e226b4c3bc9a74465c12" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sites"."places"`);
  }
}
