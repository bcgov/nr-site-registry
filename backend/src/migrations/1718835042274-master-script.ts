import { MigrationInterface, QueryRunner } from 'typeorm';

export class MasterScript1718835042274 implements MigrationInterface {
  name = 'MasterScript1718835042274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sites"."subdivisions" ("id" bigint NOT NULL, "date_noted" TIMESTAMP NOT NULL, "pin" character varying(9), "pid" character varying(9), "bcaa_folio_number" character varying(20), "entity_type" character varying(4), "addr_line_1" character varying(50), "addr_line_2" character varying(50), "addr_line_3" character varying(50), "addr_line_4" character varying(50), "city" character varying(30), "postal_code" character varying(10), "legal_description" character varying(255), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "crown_lands_file_no" character varying(7), "pid_status_cd" character varying(1) NOT NULL, "valid_pid" character(1), CONSTRAINT "UQ_ad7dfb7e17c409d8b025f8776a8" UNIQUE ("pin"), CONSTRAINT "UQ_2008492ca13515d645bfbf1699e" UNIQUE ("pid"), CONSTRAINT "PK_f521e4439b27c529d97c90d1907" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "subdivisions_pid_pin_key" ON "sites"."subdivisions" ("pid", "pin") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "subdivisions_pkey" ON "sites"."subdivisions" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."event_class_cd" ("code" character varying(6) NOT NULL, "description" character varying(80) NOT NULL, CONSTRAINT "PK_39cd66c9ad46408b8298ff09d4c" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "event_class_cd_pkey" ON "sites"."event_class_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."conditions_text" ("event_id" bigint NOT NULL, "conditions_comment" character varying(2000) NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, CONSTRAINT "PK_eafccfd90e6ea26bb25396c5a27" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ctext_rwm_flag" ON "sites"."conditions_text" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ctext_applied_to" ON "sites"."conditions_text" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."event_partic_role_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, CONSTRAINT "PK_d797a2afddd9edae760dbe0ff8f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "event_partic_role_cd_pkey" ON "sites"."event_partic_role_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."city_regions" ("city" character varying(30) NOT NULL, "bcer_code" character varying(6) NOT NULL, CONSTRAINT "PK_cb17df9c10546fc2fd8f0228433" PRIMARY KEY ("city"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "city_regions_pkey" ON "sites"."city_regions" ("city") `,
    );
    await queryRunner.query(
      `CREATE INDEX "cr_associated_region" ON "sites"."city_regions" ("bcer_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."profile_categories" ("id" bigint NOT NULL, "sequence_no" bigint NOT NULL, "description" character varying(200) NOT NULL, "question_type" character varying(1) NOT NULL, "effective_date" TIMESTAMP NOT NULL, "expiry_date" TIMESTAMP, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "category_precursor" character varying(300), CONSTRAINT "PK_ad4c4dbdc4185df6dc92444151a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "profcat_id_seq" ON "sites"."profile_categories" ("id", "sequence_no") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "profile_categories_pkey" ON "sites"."profile_categories" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."profile_questions" ("id" bigint NOT NULL, "sequence_no" bigint NOT NULL, "category_id" bigint NOT NULL, "parent_id" bigint, "description" character varying(400) NOT NULL, "effective_date" TIMESTAMP NOT NULL, "expiry_date" TIMESTAMP, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, CONSTRAINT "PK_cd8ce99059b595c4576dfd9a950" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "profque_parent_id" ON "sites"."profile_questions" ("parent_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "profile_questions_pkey" ON "sites"."profile_questions" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "profque_category_id" ON "sites"."profile_questions" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "profque_cat_seq" ON "sites"."profile_questions" ("category_id", "sequence_no") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."profile_answers" ("site_id" bigint NOT NULL, "sprof_date_completed" TIMESTAMP NOT NULL, "question_id" bigint NOT NULL, "who_created" character varying(30) NOT NULL, "when_created" TIMESTAMP NOT NULL, CONSTRAINT "PK_5a64b5b84dbe10ebf8ce93530a8" PRIMARY KEY ("site_id", "sprof_date_completed", "question_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "profans_sprof" ON "sites"."profile_answers" ("site_id", "sprof_date_completed") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "profile_answers_pkey" ON "sites"."profile_answers" ("question_id", "site_id", "sprof_date_completed") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."submission_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, "used_in" character varying(4) NOT NULL, CONSTRAINT "PK_51386aa61774360a636f5acd29d" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "submission_cd_pkey" ON "sites"."submission_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."profile_submissions" ("sprof_date_completed" TIMESTAMP NOT NULL, "submcd_code" character varying(6) NOT NULL, "sprof_site_id" bigint NOT NULL, CONSTRAINT "PK_745fa19f5162e40e59fbb0e76ff" PRIMARY KEY ("sprof_date_completed", "submcd_code", "sprof_site_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "profsbm_submcd_fk_i" ON "sites"."profile_submissions" ("submcd_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "profsbm_sprof_fk_i" ON "sites"."profile_submissions" ("sprof_date_completed", "sprof_site_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "profile_submissions_pkey" ON "sites"."profile_submissions" ("sprof_date_completed", "sprof_site_id", "submcd_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."doc_partic_role_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, CONSTRAINT "PK_0a0aa9d1a7150f33749f38b580f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "doc_partic_role_cd_pkey" ON "sites"."doc_partic_role_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_docs" ("id" bigint NOT NULL, "site_id" bigint NOT NULL, "submission_date" TIMESTAMP NOT NULL, "document_date" TIMESTAMP, "title" character varying(150) NOT NULL, "note" character varying(255), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, "rwm_note_flag" smallint, CONSTRAINT "PK_a273087a870d3bdcb49ea7bdfc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sdoc_about_frgn" ON "sites"."site_docs" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sdoc_rwm_flag" ON "sites"."site_docs" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_docs_pkey" ON "sites"."site_docs" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_doc_partics" ("id" bigint NOT NULL, "dpr_code" character varying(6) NOT NULL, "sdoc_id" bigint NOT NULL, "sp_id" bigint NOT NULL, "psnorg_id" bigint NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, CONSTRAINT "UQ_4f9b4ac9bd8d02e44e73516902e" UNIQUE ("dpr_code"), CONSTRAINT "UQ_ef5d35263f0cc2773256c285647" UNIQUE ("sdoc_id"), CONSTRAINT "UQ_df9a943e1b0b8d86df36971b144" UNIQUE ("psnorg_id"), CONSTRAINT "PK_3bd8f0fd332e1eb8c4c5a4e86f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sdp_played_by_frgn" ON "sites"."site_doc_partics" ("sp_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sdp_playing_a_role_i_frgn" ON "sites"."site_doc_partics" ("sdoc_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sdp_rwm_flag" ON "sites"."site_doc_partics" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sdp_psnorg_frgn" ON "sites"."site_doc_partics" ("psnorg_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_pkey" ON "sites"."site_doc_partics" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_doc_partics_sdoc_id_psnorg_id_dpr_code_key" ON "sites"."site_doc_partics" ("dpr_code", "psnorg_id", "sdoc_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sdp_classified_by_frgn" ON "sites"."site_doc_partics" ("dpr_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."partic_role_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, CONSTRAINT "PK_f66fa58a7a9d9ae750d6cd1e97f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "partic_role_cd_pkey" ON "sites"."partic_role_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_partic_roles" ("pr_code" character varying(6) NOT NULL, "sp_id" bigint NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, CONSTRAINT "PK_1aaebab8e7887a0e11b6c287482" PRIMARY KEY ("pr_code", "sp_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "spr_classifying_frgn" ON "sites"."site_partic_roles" ("sp_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "spr_rwm_flag" ON "sites"."site_partic_roles" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_partic_roles_pkey" ON "sites"."site_partic_roles" ("pr_code", "sp_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "spr_classified_by_frgn" ON "sites"."site_partic_roles" ("pr_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_partics" ("id" bigint NOT NULL, "site_id" bigint NOT NULL, "psnorg_id" bigint NOT NULL, "effective_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP, "note" character(255), "who_created" character(30) NOT NULL, "who_updated" character(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, "rwm_note_flag" smallint NOT NULL, CONSTRAINT "PK_696a284617a7f02933f29d8ecdc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sp_identified_by2_frgn" ON "sites"."site_partics" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sp_rwm_flag" ON "sites"."site_partics" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sp_identified_by_frgn" ON "sites"."site_partics" ("psnorg_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_partics_pkey" ON "sites"."site_partics" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_profile_owners" ("site_id" bigint NOT NULL, "date_completed" TIMESTAMP NOT NULL, "sp_id" bigint NOT NULL, "owner_company_contact" character varying(150), "agent_authorized_ind" character varying(1), CONSTRAINT "PK_372ee35a35e9fcc7d25d6ae3b8f" PRIMARY KEY ("site_id", "date_completed", "sp_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "spown_sp_fk_i" ON "sites"."site_profile_owners" ("sp_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_profile_owners_pkey" ON "sites"."site_profile_owners" ("date_completed", "site_id", "sp_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "spown_sprof_fk_i" ON "sites"."site_profile_owners" ("date_completed", "site_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_profiles" ("site_id" bigint NOT NULL, "date_completed" TIMESTAMP NOT NULL, "local_auth_date_recd" TIMESTAMP, "local_auth_name" character varying(200), "local_auth_agency" character varying(200), "local_auth_address1" character varying(40), "local_auth_address2" character varying(40), "local_auth_phone_area_code" character varying(3), "local_auth_phone_no" character varying(7), "local_auth_fax_area_code" character varying(3), "local_auth_fax_no" character varying(7), "local_auth_date_submitted" TIMESTAMP, "local_auth_date_forwarded" TIMESTAMP, "rwm_date_received" TIMESTAMP, "rwm_partic_id" bigint, "rwm_phone_area_code" character varying(3), "rwm_phone_no" character varying(7), "rwm_fax_area_code" character varying(3), "rwm_fax_no" character varying(7), "investigation_required" character(1), "rwm_date_decision" TIMESTAMP, "site_reg_date_recd" TIMESTAMP, "site_reg_date_entered" TIMESTAMP, "site_reg_partic_id" bigint, "owner_partic_id" bigint, "site_address" character varying(100), "site_city" character varying(30), "site_postal_code" character varying(10), "number_of_pids" smallint, "number_of_pins" smallint, "lat_degrees" smallint, "lat_minutes" smallint, "lat_seconds" numeric(4,2), "long_degrees" smallint, "long_minutes" smallint, "long_seconds" numeric(4,2), "comments" character varying(2000), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "local_auth_email" character varying(50), "planned_activity_comment" character varying(2000), "site_disclosure_comment" character varying(2000), "gov_documents_comment" character varying(2000), "completor_partic_id" bigint, "contact_partic_id" bigint, CONSTRAINT "PK_12d8e8cd3b984567cacbc3ae269" PRIMARY KEY ("site_id", "date_completed"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sprof_site_reg_site_partic" ON "sites"."site_profiles" ("site_reg_partic_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sprof_rwm_site_partic" ON "sites"."site_profiles" ("rwm_partic_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_profiles_pkey" ON "sites"."site_profiles" ("date_completed", "site_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_profile_land_uses" ("site_id" bigint NOT NULL, "sprof_date_completed" TIMESTAMP NOT NULL, "lut_code" character varying(6) NOT NULL, "who_created" character varying(16) NOT NULL, "when_created" TIMESTAMP NOT NULL, CONSTRAINT "PK_51b544fec501997e7f7bd6ec63b" PRIMARY KEY ("site_id", "sprof_date_completed", "lut_code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_profile_land_uses_pkey" ON "sites"."site_profile_land_uses" ("lut_code", "site_id", "sprof_date_completed") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."land_use_cd" ("code" character varying(6) NOT NULL, "description" character varying(60) NOT NULL, CONSTRAINT "PK_1ebd86ea91ac644362cab63dfc1" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "land_use_cd_pkey" ON "sites"."land_use_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."land_histories" ("site_id" bigint NOT NULL, "lut_code" character varying(6) NOT NULL, "note" character varying(255), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, "rwm_note_flag" smallint NOT NULL, "site_profile" character(1), "profile_date_received" TIMESTAMP, CONSTRAINT "PK_c169100fce2e3d6bb6cc0d9a1e0" PRIMARY KEY ("site_id", "lut_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sluh_applicable_to_frgn" ON "sites"."land_histories" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sluh_rwm_note_flag" ON "sites"."land_histories" ("rwm_note_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sluh_rwm_flag" ON "sites"."land_histories" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sluh_described_by_frgn" ON "sites"."land_histories" ("lut_code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "land_histories_pkey" ON "sites"."land_histories" ("lut_code", "site_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_assocs" ("site_id" bigint NOT NULL, "site_id_associated_with" bigint NOT NULL, "effective_date" TIMESTAMP NOT NULL, "note" character varying(255), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, "rwm_note_flag" smallint NOT NULL, "common_pid" character varying(1) NOT NULL, CONSTRAINT "PK_d73a722a21ace208f93cc8dd811" PRIMARY KEY ("site_id", "site_id_associated_with"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sa_associated_with_frgn" ON "sites"."site_assocs" ("site_id_associated_with") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_assocs_pkey" ON "sites"."site_assocs" ("site_id", "site_id_associated_with") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sa_adjacent_to_frgn" ON "sites"."site_assocs" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sa_rwm_note_flag" ON "sites"."site_assocs" ("rwm_note_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sa_rwm_flag" ON "sites"."site_assocs" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_subdivisions" ("site_id" bigint NOT NULL, "subdiv_id" bigint NOT NULL, "date_noted" TIMESTAMP NOT NULL, "initial_indicator" character varying(1) NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "sprof_date_completed" TIMESTAMP, "site_subdiv_id" bigint NOT NULL, "send_to_sr" character varying(1) NOT NULL, CONSTRAINT "UQ_a832b6c43076e628fe78d50fb45" UNIQUE ("site_id"), CONSTRAINT "UQ_658bd2d307dc4205b529993cddd" UNIQUE ("subdiv_id"), CONSTRAINT "UQ_71b14e3856335e7dc23fc28897b" UNIQUE ("sprof_date_completed"), CONSTRAINT "PK_ab0b9905ac3a461acae3113fdc5" PRIMARY KEY ("site_subdiv_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sitesub_comprised_of_frgn" ON "sites"."site_subdivisions" ("subdiv_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sitesub_for_profile" ON "sites"."site_subdivisions" ("sprof_date_completed") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_subdivisions_pkey" ON "sites"."site_subdivisions" ("site_subdiv_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sitesub_part_or_all_of_frgn" ON "sites"."site_subdivisions" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_subdivisions_site_id_subdiv_id_sprof_date_completed_key" ON "sites"."site_subdivisions" ("site_id", "sprof_date_completed", "subdiv_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."classification_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, CONSTRAINT "PK_fef4a1c98e41afc4b1a8052212e" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "classification_cd_pkey" ON "sites"."classification_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_risk_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, CONSTRAINT "PK_5a8325ad2f61932d934e9e87813" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_risk_cd_pkey" ON "sites"."site_risk_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."contamination_class_cd" ("code" character varying(6) NOT NULL, "description" character varying(140) NOT NULL, CONSTRAINT "PK_68b18f12122b82f2b6827c4e399" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "contamination_class_cd_pkey" ON "sites"."contamination_class_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_contamination_class_xref" ("sclc_id" bigint NOT NULL, "contamination_class_code" character varying(6) NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, CONSTRAINT "PK_8ebc61d08f29db7a4e68eae4385" PRIMARY KEY ("sclc_id", "contamination_class_code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_contamination_class_xref_pkey" ON "sites"."site_contamination_class_xref" ("contamination_class_code", "sclc_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_crown_land_status_cd" ("code" character varying(6) NOT NULL, "description" character varying(140) NOT NULL, CONSTRAINT "PK_04711244d6fc460ad7ab782490f" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_crown_land_status_cd_pkey" ON "sites"."site_crown_land_status_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_crown_land_contaminated" ("id" bigint NOT NULL, "estimated_cost_of_remediations" double precision NOT NULL, "actual_cost_of_remediations" double precision, "contamination_other_desc" character varying(50), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30) DEFAULT statement_timestamp(), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP DEFAULT statement_timestamp(), "psnorg_id" bigint, "site_crown_land_status_code" character varying(6), CONSTRAINT "PK_6eda683ea614a412d989c0a7451" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_crown_land_contaminated_pkey" ON "sites"."site_crown_land_contaminated" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."recent_views" ("id" SERIAL NOT NULL, "user_id" character varying(30) NOT NULL, "site_id" bigint NOT NULL, "address" character varying(200) NOT NULL, "city" character varying(30) NOT NULL, "general_description" character varying(225), "when_updated" TIMESTAMP, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b8f7207a9267d1c327d2e606402" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_id" ON "sites"."recent_views" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."snapshots" ("id" SERIAL NOT NULL, "user_id" character varying(30) NOT NULL, "site_id" bigint NOT NULL, "transaction_id" character varying NOT NULL, "snapshot_data" jsonb NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f5661b5fd4224d23e26a631986b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_snapshot" ON "sites"."snapshots" ("transaction_id", "user_id", "site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_snapshot_user_id" ON "sites"."snapshots" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."sites" ("id" bigint NOT NULL, "bcer_code" character varying(6) NOT NULL, "sst_code" character varying(6) NOT NULL, "common_name" character varying(40) NOT NULL, "addr_type" character varying(7) NOT NULL, "addr_line_1" character varying(50) NOT NULL, "addr_line_2" character varying(50), "addr_line_3" character varying(50), "addr_line_4" character varying(50), "city" character varying(30) NOT NULL, "prov_state" character varying(2) NOT NULL, "postal_code" character varying(10), "latdeg" double precision, "longdeg" double precision, "victoria_file_no" character varying(40), "regional_file_no" character varying(40), "class_code" character varying(6), "general_description" character varying(255), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, "rwm_general_desc_flag" smallint NOT NULL, "consultant_submitted" character(1), "long_degrees" smallint, "long_minutes" smallint, "long_seconds" numeric(4,2), "lat_degrees" smallint, "lat_minutes" smallint, "lat_seconds" numeric(4,2), "sr_status" character varying(1) NOT NULL DEFAULT 'Y', "latlong_reliability_flag" character varying(12) NOT NULL, "site_risk_code" character varying(6) NOT NULL DEFAULT 'UNC', "geometry" geometry, CONSTRAINT "UQ_e093eba174650da1012069caddf" UNIQUE ("victoria_file_no"), CONSTRAINT "PK_4f5eccb1dfde10c9170502595a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "sites_victoria_file_no_key" ON "sites"."sites" ("victoria_file_no") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_described_by_frgn" ON "sites"."sites" ("sst_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_risk_is" ON "sites"."sites" ("site_risk_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_gen_desc_flag" ON "sites"."sites" ("rwm_general_desc_flag") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "sites_pkey" ON "sites"."sites" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_geom_ddx" ON "sites"."sites" ("geometry") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_classification" ON "sites"."sites" ("class_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_responsibility_o_frgn" ON "sites"."sites" ("bcer_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_bco" ON "sites"."sites" ("bcer_code", "class_code", "id", "rwm_flag", "sst_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."bce_region_cd" ("code" character varying(6) NOT NULL, "description" character varying(40) NOT NULL, CONSTRAINT "PK_1fca462f3669363ceb6ebd93ac0" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "bce_region_cd_pkey" ON "sites"."bce_region_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."mailout" ("site_id" bigint NOT NULL, "psnorg_id" bigint NOT NULL, "bcer_code" character varying(6) NOT NULL, "display_name" character varying(150) NOT NULL, "common_name" character varying(40) NOT NULL, "common_city_name" character varying(30) NOT NULL, "organization_address" character varying(50) NOT NULL, "org_address_2" character varying(50), "org_address_3" character varying(50), "organization_city_name" character varying(30) NOT NULL, "prov_state" character varying(2) NOT NULL, "postal_code" character varying(10), "mailing_date" TIMESTAMP, "response_date" TIMESTAMP, "record_date" TIMESTAMP, "revise" character varying(1), "complete" character varying(1), "complete_date" TIMESTAMP, "comments" character varying(750), "update_notation" character varying(1), "update_notation_date" TIMESTAMP, "who_created" character varying(30) NOT NULL, "when_created" TIMESTAMP NOT NULL, "who_updated" character varying(30), "when_updated" TIMESTAMP, CONSTRAINT "PK_0442a4856b21b9b280cf9f5617f" PRIMARY KEY ("site_id", "psnorg_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "mailout_pkey" ON "sites"."mailout" ("psnorg_id", "site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "mailout_bcer_code" ON "sites"."mailout" ("bcer_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."sis_addresses" ("id" bigint NOT NULL, "psnorg_id" bigint NOT NULL, "effective_date" TIMESTAMP, "termination_date" TIMESTAMP, "bus_area_code" character varying(3), "bus_phone_no" character varying(7), "fax_area_code" character varying(3), "fax_phone_no" character varying(7), "home_area_code" character varying(3), "home_phone_no" character varying(7), "addr_type" character varying(7) NOT NULL, "addr_line_1" character varying(50) NOT NULL, "addr_line_2" character varying(50), "addr_line_3" character varying(50), "addr_line_4" character varying(50), "city" character varying(30) NOT NULL, "prov_state" character varying(2) NOT NULL, "country" character varying(3) NOT NULL, "postal_code" character varying(10), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, CONSTRAINT "PK_902f3df5b7729877942ce7020f1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "addr_a_location_for_frgn" ON "sites"."sis_addresses" ("psnorg_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "sis_addresses_pkey" ON "sites"."sis_addresses" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_staffs" ("id" bigint NOT NULL, "psnorg_id" bigint NOT NULL, "emp_num" character varying(10), "user_id" character varying(16) NOT NULL, "e_mail_addr" character varying(40), "stftype_code" character varying(6), "prt_name" character varying(15) NOT NULL, "display_name" character varying(255), "region_code" character varying(6), "start_date" TIMESTAMP NOT NULL, "termination_date" TIMESTAMP, "staff_role" character varying(12) NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "last_name" character varying(150), "first_name" character varying(75), CONSTRAINT "UQ_6a823f4bdaf2485661fa50b8246" UNIQUE ("psnorg_id"), CONSTRAINT "UQ_ca2c3e875aa5e455ee86bf8e02e" UNIQUE ("start_date"), CONSTRAINT "PK_6d0b93303c2f0101bd49f49e044" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_staffs_psnorg_id_start_date_key" ON "sites"."site_staffs" ("psnorg_id", "start_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "site_staff_employed_as_frgn" ON "sites"."site_staffs" ("psnorg_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_staffs_pkey" ON "sites"."site_staffs" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."people_orgs" ("id" bigint NOT NULL, "organization_name" character varying(150), "display_name" character varying(150) NOT NULL, "entity_type" character varying(12) NOT NULL, "location" character varying(40), "bcer_code" character varying(6), "contact_name" character varying(150), "mail_userid" character varying(100), "last_name" character varying(150), "first_name" character varying(75), "middle_name" character varying(75), "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "end_date" TIMESTAMP, CONSTRAINT "PK_f21f7810077cedb2b4c99e7b857" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "people_orgs_pkey" ON "sites"."people_orgs" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "psnorg_working_within_frgn" ON "sites"."people_orgs" ("bcer_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."event_partics" ("event_id" bigint NOT NULL, "sp_id" bigint NOT NULL, "epr_code" character varying(6) NOT NULL, "psnorg_id" bigint NOT NULL, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, CONSTRAINT "PK_9312e97df117437b5f4dbbf5943" PRIMARY KEY ("event_id", "sp_id", "epr_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ep_played_by_frgn" ON "sites"."event_partics" ("sp_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ep_rwm_flag" ON "sites"."event_partics" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ep_psnorg_frgn" ON "sites"."event_partics" ("psnorg_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ep_playing_a_role_i_frgn" ON "sites"."event_partics" ("event_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ep_classified_by_frgn" ON "sites"."event_partics" ("epr_code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "event_partics_pkey" ON "sites"."event_partics" ("epr_code", "event_id", "sp_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."events" ("id" bigint NOT NULL, "site_id" bigint NOT NULL, "event_date" TIMESTAMP NOT NULL, "completion_date" TIMESTAMP, "etyp_code" character varying(6) NOT NULL, "psnorg_id" bigint NOT NULL, "sp_id" bigint NOT NULL, "note" character varying(500), "region_app_flag" character varying(1), "region_userid" character varying(16), "region_date" TIMESTAMP, "who_created" character varying(30) NOT NULL, "who_updated" character varying(30), "when_created" TIMESTAMP NOT NULL, "when_updated" TIMESTAMP, "rwm_flag" smallint NOT NULL, "rwm_note_flag" smallint NOT NULL, "rwm_approval_date" TIMESTAMP, "ecls_code" character varying(6) NOT NULL, "requirement_due_date" TIMESTAMP, "requirement_received_date" TIMESTAMP, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "event_responsibility_of_frgn" ON "sites"."events" ("sp_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "event_applicable_to_frgn" ON "sites"."events" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "event_rwm_note_flag" ON "sites"."events" ("rwm_note_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "event_rwm_flag" ON "sites"."events" ("rwm_flag") `,
    );
    await queryRunner.query(
      `CREATE INDEX "event_psnorg_frgn" ON "sites"."events" ("psnorg_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "events_pkey" ON "sites"."events" ("id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "event_described_by_frgn" ON "sites"."events" ("ecls_code", "etyp_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."event_type_cd" ("code" character varying(6) NOT NULL, "ecls_code" character varying(6) NOT NULL, "sst_code" character varying(6), "description" character varying(120) NOT NULL, "req_completion_date" character varying(1) NOT NULL, "req_regional_approval" character varying(1) NOT NULL, "req_remediation_plan" character varying(1) NOT NULL, "req_registrar_approval" character varying(1) NOT NULL, "req_success" character varying(1) NOT NULL, "site_registry_visible" character varying(1) NOT NULL, CONSTRAINT "PK_6b8ac60b413e3695f6093bd627a" PRIMARY KEY ("code", "ecls_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "etyp_related_to_frgn" ON "sites"."event_type_cd" ("sst_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "etyp_classified_by_frgn" ON "sites"."event_type_cd" ("ecls_code") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "event_type_cd_pkey" ON "sites"."event_type_cd" ("code", "ecls_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_status_cd" ("code" character varying(6) NOT NULL, "description" character varying(120) NOT NULL, CONSTRAINT "PK_ad41aacc4073cfc61b0f56d7452" PRIMARY KEY ("code"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_status_cd_pkey" ON "sites"."site_status_cd" ("code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."spatial_ref_sys" ("srid" integer NOT NULL, "auth_name" character varying(256), "auth_srid" integer, "srtext" character varying(2048), "proj4text" character varying(2048), CONSTRAINT "PK_ff8a45f5398d8ad47f3b844bb58" PRIMARY KEY ("srid"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "spatial_ref_sys_pkey" ON "sites"."spatial_ref_sys" ("srid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_registry_module" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sites" character(1), "site_location_description" character(1), "site_partics" character(1), "site_partic_notes" character(1), "site_partic_roles" character(1), "site_partic_dates" character(1), "notations" character(1), "notation_notes" character(1), "notation_actions" character(1), "notation_partics" character(1), "documents" character(1), "document_notes" character(1), "document_partics" character(1), "document_abstracts" character(1), "document_measure_pops" character(1), "document_measure_details" character(1), "associations" character(1), "association_notes" character(1), "association_dates" character(1), "suspect_land_uses" character(1), "suspect_land_use_notes" character(1), "aec_assessments" character(1), "aec_assessment_mig_potential" character(1), "aec_assessment_sources" character(1), "aec_assessment_medias" character(1), "aec_assessment_media_notes" character(1), "aec_assessment_pcocs" character(1), "aec_remed_plans" character(1), "aec_remed_plan_notes" character(1), "aec_remed_plan_items" character(1), "aec_remed_plan_item_measures" character(1), "aec_remed_approaches" character(1), CONSTRAINT "PK_7c6a966c058663ac877148f6f42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."site_registry" ("site_id" bigint NOT NULL, "reg_flag" smallint, "reg_userid" character varying(16), "init_approval_date" TIMESTAMP, "last_approval_date" TIMESTAMP, "tombstone_date" TIMESTAMP, CONSTRAINT "PK_f9b6fe314837927a20473fa8540" PRIMARY KEY ("site_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "site_registry_pkey" ON "sites"."site_registry" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "sitereg_bco" ON "sites"."site_registry" ("reg_flag", "site_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."plan_table" ("plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "statement_id" character varying(30), "timestamp" TIMESTAMP, "remarks" character varying(80), "operation" character varying(30), "options" character varying(30), "object_node" character varying(128), "object_owner" character varying(30), "object_name" character varying(30), "object_instance" numeric(38,0), "object_type" character varying(30), "optimizer" character varying(255), "search_columns" numeric(38,0), "id" numeric(38,0), "parent_id" numeric(38,0), "position" numeric(38,0), "other" text, CONSTRAINT "PK_47862dc75dee14961bc390d6737" PRIMARY KEY ("plan_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."lto_prev_download" ("pid" character varying(9) NOT NULL, "pid_status_cd" character varying(1), "legal_description" character varying(255), "child_pid" character varying(9), "child_pid_status_cd" character varying(1), "child_legal_description" character varying(255), CONSTRAINT "PK_ca5a3547d8e33dcb25c3dbe64cd" PRIMARY KEY ("pid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sites"."lto_download" ("pid" character varying(9) NOT NULL, "pid_status_cd" character varying(1), "legal_description" character varying(255), "child_pid" character varying(9), "child_pid_status_cd" character varying(1), "child_legal_description" character varying(255), CONSTRAINT "PK_0bcb06db567ffea12eeb73f59fa" PRIMARY KEY ("pid"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."conditions_text" ADD CONSTRAINT "FK_eafccfd90e6ea26bb25396c5a27" FOREIGN KEY ("event_id") REFERENCES "sites"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."city_regions" ADD CONSTRAINT "FK_33e181f6ff3eddb414d71d8d6ff" FOREIGN KEY ("bcer_code") REFERENCES "sites"."bce_region_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_questions" ADD CONSTRAINT "FK_14edd82a4bb575de4f9f1cf07fe" FOREIGN KEY ("category_id") REFERENCES "sites"."profile_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_questions" ADD CONSTRAINT "FK_49ae5cf816287627cfd33bf2e0f" FOREIGN KEY ("parent_id") REFERENCES "sites"."profile_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" ADD CONSTRAINT "FK_938ad8c705f3e2de4f81f3af1ef" FOREIGN KEY ("question_id") REFERENCES "sites"."profile_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" ADD CONSTRAINT "FK_fcba3242e7d187740cf099e5c66" FOREIGN KEY ("site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" ADD CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab" FOREIGN KEY ("sprof_site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" ADD CONSTRAINT "FK_b5736764024c5bf47c39f934971" FOREIGN KEY ("submcd_code") REFERENCES "sites"."submission_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" ADD CONSTRAINT "FK_5d7407888d0e0ead1950c801966" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e" FOREIGN KEY ("dpr_code") REFERENCES "sites"."doc_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_df9a943e1b0b8d86df36971b144" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_ef5d35263f0cc2773256c285647" FOREIGN KEY ("sdoc_id") REFERENCES "sites"."site_docs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" ADD CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "FK_da8e17d429388c732e1cb261efd" FOREIGN KEY ("pr_code") REFERENCES "sites"."partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" ADD CONSTRAINT "FK_4171a309de795d40009f2049ca7" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ADD CONSTRAINT "FK_7a8091ea5132040c323702e7034" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" ADD CONSTRAINT "FK_73ea22c3bcdc161fa9ede8de094" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0" FOREIGN KEY ("site_id", "date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" ADD CONSTRAINT "FK_43192994f2226491bec18fec2cd" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_aafdda946ab5c8dd00cae4d9544" FOREIGN KEY ("completor_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_c67f7496519aa992316fe7b4b21" FOREIGN KEY ("contact_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_07815f2409991b176f8b9ea1755" FOREIGN KEY ("rwm_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_2cca26154be730cfec15ef6cb09" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" ADD CONSTRAINT "FK_371e7c30224542fe70e1b3e84a7" FOREIGN KEY ("site_reg_partic_id") REFERENCES "sites"."site_partics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD CONSTRAINT "FK_abe87fe0b8f899472d78176623d" FOREIGN KEY ("lut_code") REFERENCES "sites"."land_use_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" ADD CONSTRAINT "FK_84d86cc243b265a436e3ab616c3" FOREIGN KEY ("site_id", "sprof_date_completed") REFERENCES "sites"."site_profiles"("site_id","date_completed") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ADD CONSTRAINT "FK_fe1f2b87ee75fdced19793c5765" FOREIGN KEY ("lut_code") REFERENCES "sites"."land_use_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" ADD CONSTRAINT "FK_97f4d0a979dd72e13d095ef20fe" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "FK_25c8c940d25f3407fbff0e00d9e" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" ADD CONSTRAINT "FK_fad080594a9ae08bb4a3faacdb9" FOREIGN KEY ("site_id_associated_with") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" ADD CONSTRAINT "FK_a832b6c43076e628fe78d50fb45" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_contamination_class_xref" ADD CONSTRAINT "FK_d55e2c28916898fb8709cead017" FOREIGN KEY ("contamination_class_code") REFERENCES "sites"."contamination_class_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_contamination_class_xref" ADD CONSTRAINT "FK_13b56121c4098b587b4fdbd0175" FOREIGN KEY ("sclc_id") REFERENCES "sites"."site_crown_land_contaminated"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ADD CONSTRAINT "FK_6eda683ea614a412d989c0a7451" FOREIGN KEY ("id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ADD CONSTRAINT "FK_2c5f5026d5645f6af23b5e3dd75" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" ADD CONSTRAINT "FK_d6b2ef003392e7f94acb0a76081" FOREIGN KEY ("site_crown_land_status_code") REFERENCES "sites"."site_crown_land_status_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."recent_views" ADD CONSTRAINT "FK_8a9cc9a0a106e585a3df1097a60" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" ADD CONSTRAINT "FK_786430d3af1f2ba1cd0f71590b5" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ADD CONSTRAINT "FK_fbd36524edbb3b52d4062de0d00" FOREIGN KEY ("bcer_code") REFERENCES "sites"."bce_region_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ADD CONSTRAINT "FK_ae06e875ad4cd80ba5a8d110699" FOREIGN KEY ("class_code") REFERENCES "sites"."classification_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ADD CONSTRAINT "FK_ce544ec8a4703f5341486694444" FOREIGN KEY ("site_risk_code") REFERENCES "sites"."site_risk_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" ADD CONSTRAINT "FK_6bff1991139b6cbb61870eb9f11" FOREIGN KEY ("sst_code") REFERENCES "sites"."site_status_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."mailout" ADD CONSTRAINT "FK_3bde45d6ea2a31600524ac08422" FOREIGN KEY ("bcer_code") REFERENCES "sites"."bce_region_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."mailout" ADD CONSTRAINT "FK_df8d8ef2f6f749ca8178143534d" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."mailout" ADD CONSTRAINT "FK_0377a38291463564bca530aa113" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sis_addresses" ADD CONSTRAINT "FK_182f20c89cd73a826528fe101e2" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" ADD CONSTRAINT "FK_6a823f4bdaf2485661fa50b8246" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."people_orgs" ADD CONSTRAINT "FK_689cb78e07c25d64080a1328600" FOREIGN KEY ("bcer_code") REFERENCES "sites"."bce_region_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_8644abc153426cfacb67a8f5602" FOREIGN KEY ("epr_code") REFERENCES "sites"."event_partic_role_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_403fc38ed2fc14975735dc004a9" FOREIGN KEY ("event_id") REFERENCES "sites"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_d72a925912888c241f6b3285d3d" FOREIGN KEY ("psnorg_id") REFERENCES "sites"."people_orgs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" ADD CONSTRAINT "FK_80a7d02a903118a3f172b6ced70" FOREIGN KEY ("sp_id") REFERENCES "sites"."site_partics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD CONSTRAINT "FK_07f172ed34b648e7f3282aeb305" FOREIGN KEY ("etyp_code", "ecls_code") REFERENCES "sites"."event_type_cd"("code","ecls_code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" ADD CONSTRAINT "FK_d55da70f86820cf43dbcef6ac04" FOREIGN KEY ("site_id") REFERENCES "sites"."sites"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_type_cd" ADD CONSTRAINT "FK_97683b723351e8fb279ffed9a28" FOREIGN KEY ("ecls_code") REFERENCES "sites"."event_class_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_type_cd" ADD CONSTRAINT "FK_e8dd38f537dc5caa782a80f95e4" FOREIGN KEY ("sst_code") REFERENCES "sites"."site_status_cd"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sites"."event_type_cd" DROP CONSTRAINT "FK_e8dd38f537dc5caa782a80f95e4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_type_cd" DROP CONSTRAINT "FK_97683b723351e8fb279ffed9a28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP CONSTRAINT "FK_d55da70f86820cf43dbcef6ac04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."events" DROP CONSTRAINT "FK_07f172ed34b648e7f3282aeb305"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_80a7d02a903118a3f172b6ced70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_d72a925912888c241f6b3285d3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_403fc38ed2fc14975735dc004a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."event_partics" DROP CONSTRAINT "FK_8644abc153426cfacb67a8f5602"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."people_orgs" DROP CONSTRAINT "FK_689cb78e07c25d64080a1328600"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_staffs" DROP CONSTRAINT "FK_6a823f4bdaf2485661fa50b8246"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sis_addresses" DROP CONSTRAINT "FK_182f20c89cd73a826528fe101e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."mailout" DROP CONSTRAINT "FK_0377a38291463564bca530aa113"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."mailout" DROP CONSTRAINT "FK_df8d8ef2f6f749ca8178143534d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."mailout" DROP CONSTRAINT "FK_3bde45d6ea2a31600524ac08422"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" DROP CONSTRAINT "FK_6bff1991139b6cbb61870eb9f11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" DROP CONSTRAINT "FK_ce544ec8a4703f5341486694444"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" DROP CONSTRAINT "FK_ae06e875ad4cd80ba5a8d110699"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."sites" DROP CONSTRAINT "FK_fbd36524edbb3b52d4062de0d00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."snapshots" DROP CONSTRAINT "FK_786430d3af1f2ba1cd0f71590b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."recent_views" DROP CONSTRAINT "FK_8a9cc9a0a106e585a3df1097a60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" DROP CONSTRAINT "FK_d6b2ef003392e7f94acb0a76081"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" DROP CONSTRAINT "FK_2c5f5026d5645f6af23b5e3dd75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_crown_land_contaminated" DROP CONSTRAINT "FK_6eda683ea614a412d989c0a7451"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_contamination_class_xref" DROP CONSTRAINT "FK_13b56121c4098b587b4fdbd0175"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_contamination_class_xref" DROP CONSTRAINT "FK_d55e2c28916898fb8709cead017"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_subdivisions" DROP CONSTRAINT "FK_a832b6c43076e628fe78d50fb45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "FK_fad080594a9ae08bb4a3faacdb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_assocs" DROP CONSTRAINT "FK_25c8c940d25f3407fbff0e00d9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" DROP CONSTRAINT "FK_97f4d0a979dd72e13d095ef20fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."land_histories" DROP CONSTRAINT "FK_fe1f2b87ee75fdced19793c5765"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP CONSTRAINT "FK_84d86cc243b265a436e3ab616c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_land_uses" DROP CONSTRAINT "FK_abe87fe0b8f899472d78176623d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_371e7c30224542fe70e1b3e84a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profiles" DROP CONSTRAINT "FK_2cca26154be730cfec15ef6cb09"`,
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
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_43192994f2226491bec18fec2cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_profile_owners" DROP CONSTRAINT "FK_4d14bbf4faba151de1fd6c6f4d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" DROP CONSTRAINT "FK_73ea22c3bcdc161fa9ede8de094"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partics" DROP CONSTRAINT "FK_7a8091ea5132040c323702e7034"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "FK_4171a309de795d40009f2049ca7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_partic_roles" DROP CONSTRAINT "FK_da8e17d429388c732e1cb261efd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_3f4c5169ec89b93e7509ab26f37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_ef5d35263f0cc2773256c285647"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_df9a943e1b0b8d86df36971b144"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_doc_partics" DROP CONSTRAINT "FK_4f9b4ac9bd8d02e44e73516902e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."site_docs" DROP CONSTRAINT "FK_5d7407888d0e0ead1950c801966"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" DROP CONSTRAINT "FK_b5736764024c5bf47c39f934971"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_submissions" DROP CONSTRAINT "FK_b24bc419d1131f423acf44fb9ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" DROP CONSTRAINT "FK_fcba3242e7d187740cf099e5c66"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_answers" DROP CONSTRAINT "FK_938ad8c705f3e2de4f81f3af1ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_questions" DROP CONSTRAINT "FK_49ae5cf816287627cfd33bf2e0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."profile_questions" DROP CONSTRAINT "FK_14edd82a4bb575de4f9f1cf07fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."city_regions" DROP CONSTRAINT "FK_33e181f6ff3eddb414d71d8d6ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sites"."conditions_text" DROP CONSTRAINT "FK_eafccfd90e6ea26bb25396c5a27"`,
    );
    await queryRunner.query(`DROP TABLE "sites"."lto_download"`);
    await queryRunner.query(`DROP TABLE "sites"."lto_prev_download"`);
    await queryRunner.query(`DROP TABLE "sites"."plan_table"`);
    await queryRunner.query(`DROP INDEX "sites"."sitereg_bco"`);
    await queryRunner.query(`DROP INDEX "sites"."site_registry_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."site_registry"`);
    await queryRunner.query(`DROP TABLE "sites"."site_registry_module"`);
    await queryRunner.query(`DROP INDEX "sites"."spatial_ref_sys_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."spatial_ref_sys"`);
    await queryRunner.query(`DROP INDEX "sites"."site_status_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."site_status_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."event_type_cd_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."etyp_classified_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."etyp_related_to_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."event_type_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."event_described_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."events_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."event_psnorg_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."event_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."event_rwm_note_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."event_applicable_to_frgn"`);
    await queryRunner.query(
      `DROP INDEX "sites"."event_responsibility_of_frgn"`,
    );
    await queryRunner.query(`DROP TABLE "sites"."events"`);
    await queryRunner.query(`DROP INDEX "sites"."event_partics_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."ep_classified_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."ep_playing_a_role_i_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."ep_psnorg_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."ep_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."ep_played_by_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."event_partics"`);
    await queryRunner.query(`DROP INDEX "sites"."psnorg_working_within_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."people_orgs_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."people_orgs"`);
    await queryRunner.query(`DROP INDEX "sites"."site_staffs_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."site_staff_employed_as_frgn"`);
    await queryRunner.query(
      `DROP INDEX "sites"."site_staffs_psnorg_id_start_date_key"`,
    );
    await queryRunner.query(`DROP TABLE "sites"."site_staffs"`);
    await queryRunner.query(`DROP INDEX "sites"."sis_addresses_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."addr_a_location_for_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."sis_addresses"`);
    await queryRunner.query(`DROP INDEX "sites"."mailout_bcer_code"`);
    await queryRunner.query(`DROP INDEX "sites"."mailout_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."mailout"`);
    await queryRunner.query(`DROP INDEX "sites"."bce_region_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."bce_region_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."site_bco"`);
    await queryRunner.query(`DROP INDEX "sites"."site_responsibility_o_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."site_classification"`);
    await queryRunner.query(`DROP INDEX "sites"."site_geom_ddx"`);
    await queryRunner.query(`DROP INDEX "sites"."sites_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."site_gen_desc_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."site_risk_is"`);
    await queryRunner.query(`DROP INDEX "sites"."site_described_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."sites_victoria_file_no_key"`);
    await queryRunner.query(`DROP TABLE "sites"."sites"`);
    await queryRunner.query(`DROP INDEX "sites"."idx_snapshot_user_id"`);
    await queryRunner.query(`DROP INDEX "sites"."idx_snapshot"`);
    await queryRunner.query(`DROP TABLE "sites"."snapshots"`);
    await queryRunner.query(`DROP INDEX "sites"."idx_user_id"`);
    await queryRunner.query(`DROP TABLE "sites"."recent_views"`);
    await queryRunner.query(
      `DROP INDEX "sites"."site_crown_land_contaminated_pkey"`,
    );
    await queryRunner.query(
      `DROP TABLE "sites"."site_crown_land_contaminated"`,
    );
    await queryRunner.query(
      `DROP INDEX "sites"."site_crown_land_status_cd_pkey"`,
    );
    await queryRunner.query(`DROP TABLE "sites"."site_crown_land_status_cd"`);
    await queryRunner.query(
      `DROP INDEX "sites"."site_contamination_class_xref_pkey"`,
    );
    await queryRunner.query(
      `DROP TABLE "sites"."site_contamination_class_xref"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."contamination_class_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."contamination_class_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."site_risk_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."site_risk_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."classification_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."classification_cd"`);
    await queryRunner.query(
      `DROP INDEX "sites"."site_subdivisions_site_id_subdiv_id_sprof_date_completed_key"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."sitesub_part_or_all_of_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."site_subdivisions_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sitesub_for_profile"`);
    await queryRunner.query(`DROP INDEX "sites"."sitesub_comprised_of_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."site_subdivisions"`);
    await queryRunner.query(`DROP INDEX "sites"."sa_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sa_rwm_note_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sa_adjacent_to_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."site_assocs_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sa_associated_with_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."site_assocs"`);
    await queryRunner.query(`DROP INDEX "sites"."land_histories_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sluh_described_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."sluh_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sluh_rwm_note_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sluh_applicable_to_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."land_histories"`);
    await queryRunner.query(`DROP INDEX "sites"."land_use_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."land_use_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."site_profile_land_uses_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."site_profile_land_uses"`);
    await queryRunner.query(`DROP INDEX "sites"."site_profiles_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sprof_rwm_site_partic"`);
    await queryRunner.query(`DROP INDEX "sites"."sprof_site_reg_site_partic"`);
    await queryRunner.query(`DROP TABLE "sites"."site_profiles"`);
    await queryRunner.query(`DROP INDEX "sites"."spown_sprof_fk_i"`);
    await queryRunner.query(`DROP INDEX "sites"."site_profile_owners_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."spown_sp_fk_i"`);
    await queryRunner.query(`DROP TABLE "sites"."site_profile_owners"`);
    await queryRunner.query(`DROP INDEX "sites"."site_partics_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sp_identified_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."sp_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sp_identified_by2_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."site_partics"`);
    await queryRunner.query(`DROP INDEX "sites"."spr_classified_by_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."site_partic_roles_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."spr_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."spr_classifying_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."site_partic_roles"`);
    await queryRunner.query(`DROP INDEX "sites"."partic_role_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."partic_role_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."sdp_classified_by_frgn"`);
    await queryRunner.query(
      `DROP INDEX "sites"."site_doc_partics_sdoc_id_psnorg_id_dpr_code_key"`,
    );
    await queryRunner.query(`DROP INDEX "sites"."site_doc_partics_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sdp_psnorg_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."sdp_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sdp_playing_a_role_i_frgn"`);
    await queryRunner.query(`DROP INDEX "sites"."sdp_played_by_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."site_doc_partics"`);
    await queryRunner.query(`DROP INDEX "sites"."site_docs_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."sdoc_rwm_flag"`);
    await queryRunner.query(`DROP INDEX "sites"."sdoc_about_frgn"`);
    await queryRunner.query(`DROP TABLE "sites"."site_docs"`);
    await queryRunner.query(`DROP INDEX "sites"."doc_partic_role_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."doc_partic_role_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."profile_submissions_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."profsbm_sprof_fk_i"`);
    await queryRunner.query(`DROP INDEX "sites"."profsbm_submcd_fk_i"`);
    await queryRunner.query(`DROP TABLE "sites"."profile_submissions"`);
    await queryRunner.query(`DROP INDEX "sites"."submission_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."submission_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."profile_answers_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."profans_sprof"`);
    await queryRunner.query(`DROP TABLE "sites"."profile_answers"`);
    await queryRunner.query(`DROP INDEX "sites"."profque_cat_seq"`);
    await queryRunner.query(`DROP INDEX "sites"."profque_category_id"`);
    await queryRunner.query(`DROP INDEX "sites"."profile_questions_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."profque_parent_id"`);
    await queryRunner.query(`DROP TABLE "sites"."profile_questions"`);
    await queryRunner.query(`DROP INDEX "sites"."profile_categories_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."profcat_id_seq"`);
    await queryRunner.query(`DROP TABLE "sites"."profile_categories"`);
    await queryRunner.query(`DROP INDEX "sites"."cr_associated_region"`);
    await queryRunner.query(`DROP INDEX "sites"."city_regions_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."city_regions"`);
    await queryRunner.query(`DROP INDEX "sites"."event_partic_role_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."event_partic_role_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."ctext_applied_to"`);
    await queryRunner.query(`DROP INDEX "sites"."ctext_rwm_flag"`);
    await queryRunner.query(`DROP TABLE "sites"."conditions_text"`);
    await queryRunner.query(`DROP INDEX "sites"."event_class_cd_pkey"`);
    await queryRunner.query(`DROP TABLE "sites"."event_class_cd"`);
    await queryRunner.query(`DROP INDEX "sites"."subdivisions_pkey"`);
    await queryRunner.query(`DROP INDEX "sites"."subdivisions_pid_pin_key"`);
    await queryRunner.query(`DROP TABLE "sites"."subdivisions"`);
  }
}
