import { MigrationInterface, QueryRunner } from 'typeorm';

export class LtsaHardening1784070000000 implements MigrationInterface {
  name = 'LtsaHardening1784070000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const prefix = this.schemaPrefix(queryRunner);
    await queryRunner.query(`
      CREATE TABLE ${prefix}"ltsa_runs" (
        "id" BIGSERIAL NOT NULL,
        "operation" varchar(16) NOT NULL,
        "status" varchar(16) NOT NULL,
        "filename" varchar(255),
        "file_size" bigint,
        "file_checksum" varchar(64),
        "previous_successful_run_id" bigint,
        "duplicate_of_run_id" bigint,
        "started_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completed_at" timestamptz,
        "records_seen" integer NOT NULL DEFAULT 0,
        "records_returned" integer NOT NULL DEFAULT 0,
        "records_loaded" integer NOT NULL DEFAULT 0,
        "malformed_records" integer NOT NULL DEFAULT 0,
        "changed_records" integer NOT NULL DEFAULT 0,
        "subdivision_updates" integer NOT NULL DEFAULT 0,
        "subdivision_inserts" integer NOT NULL DEFAULT 0,
        "site_subdivision_inserts" integer NOT NULL DEFAULT 0,
        "warning_message" text,
        "error_message" text,
        "error_category" varchar(32),
        CONSTRAINT "ltsa_runs_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ltsa_runs_operation_check"
          CHECK ("operation" IN ('dump_1', 'dump_2', 'load')),
        CONSTRAINT "ltsa_runs_status_check"
          CHECK ("status" IN ('processing', 'success', 'warning', 'failed')),
        CONSTRAINT "ltsa_runs_error_category_check"
          CHECK ("error_category" IS NULL OR "error_category" IN ('validation', 'conflict', 'internal_error')),
        CONSTRAINT "ltsa_runs_previous_fk" FOREIGN KEY ("previous_successful_run_id")
          REFERENCES ${prefix}"ltsa_runs"("id") ON DELETE RESTRICT,
        CONSTRAINT "ltsa_runs_duplicate_fk" FOREIGN KEY ("duplicate_of_run_id")
          REFERENCES ${prefix}"ltsa_runs"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "ltsa_runs_operation_status_completed_idx" ON ${prefix}"ltsa_runs" ("operation", "status", "completed_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "ltsa_runs_checksum_success_idx" ON ${prefix}"ltsa_runs" ("operation", "file_checksum", "status")`,
    );

    await queryRunner.query(`
      CREATE TABLE ${prefix}"ltsa_records" (
        "id" BIGSERIAL NOT NULL,
        "run_id" bigint NOT NULL,
        "line_number" integer NOT NULL,
        "pid" varchar(9) NOT NULL,
        "pid_status_cd" varchar(1),
        "legal_description" varchar(255),
        "child_pid" varchar(9),
        "child_pid_status_cd" varchar(1),
        "child_legal_description" varchar(255),
        CONSTRAINT "ltsa_records_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ltsa_records_run_fk" FOREIGN KEY ("run_id")
          REFERENCES ${prefix}"ltsa_runs"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "ltsa_records_run_idx" ON ${prefix}"ltsa_records" ("run_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "ltsa_records_run_pid_idx" ON ${prefix}"ltsa_records" ("run_id", "pid")`,
    );

    await queryRunner.query(`
      CREATE TABLE ${prefix}"ltsa_record_audits" (
        "id" BIGSERIAL NOT NULL,
        "run_id" bigint NOT NULL,
        "source_record_id" bigint NOT NULL,
        "target_table" varchar(40) NOT NULL,
        "target_id" bigint,
        "action" varchar(16) NOT NULL,
        "before_value" jsonb,
        "after_value" jsonb NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ltsa_record_audits_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ltsa_record_audits_action_check"
          CHECK ("action" IN ('insert', 'update')),
        CONSTRAINT "ltsa_record_audits_run_fk" FOREIGN KEY ("run_id")
          REFERENCES ${prefix}"ltsa_runs"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "ltsa_record_audits_created_idx" ON ${prefix}"ltsa_record_audits" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "ltsa_record_audits_run_idx" ON ${prefix}"ltsa_record_audits" ("run_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const prefix = this.schemaPrefix(queryRunner);
    await queryRunner.query(`DROP TABLE ${prefix}"ltsa_record_audits"`);
    await queryRunner.query(`DROP TABLE ${prefix}"ltsa_records"`);
    await queryRunner.query(`DROP TABLE ${prefix}"ltsa_runs"`);
  }

  private schemaPrefix(queryRunner: QueryRunner): string {
    const schema = (queryRunner.connection.options as { schema?: string })
      .schema;
    return schema ? `"${schema.replace(/"/g, '""')}".` : '';
  }
}
