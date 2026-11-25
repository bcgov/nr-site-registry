/** Columns whose blank counts are compared on every exported row. */
export const NULL_COUNT_COLUMNS: Record<string, readonly string[]> = {
  sites: [
    'addr_line_1',
    'addr_line_2',
    'addr_line_3',
    'addr_line_4',
    'city',
    'postal_code',
    'general_description',
    'common_name',
  ],
  site_registry: ['reg_flag', 'init_approval_date', 'last_approval_date', 'tombstone_date'],
  site_assocs: ['site_id', 'site_id_associated_with'],
  site_profiles: [
    'local_auth_name',
    'local_auth_agency',
    'local_auth_address1',
    'local_auth_phone_no',
    'local_auth_email',
    'owner_partic_id',
    'completor_partic_id',
    'contact_partic_id',
    'site_address',
    'site_city',
    'site_postal_code',
    'number_of_pids',
    'number_of_pins',
    'rwm_partic_id',
  ],
  site_profile_owners: ['sp_id', 'owner_company_contact'],
  site_profile_land_uses: ['lut_code'],
  profile_answers: ['question_id'],
  profile_submissions: ['submcd_code'],
  events: ['requirement_due_date', 'requirement_received_date', 'note', 'event_date', 'who_created'],
  site_partics: ['psnorg_id', 'who_created', 'effective_date', 'note'],
  site_partic_roles: ['pr_code'],
  people_orgs: ['display_name', 'first_name', 'last_name'],
  site_docs: ['title', 'document_date', 'submission_date'],
  site_subdivisions: ['site_id', 'subdiv_id'],
  subdivisions: ['pid', 'pin', 'legal_description'],
};

/** Tables the UAT findings depend on. Absence from the export is a failure. */
export const EXPECTED_TABLES: readonly string[] = [
  'sites',
  'site_registry',
  'site_assocs',
  'site_profiles',
  'site_profile_owners',
  'site_profile_land_uses',
  'profile_answers',
  'profile_submissions',
  'events',
  'conditions_text',
  'site_partics',
  'site_partic_roles',
  'people_orgs',
  'site_docs',
  'site_doc_partics',
  'site_subdivisions',
  'subdivisions',
];

/** Postgres columns the load must leave at their default when Oracle has no such column. */
export const DEFAULT_COLUMNS: readonly string[] = ['who_deleted', 'when_deleted', 'required_action'];

export const STRATUM_LIMIT = 15;

export const STRATA: Record<string, string> = {
  registry: 'EXISTS (SELECT 1 FROM sis.site_registry r WHERE r.site_id = s.id)',
  disclosure: 'EXISTS (SELECT 1 FROM sis.site_profiles p WHERE p.site_id = s.id)',
  'requirement-dates': `EXISTS (
      SELECT 1 FROM sis.events e
      WHERE e.site_id = s.id
        AND (e.requirement_due_date IS NOT NULL OR e.requirement_received_date IS NOT NULL)
    )`,
  associations: `EXISTS (
      SELECT 1 FROM sis.site_assocs a
      WHERE a.site_id = s.id OR a.site_id_associated_with = s.id
    )`,
  documents: 'EXISTS (SELECT 1 FROM sis.site_docs d WHERE d.site_id = s.id)',
  participants: 'EXISTS (SELECT 1 FROM sis.site_partics p WHERE p.site_id = s.id)',
  subdivisions: 'EXISTS (SELECT 1 FROM sis.site_subdivisions sd WHERE sd.site_id = s.id)',
  'public-flag':
    "REGEXP_LIKE(NVL(TO_CHAR(s.rwm_flag), ' '), '(^|,)\\s*50\\s*(,|$)')",
  'internal-flag':
    "NOT REGEXP_LIKE(NVL(TO_CHAR(s.rwm_flag), ' '), '(^|,)\\s*50\\s*(,|$)')",
};
