import * as path from 'path';

export const VERIFY_DIR = path.resolve(__dirname, '..');
export const REPO_ROOT = path.resolve(VERIFY_DIR, '..');
export const SAMPLE_FILE = path.join(VERIFY_DIR, 'sample-sites.json');
export const BASELINE_FILE = path.join(VERIFY_DIR, 'baseline.json');
export const LAST_DIFF_FILE = path.join(VERIFY_DIR, 'last-diff.json');
export const ORA2PG_DIR = path.join(REPO_ROOT, 'ora2pg');
export const ORA2PG_CONF = path.join(ORA2PG_DIR, 'ora2pg.conf');
/** SQL written by this run's export. */
export const EXPORT_DIR = path.join(VERIFY_DIR, '.export');
export const RAW_SQL = path.join(EXPORT_DIR, 'output.sql');
export const LOAD_SQL = path.join(EXPORT_DIR, 'output_new.sql');
export const MODIFY_DML = path.join(ORA2PG_DIR, 'modify_dml.py');
export const ENTRYPOINT = path.join(ORA2PG_DIR, 'entrypoint.sh');
export const DISABLE_CONSTRAINTS = path.join(ORA2PG_DIR, 'sql', 'disable_constraints.sql');
export const ENABLE_CONSTRAINTS = path.join(ORA2PG_DIR, 'sql', 'enable_constraints.sql');
export const RWM_FLAG_LOGIC = path.join(ORA2PG_DIR, 'db_script', 'rwmFlagLogic.sql');
export const BACKEND_DIR = path.join(REPO_ROOT, 'backend');
