import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1724794644045 implements MigrationInterface {
  name = 'MasterScript1724794644045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" DROP COLUMN "whenUpdated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" DROP COLUMN "whenUpdated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" DROP COLUMN "whenUpdated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "whenUpdated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" DROP COLUMN "whenCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" DROP COLUMN "whenUpdated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" ADD "when_updated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" ADD "when_updated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" ADD "when_updated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "when_updated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" ADD "when_created" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" ADD "when_updated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."user" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" DROP COLUMN "when_updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" DROP COLUMN "when_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."user" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio_contents" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."folio" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" ADD "whenUpdated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."cart" ADD "whenCreated" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
