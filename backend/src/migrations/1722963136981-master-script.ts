import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1722963136981 implements MigrationInterface {
  name = 'MasterScript1722963136981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."user" ("who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "whenCreated" TIMESTAMP NOT NULL DEFAULT now(), "whenUpdated" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying NOT NULL, "userId" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "idp" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_d72ea127f30e21753c9e229891e" UNIQUE ("userId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sites"."user"`);
  }
}
