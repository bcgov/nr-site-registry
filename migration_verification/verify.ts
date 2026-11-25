import { spawn } from 'child_process';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Client } from 'pg';
import { formatDiff, isAccepted, loadBaseline, type Diff } from './lib/baseline';
import { compareMigration } from './compareMigration';
import { generateSample } from './generateSample';
import { oracleQuery, requireOracleEnv, withOracle } from './lib/oracle';
import {
  BACKEND_DIR,
  BASELINE_FILE,
  DISABLE_CONSTRAINTS,
  ENABLE_CONSTRAINTS,
  ENTRYPOINT,
  EXPORT_DIR,
  LAST_DIFF_FILE,
  LOAD_SQL,
  MODIFY_DML,
  ORA2PG_CONF,
  ORA2PG_DIR,
  RAW_SQL,
  RWM_FLAG_LOGIC,
  SAMPLE_FILE,
  VERIFY_DIR,
} from './lib/paths';

dotenv.config({ path: path.join(VERIFY_DIR, '.env'), quiet: true });

const CONTAINER = 'migration-verify-pg';
const PORT = 55432;
const DB = 'migration_verify';
const DB_USER = 'postgres';
const DB_PASSWORD = 'postgres';
const IMAGE = 'postgis/postgis:16-3.4';
const ORA2PG_IMAGE = 'site-registry-ora2pg';

function log(message: string): void {
  console.error(message);
}

function connectionText(): string {
  return [
    'Postgres left running for inspection:',
    `  host=localhost port=${PORT} db=${DB} user=${DB_USER}`,
    `  psql "host=localhost port=${PORT} dbname=${DB} user=${DB_USER} password=${DB_PASSWORD}"`,
    `  npm run verify -- --clean`,
  ].join('\n');
}

function run(command: string, args: string[], options?: { cwd?: string; env?: NodeJS.ProcessEnv }): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options?.cwd,
      env: options?.env ?? process.env,
      stdio: ['inherit', 'pipe', 'pipe'],
    });
    child.stdout?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
    child.stderr?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
    child.on('error', (error) => {
      reject(new Error(`${command} failed to start: ${error.message}`));
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with status ${code ?? 'unknown'}`));
    });
  });
}

function exitCode(command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', (error) => reject(new Error(`${command} failed to start: ${error.message}`)));
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeContainer(): Promise<void> {
  await run('docker', ['rm', '-f', CONTAINER]);
}

async function assertDocker(): Promise<void> {
  const code = await exitCode('docker', ['info']);
  if (code !== 0) throw new Error('Docker is not available. Start Docker and run this again.');
}

async function assertLoadFiles(): Promise<void> {
  for (const file of [DISABLE_CONSTRAINTS, ENABLE_CONSTRAINTS, RWM_FLAG_LOGIC, ORA2PG_CONF, MODIFY_DML]) {
    if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  }
  if (!fs.existsSync(path.join(BACKEND_DIR, 'node_modules', 'typeorm'))) {
    throw new Error('backend dependencies are not installed. Run npm install in backend/ before verify.');
  }
}

async function startPostgres(): Promise<void> {
  if ((await exitCode('docker', ['inspect', CONTAINER])) === 0) {
    throw new Error(`${CONTAINER} already exists. Run npm run verify -- --clean before starting another one.`);
  }
  log(`Starting ${IMAGE} as ${CONTAINER} on port ${PORT}`);
  await run('docker', [
    'run',
    '-d',
    '--name',
    CONTAINER,
    '-e',
    `POSTGRES_PASSWORD=${DB_PASSWORD}`,
    '-e',
    `POSTGRES_DB=${DB}`,
    '-p',
    `${PORT}:5432`,
    IMAGE,
  ]);
}

async function waitForPostgres(): Promise<void> {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const code = await exitCode('docker', ['exec', CONTAINER, 'pg_isready', '-U', DB_USER, '-d', DB]);
    if (code === 0) return;
    await sleep(1000);
  }
  throw new Error('Postgres did not become ready');
}

async function psqlCommand(sql: string): Promise<void> {
  await run('docker', [
    'exec',
    CONTAINER,
    'psql',
    '-U',
    DB_USER,
    '-d',
    DB,
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    sql,
  ]);
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function psqlFile(file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'docker',
      ['exec', '-i', CONTAINER, 'psql', '-q', '-U', DB_USER, '-d', DB, '-v', 'ON_ERROR_STOP=1'],
      { stdio: ['pipe', 'pipe', 'pipe'] },
    );
    child.stdout?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
    child.stderr?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
    if (!child.stdin) {
      reject(new Error('psql stdin is not available'));
      return;
    }
    const total = fs.statSync(file).size;
    const showProgress = total >= 1024 * 1024;
    let sent = 0;
    let lastPrint = 0;
    let progressOpen = false;
    const printProgress = (force: boolean): void => {
      if (!showProgress || total === 0) return;
      const now = Date.now();
      if (!force && now - lastPrint < 1000) return;
      lastPrint = now;
      const pct = Math.min(100, Math.floor((sent / total) * 100));
      process.stderr.write(
        `\rLoading ${path.basename(file)}  ${String(pct).padStart(3)}%  ${formatMb(sent)} / ${formatMb(total)}`,
      );
      progressOpen = true;
    };
    const endProgress = (): void => {
      if (!progressOpen) return;
      process.stderr.write('\n');
      progressOpen = false;
    };
    const input = fs.createReadStream(file);
    const stdin = child.stdin;
    input.on('data', (chunk: Buffer | string) => {
      sent += typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
      printProgress(false);
      if (!stdin.write(chunk)) input.pause();
    });
    stdin.on('drain', () => input.resume());
    input.on('end', () => stdin.end());
    input.on('error', (error) => {
      endProgress();
      reject(error);
    });
    child.on('error', (error) => {
      endProgress();
      reject(new Error(`psql failed to start: ${error.message}`));
    });
    child.on('exit', (code) => {
      input.destroy();
      if (showProgress && code === 0) {
        sent = total;
        printProgress(true);
      }
      endProgress();
      if (code === 0) resolve();
      else reject(new Error(`psql ${path.basename(file)} exited with status ${code ?? 'unknown'}`));
    });
  });
}

async function buildOra2pgImage(): Promise<void> {
  // ora2pg/Dockerfile installs the x86_64 Oracle instant client, so this image
  // is amd64 even when the host is Apple Silicon.
  const args = ['build', '--platform', 'linux/amd64', '-t', ORA2PG_IMAGE, ORA2PG_DIR];
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (attempt > 1) {
      log(`Docker Hub did not answer. Retrying the ${ORA2PG_IMAGE} build (${attempt}/3).`);
      await sleep(5000);
    } else {
      log(`Building ${ORA2PG_IMAGE}`);
    }
    try {
      await run('docker', args);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`docker build exited`);
}

/** node-oracledb uses host:port/service. ora2pg's --source flag is a DBI DSN. */
function ora2pgDsn(connectString: string): string {
  if (connectString.startsWith('dbi:')) return connectString;
  const match = /^([^:/]+):(\d+)\/(.+)$/.exec(connectString);
  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error('ORACLE_CONN_STRING must look like host:port/service');
  }
  return `dbi:Oracle:host=${match[1]};port=${match[2]};service_name=${match[3]}`;
}

async function exportOracle(): Promise<void> {
  fs.rmSync(EXPORT_DIR, { recursive: true, force: true });
  fs.mkdirSync(EXPORT_DIR);
  const startedAt = Date.now();
  if ((await exitCode('docker', ['image', 'inspect', ORA2PG_IMAGE])) !== 0) {
    await buildOra2pgImage();
  } else {
    log(`Using image ${ORA2PG_IMAGE}. Remove it to rebuild the Dockerfile.`);
  }
  const env = requireOracleEnv();
  const envFile = path.join(os.tmpdir(), `migration-verify-ora-${process.pid}.env`);
  fs.writeFileSync(
    envFile,
    `ORA_HOST=${ora2pgDsn(env.connectString)}\nORA_USER=${env.user}\nORA_PWD=${env.password}\n`,
    { mode: 0o600 },
  );
  try {
    log('Exporting production Oracle into migration_verification/.export.');
    await run('docker', [
      'run',
      '--rm',
      '--platform',
      'linux/amd64',
      '--env-file',
      envFile,
      '-v',
      `${ORA2PG_CONF}:/config/ora2pg.conf:ro`,
      '-v',
      `${EXPORT_DIR}:/data`,
      '-v',
      `${MODIFY_DML}:/modify_dml.py:ro`,
      '-v',
      `${ENTRYPOINT}:/usr/bin/entrypoint.sh:ro`,
      ORA2PG_IMAGE,
    ]);
  } finally {
    fs.rmSync(envFile, { force: true });
  }
  for (const file of [RAW_SQL, LOAD_SQL]) {
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      throw new Error(`Export did not write ${file}.`);
    }
  }
  if (fs.statSync(RAW_SQL).mtimeMs < startedAt) {
    throw new Error('ora2pg did not write a new output.sql for this run.');
  }
}

async function prepareSchema(): Promise<void> {
  log('Creating PostGIS and the sites schema');
  await psqlCommand('CREATE EXTENSION IF NOT EXISTS postgis; CREATE SCHEMA IF NOT EXISTS sites;');
  log('Running TypeORM migrations');
  await run('npm', ['run', 'typeorm:run-migrations'], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: String(PORT),
      POSTGRES_DB_USERNAME: DB_USER,
      POSTGRES_DB_PASSWORD: DB_PASSWORD,
      POSTGRES_DATABASE: DB,
      POSTGRES_DB_SCHEMA: 'sites',
    },
  });
}

function asTime(value: unknown): number | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
  }
  return null;
}

async function assertSnapshotIsCurrent(): Promise<void> {
  const oracle = await withOracle(requireOracleEnv(), async (connection) => {
    const rows = await oracleQuery(
      connection,
      'SELECT MAX(id) AS max_id, MAX(when_updated) AS max_updated FROM sis.sites',
    );
    return rows[0] ?? {};
  });
  const client = new Client({
    host: 'localhost',
    port: PORT,
    database: DB,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await client.connect();
  let loaded: Record<string, unknown>;
  try {
    const result = await client.query(
      'SELECT MAX(id) AS max_id, MAX(when_updated) AS max_updated FROM sites.sites',
    );
    loaded = (result.rows[0] ?? {}) as Record<string, unknown>;
  } finally {
    await client.end();
  }
  const oracleId = String(oracle.max_id ?? '');
  const loadedId = String(loaded.max_id ?? '');
  const oracleUpdated = asTime(oracle.max_updated);
  const loadedUpdated = asTime(loaded.max_updated);
  const staleHours =
    oracleUpdated !== null && loadedUpdated !== null ? (oracleUpdated - loadedUpdated) / 36e5 : null;
  if (staleHours !== null && staleHours > 24) {
    const oracleDate = new Date(oracleUpdated ?? 0).toISOString().slice(0, 10);
    const loadedDate = new Date(loadedUpdated ?? 0).toISOString().slice(0, 10);
    throw new Error(
      `The loaded snapshot is not current production. sites max id Oracle ${oracleId}, Postgres ${loadedId}. Newest when_updated Oracle ${oracleDate}, Postgres ${loadedDate}. Refusing the row-by-row compare.`,
    );
  }
}

async function loadData(): Promise<void> {
  log('Disabling triggers');
  await psqlFile(DISABLE_CONSTRAINTS);
  await psqlFile(LOAD_SQL);
  log('Applying rwmFlagLogic.sql');
  await psqlFile(RWM_FLAG_LOGIC);
  log('Enabling triggers');
  await psqlFile(ENABLE_CONSTRAINTS);
}

function report(diffs: Diff[]): number {
  const baseline = loadBaseline(BASELINE_FILE);
  const unaccepted = diffs.filter((entry) => !isAccepted(baseline, entry));
  const accepted = diffs.length - unaccepted.length;
  for (const entry of unaccepted.slice(0, 200)) console.log(formatDiff(entry));
  if (unaccepted.length > 200) {
    console.log(`... ${unaccepted.length - 200} more difference(s) in ${LAST_DIFF_FILE}`);
  }
  if (unaccepted.length > 0) {
    fs.writeFileSync(
      LAST_DIFF_FILE,
      `${JSON.stringify(
        unaccepted.map((entry) => ({ ...entry, reason: '' })),
        null,
        2,
      )}\n`,
    );
    log(`${unaccepted.length} unaccepted difference(s), ${accepted} matched the baseline.`);
    log(`Full list: ${LAST_DIFF_FILE}`);
    log('Add an entry to baseline.json, with a reason, only for a difference you intend to keep.');
    return 1;
  }
  fs.rmSync(LAST_DIFF_FILE, { force: true });
  log(diffs.length === 0 ? 'No differences.' : `${accepted} difference(s) matched the baseline.`);
  return 0;
}

function parseArgs(argv: readonly string[]): { clean: boolean; reuse: boolean; generate: boolean } {
  const known = new Set(['--clean', '--reuse', '--generate-sample']);
  for (const arg of argv) {
    if (!known.has(arg)) throw new Error(`Unknown argument ${arg}`);
  }
  const clean = argv.includes('--clean');
  const reuse = argv.includes('--reuse');
  const generate = argv.includes('--generate-sample');
  if ([clean, reuse, generate].filter(Boolean).length > 1) {
    throw new Error('Use only one of --clean, --reuse, or --generate-sample');
  }
  return { clean, reuse, generate };
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.clean) {
    await assertDocker();
    if ((await exitCode('docker', ['inspect', CONTAINER])) !== 0) {
      log(`${CONTAINER} is not running`);
      return 0;
    }
    await removeContainer();
    log(`Removed ${CONTAINER}`);
    return 0;
  }
  if (args.generate) {
    await generateSample(SAMPLE_FILE);
    return 0;
  }

  await assertDocker();
  await assertLoadFiles();
  if (!fs.existsSync(SAMPLE_FILE)) {
    throw new Error(`Missing ${SAMPLE_FILE}. Run npm run verify -- --generate-sample`);
  }
  if (!fs.existsSync(BASELINE_FILE)) {
    throw new Error(`Missing ${BASELINE_FILE}`);
  }
  if (args.reuse && !fs.existsSync(LOAD_SQL)) {
    throw new Error(`--reuse needs ${LOAD_SQL}. Run a full export first.`);
  }
  if (!args.reuse) requireOracleEnv();

  let started = false;
  let loaded = false;
  const onInterrupt = (): void => {
    log('\nInterrupted.');
    if (started && loaded) log(connectionText());
    process.exit(1);
  };
  process.on('SIGINT', onInterrupt);
  try {
    await startPostgres();
    started = true;
    const ready = waitForPostgres();
    if (!args.reuse) await exportOracle();
    await ready;
    await prepareSchema();
    loaded = true;
    await loadData();
    log('Checking the snapshot against current production');
    await assertSnapshotIsCurrent();
    log('Comparing stored values');
    const diffs = await compareMigration({
      pg: {
        host: 'localhost',
        port: PORT,
        database: DB,
        user: DB_USER,
        password: DB_PASSWORD,
      },
      sqlFile: LOAD_SQL,
      sampleFile: SAMPLE_FILE,
    });
    const status = report(diffs);
    if (status === 0) {
      await removeContainer();
      started = false;
    } else {
      log(connectionText());
    }
    return status;
  } catch (error) {
    log(error instanceof Error ? error.message : String(error));
    if (started && loaded) {
      log(connectionText());
    } else if (started) {
      log('Removing the empty database.');
      await removeContainer().catch(() => undefined);
    }
    return 1;
  } finally {
    process.off('SIGINT', onInterrupt);
  }
}

main()
  .then((status) => process.exit(status))
  .catch((error: unknown) => {
    log(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
