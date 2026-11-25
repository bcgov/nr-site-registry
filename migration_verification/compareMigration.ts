import { Client } from 'pg';
import { clip, type Diff, sha256 } from './lib/baseline';
import {
  canonicalWkt,
  chunks,
  keyNorm,
  lowerRow,
  norm,
  numericIds,
  oracleIdent,
  pgIdent,
} from './lib/equality';
import { DEFAULT_COLUMNS, EXPECTED_TABLES, NULL_COUNT_COLUMNS } from './lib/findings';
import { forEachOracleRow, oracleQuery, requireOracleEnv, withOracle } from './lib/oracle';
import { exportedTables } from './lib/sqlFile';
import { loadSampleIds } from './generateSample';
import type * as oracledb from 'oracledb';

type Row = Record<string, unknown>;
type OracleColumns = Map<string, Map<string, string>>;
type PgColumns = Map<string, Map<string, { dataType: string; udtName: string }>>;

export interface PgConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

const RULE_COLUMNS = new Set([
  'sr_action',
  'user_action',
  'who_deleted',
  'when_deleted',
  'required_action',
]);

const LOB_TYPES = new Set(['BLOB', 'CLOB', 'NCLOB', 'LONG', 'LONG RAW', 'BFILE', 'UNDEFINED', 'XMLTYPE']);

function log(message: string): void {
  console.error(message);
}

function makeDiff(check: string, table: string, key: string, oracle: string, postgres: string): Diff {
  return { check, table, key, oracle: clip(oracle), postgres: clip(postgres) };
}

function skipped(oracleType: string, pgUdt: string): boolean {
  const oracle = oracleType.toUpperCase();
  const udt = pgUdt.toLowerCase();
  if (oracle.includes('GEOMETRY') || udt === 'geometry' || udt === 'geography') return true;
  if (oracle === 'RAW' || oracle === 'BLOB') return true;
  return false;
}

function assertDigits(ids: readonly string[]): void {
  for (const id of ids) {
    if (!/^\d+$/.test(id)) throw new Error('Refusing a non-numeric id in a SQL list');
  }
}

function rowSignature(row: Row, columns: readonly string[]): string {
  return columns.map((column) => norm(row[column]) ?? '').join('\u0001');
}

function groupRows(rows: readonly Row[], columns: readonly string[], pk: readonly string[]): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = pk.length > 0 ? pk.map((column) => keyNorm(row[column])).join('|') : rowSignature(row, columns);
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  return groups;
}

function describeKeys(label: string, keys: readonly string[]): string {
  const examples = keys.slice(0, 5).join(',');
  return `${label}=${keys.length} examples=${examples} sha256=${sha256(keys)}`;
}

function sharedColumns(
  oracleCols: Map<string, string>,
  pgCols: Map<string, { dataType: string; udtName: string }>,
): string[] {
  const names: string[] = [];
  for (const [name, oracleType] of oracleCols) {
    const pg = pgCols.get(name);
    if (!pg || RULE_COLUMNS.has(name) || skipped(oracleType, pg.udtName)) continue;
    names.push(name);
  }
  return names.sort();
}

async function forEachPgRow(
  client: Client,
  sql: string,
  params: unknown[],
  onRow: (row: Row) => void,
): Promise<void> {
  await client.query('BEGIN');
  try {
    await client.query(`DECLARE verify_cursor NO SCROLL CURSOR FOR ${sql}`, params);
    while (true) {
      const result = await client.query('FETCH 5000 FROM verify_cursor');
      if (result.rows.length === 0) break;
      for (const row of result.rows as Row[]) onRow(lowerRow(row));
    }
    await client.query('CLOSE verify_cursor');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function loadOracleColumns(connection: oracledb.Connection, tables: readonly string[]): Promise<OracleColumns> {
  const list = tables.map((table) => `'${table.toUpperCase()}'`).join(', ');
  const rows = await oracleQuery(
    connection,
    `SELECT table_name, column_name, data_type
     FROM all_tab_columns
     WHERE owner = 'SIS' AND table_name IN (${list})`,
  );
  const map: OracleColumns = new Map();
  for (const row of rows) {
    const table = String(row.table_name).toLowerCase();
    const columns = map.get(table) ?? new Map<string, string>();
    columns.set(String(row.column_name).toLowerCase(), String(row.data_type));
    map.set(table, columns);
  }
  return map;
}

async function loadPrimaryKeys(
  connection: oracledb.Connection,
  tables: readonly string[],
): Promise<Map<string, string[]>> {
  const list = tables.map((table) => `'${table.toUpperCase()}'`).join(', ');
  const rows = await oracleQuery(
    connection,
    `SELECT cons.table_name AS table_name, cols.column_name AS column_name, cols.position AS position
     FROM all_constraints cons
     JOIN all_cons_columns cols
       ON cons.owner = cols.owner AND cons.constraint_name = cols.constraint_name
     WHERE cons.owner = 'SIS'
       AND cons.constraint_type = 'P'
       AND cons.table_name IN (${list})
     ORDER BY cons.table_name, cols.position`,
  );
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const table = String(row.table_name).toLowerCase();
    const columns = map.get(table) ?? [];
    columns.push(String(row.column_name).toLowerCase());
    map.set(table, columns);
  }
  return map;
}

async function loadPgColumns(client: Client): Promise<PgColumns> {
  const result = await client.query(
    `SELECT table_name, column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_schema = 'sites'`,
  );
  const map: PgColumns = new Map();
  for (const row of result.rows as Row[]) {
    const table = String(row.table_name);
    const columns = map.get(table) ?? new Map();
    columns.set(String(row.column_name), {
      dataType: String(row.data_type),
      udtName: String(row.udt_name),
    });
    map.set(table, columns);
  }
  return map;
}

async function countOracle(connection: oracledb.Connection, table: string): Promise<number> {
  const rows = await oracleQuery(connection, `SELECT COUNT(*) AS n FROM SIS.${oracleIdent(table)}`);
  return Number(rows[0]?.n ?? 0);
}

async function countPg(client: Client, table: string): Promise<number> {
  const result = await client.query(`SELECT COUNT(*)::bigint AS n FROM sites.${pgIdent(table)}`);
  return Number((result.rows[0] as Row | undefined)?.n ?? 0);
}

function selectList(columns: readonly string[], ident: (name: string) => string): string {
  return columns.map((column) => ident(column)).join(', ');
}

async function fetchOracleRows(
  connection: oracledb.Connection,
  table: string,
  columns: readonly string[],
  predicate: (idList: string) => string,
  ids: readonly string[],
): Promise<Row[]> {
  if (ids.length === 0 || columns.length === 0) return [];
  assertDigits(ids);
  const rows: Row[] = [];
  for (const chunk of chunks(ids, 400)) {
    const sql = `SELECT ${selectList(columns, oracleIdent)} FROM SIS.${oracleIdent(table)} WHERE ${predicate(chunk.join(', '))}`;
    rows.push(...(await oracleQuery(connection, sql)));
  }
  return rows;
}

async function fetchPgRows(
  client: Client,
  table: string,
  columns: readonly string[],
  predicate: string,
  ids: readonly string[],
): Promise<Row[]> {
  if (ids.length === 0 || columns.length === 0) return [];
  const result = await client.query(
    `SELECT ${selectList(columns, pgIdent)} FROM sites.${pgIdent(table)} WHERE ${predicate}`,
    [ids],
  );
  return (result.rows as Row[]).map((row) => lowerRow(row));
}

function compareRowSets(
  table: string,
  oracleRows: readonly Row[],
  pgRows: readonly Row[],
  columns: readonly string[],
  pk: readonly string[],
  diffs: Diff[],
): void {
  if (columns.length === 0) return;
  const oracleGroups = groupRows(oracleRows, columns, pk);
  const pgGroups = groupRows(pgRows, columns, pk);
  const keys = [...new Set([...oracleGroups.keys(), ...pgGroups.keys()])].sort();
  const mismatchParts: string[] = [];
  const examples: Diff[] = [];
  let mismatches = 0;
  for (const key of keys) {
    const left = [...(oracleGroups.get(key) ?? [])].sort((a, b) =>
      rowSignature(a, columns).localeCompare(rowSignature(b, columns)),
    );
    const right = [...(pgGroups.get(key) ?? [])].sort((a, b) =>
      rowSignature(a, columns).localeCompare(rowSignature(b, columns)),
    );
    const leftSig = left.map((row) => rowSignature(row, columns));
    const rightSig = right.map((row) => rowSignature(row, columns));
    if (leftSig.join('\n') === rightSig.join('\n')) continue;
    mismatches += 1;
    mismatchParts.push(key, leftSig.join('\n'), rightSig.join('\n'));
    if (examples.length >= 5) continue;
    const width = Math.max(left.length, right.length);
    for (let index = 0; index < width; index += 1) {
      const oracleRow = left[index];
      const pgRow = right[index];
      if (!oracleRow || !pgRow) {
        examples.push(makeDiff('field', table, key, oracleRow ? 'present' : '—', pgRow ? 'present' : '—'));
        break;
      }
      if (rowSignature(oracleRow, columns) === rowSignature(pgRow, columns)) continue;
      const column = columns.find((name) => norm(oracleRow[name]) !== norm(pgRow[name]));
      if (column) {
        examples.push(
          makeDiff('field', table, `${key} ${column}`, norm(oracleRow[column]) ?? '—', norm(pgRow[column]) ?? '—'),
        );
      } else {
        examples.push(makeDiff('field', table, key, `rows=${left.length}`, `rows=${right.length}`));
      }
      break;
    }
  }
  if (mismatchParts.length === 0) return;
  diffs.push(
    makeDiff('field-set', table, 'sample', `sha256=${sha256(mismatchParts)}`, `groups=${mismatches}`),
  );
  diffs.push(...examples);
}

function samplePredicate(
  table: string,
  columns: ReadonlySet<string>,
): { oracle: (idList: string) => string; pg: string } | null {
  if (table === 'sites' && columns.has('id')) {
    return {
      oracle: (idList) => `${oracleIdent('id')} IN (${idList})`,
      pg: `${pgIdent('id')} = ANY($1::bigint[])`,
    };
  }
  if (table === 'site_assocs' && columns.has('site_id') && columns.has('site_id_associated_with')) {
    return {
      oracle: (idList) =>
        `(${oracleIdent('site_id')} IN (${idList}) OR ${oracleIdent('site_id_associated_with')} IN (${idList}))`,
      pg: `(${pgIdent('site_id')} = ANY($1::bigint[]) OR ${pgIdent('site_id_associated_with')} = ANY($1::bigint[]))`,
    };
  }
  const column = columns.has('site_id') ? 'site_id' : columns.has('sprof_site_id') ? 'sprof_site_id' : null;
  if (!column) return null;
  return {
    oracle: (idList) => `${oracleIdent(column)} IN (${idList})`,
    pg: `${pgIdent(column)} = ANY($1::bigint[])`,
  };
}

async function compareNullCounts(
  connection: oracledb.Connection,
  client: Client,
  table: string,
  oracleCols: Map<string, string>,
  pgCols: Map<string, { dataType: string; udtName: string }>,
  diffs: Diff[],
): Promise<void> {
  const wanted = NULL_COUNT_COLUMNS[table] ?? [];
  const comparable: string[] = [];
  for (const column of wanted) {
    const inOracle = oracleCols.has(column);
    const inPg = pgCols.has(column);
    if (inOracle && inPg) {
      comparable.push(column);
      continue;
    }
    if (inOracle !== inPg) {
      diffs.push(makeDiff('null-count', table, column, inOracle ? 'column' : 'missing', inPg ? 'column' : 'missing'));
    }
  }
  if (comparable.length === 0) return;
  const oracleExprs = comparable
    .map((column, index) => {
      const ident = oracleIdent(column);
      const type = (oracleCols.get(column) ?? '').toUpperCase();
      const blank = LOB_TYPES.has(type)
        ? `${ident} IS NULL`
        : `${ident} IS NULL OR TRIM(TO_CHAR(${ident})) IS NULL`;
      return `NVL(SUM(CASE WHEN ${blank} THEN 1 ELSE 0 END), 0) AS ${oracleIdent(`c${index}`)}`;
    })
    .join(', ');
  const pgExprs = comparable
    .map((column, index) => {
      const ident = pgIdent(column);
      return `COUNT(*) FILTER (WHERE ${ident} IS NULL OR btrim(${ident}::text) = '') AS ${pgIdent(`c${index}`)}`;
    })
    .join(', ');
  const oracleRows = await oracleQuery(
    connection,
    `SELECT ${oracleExprs} FROM SIS.${oracleIdent(table)}`,
  );
  const pgResult = await client.query(`SELECT ${pgExprs} FROM sites.${pgIdent(table)}`);
  const oracleRow = oracleRows[0] ?? {};
  const pgRow = lowerRow((pgResult.rows[0] ?? {}) as Row);
  comparable.forEach((column, index) => {
    const oracleBlanks = String(oracleRow[`c${index}`] ?? '0');
    const pgBlanks = String(pgRow[`c${index}`] ?? '0');
    if (oracleBlanks === pgBlanks) return;
    diffs.push(makeDiff('null-count', table, column, oracleBlanks, pgBlanks));
  });
}

async function streamKeys(
  client: Client,
  sql: string,
  pk: readonly string[],
): Promise<string[]> {
  const keys: string[] = [];
  await forEachPgRow(client, sql, [], (row) => {
    const key = pk.length > 0 ? pk.map((column) => keyNorm(row[column])).join('|') : keyNorm(row.ctid);
    keys.push(key);
  });
  keys.sort();
  return keys;
}

async function compareSrAction(
  client: Client,
  table: string,
  oracleCols: Map<string, string>,
  pgCols: Map<string, { dataType: string; udtName: string }>,
  pk: readonly string[],
  diffs: Diff[],
): Promise<void> {
  if (!pgCols.has('sr_action') || !oracleCols.has('rwm_flag') || !pgCols.has('rwm_flag')) return;
  const flag = pgIdent('rwm_flag');
  const action = pgIdent('sr_action');
  const contains = `COALESCE(${flag}::text, '') ~ '(^|,)\\s*50\\s*(,|$)'`;
  const where = `(
    (${contains} AND ${action} IS DISTINCT FROM 'public')
    OR (NOT (${contains}) AND ${action} IS NOT NULL AND btrim(${action}) <> '')
  )`;
  const select = pk.length > 0 ? selectList(pk, pgIdent) : 'ctid';
  const keys = await streamKeys(client, `SELECT ${select} FROM sites.${pgIdent(table)} WHERE ${where}`, pk);
  if (keys.length === 0) return;
  diffs.push(
    makeDiff(
      'sr-action',
      table,
      '',
      'public exactly when rwm_flag contains 50',
      describeKeys('violations', keys),
    ),
  );
}

async function compareDefaults(
  client: Client,
  table: string,
  oracleCols: Map<string, string>,
  pgCols: Map<string, { dataType: string; udtName: string }>,
  pk: readonly string[],
  diffs: Diff[],
): Promise<void> {
  for (const column of DEFAULT_COLUMNS) {
    if (!pgCols.has(column) || oracleCols.has(column)) continue;
    const ident = pgIdent(column);
    const select = pk.length > 0 ? selectList(pk, pgIdent) : 'ctid';
    const keys = await streamKeys(
      client,
      `SELECT ${select} FROM sites.${pgIdent(table)} WHERE ${ident} IS NOT NULL AND btrim(${ident}::text) <> ''`,
      pk,
    );
    if (keys.length === 0) continue;
    diffs.push(makeDiff('default', table, column, 'blank', describeKeys('filled', keys)));
  }
}

async function comparePrimaryKeys(
  connection: oracledb.Connection,
  client: Client,
  table: string,
  pk: readonly string[],
  pgCols: Map<string, { dataType: string; udtName: string }>,
  diffs: Diff[],
): Promise<void> {
  if (pk.length === 0) {
    log(`  no primary key; row count only`);
    return;
  }
  const missing = pk.filter((column) => !pgCols.has(column));
  if (missing.length > 0) {
    for (const column of missing) diffs.push(makeDiff('pk-column', table, column, 'present', 'missing'));
    return;
  }
  const oracleKeys = new Set<string>();
  await forEachOracleRow(
    connection,
    `SELECT ${selectList(pk, oracleIdent)} FROM SIS.${oracleIdent(table)}`,
    (row) => {
      oracleKeys.add(pk.map((column) => keyNorm(row[column])).join('|'));
    },
  );
  const extras: string[] = [];
  await forEachPgRow(
    client,
    `SELECT ${selectList(pk, pgIdent)} FROM sites.${pgIdent(table)}`,
    [],
    (row) => {
      const key = pk.map((column) => keyNorm(row[column])).join('|');
      if (oracleKeys.has(key)) oracleKeys.delete(key);
      else extras.push(key);
    },
  );
  const absent = [...oracleKeys].sort();
  extras.sort();
  if (absent.length === 0 && extras.length === 0) return;
  diffs.push(makeDiff('pk-set', table, '', describeKeys('missing', absent), describeKeys('extra', extras)));
}

async function compareGeometry(
  connection: oracledb.Connection,
  client: Client,
  sampleIds: readonly number[],
  diffs: Diff[],
): Promise<void> {
  const typeRows = await oracleQuery(
    connection,
    `SELECT data_type AS data_type
     FROM all_tab_columns
     WHERE owner = 'SIS' AND table_name = 'SITES' AND column_name = 'GEOMETRY'`,
  );
  if (typeRows.length === 0) return;
  const dataType = String(typeRows[0]?.data_type ?? '');
  const expr = dataType.toUpperCase().includes('SDO') ? 'SDO_UTIL.TO_WKTGEOMETRY(geometry)' : 'ST_ASTEXT(geometry)';
  let oracleRows: Row[];
  try {
    oracleRows = await oracleQuery(
      connection,
      `SELECT id AS id, ${expr} AS wkt FROM sis.sites WHERE id IN (${numericIds(sampleIds)})`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    diffs.push(makeDiff('geometry', 'sites', 'probe', message, 'not compared'));
    return;
  }
  const pgResult = await client.query(
    `SELECT id, ST_AsText(geometry) AS wkt FROM sites.sites WHERE id = ANY($1::bigint[])`,
    [sampleIds],
  );
  const oracleMap = new Map(oracleRows.map((row) => [keyNorm(row.id), canonicalWkt(row.wkt)]));
  const pgMap = new Map((pgResult.rows as Row[]).map((row) => [keyNorm(row.id), canonicalWkt(row.wkt)]));
  const mismatchParts: string[] = [];
  const examples: Diff[] = [];
  for (const id of [...new Set([...oracleMap.keys(), ...pgMap.keys()])].sort()) {
    const left = oracleMap.get(id) ?? null;
    const right = pgMap.get(id) ?? null;
    if (left === right) continue;
    mismatchParts.push(`${id}|${left ?? ''}|${right ?? ''}`);
    if (examples.length < 5) {
      examples.push(makeDiff('geometry', 'sites', id, left ?? '—', right ?? '—'));
    }
  }
  if (mismatchParts.length === 0) return;
  diffs.push(
    makeDiff('geometry-set', 'sites', '', `sha256=${sha256(mismatchParts)}`, `mismatches=${mismatchParts.length}`),
  );
  diffs.push(...examples);
}

async function pluck(
  connection: oracledb.Connection,
  client: Client,
  table: string,
  columns: readonly string[],
  predicate: { oracle: (idList: string) => string; pg: string },
  ids: readonly string[],
  oracleColumns: OracleColumns,
  pgColumns: PgColumns,
): Promise<Row[]> {
  if (!oracleColumns.has(table) || !pgColumns.has(table) || ids.length === 0) return [];
  const oracleRows = await fetchOracleRows(connection, table, columns, predicate.oracle, ids);
  const pgRows = await fetchPgRows(client, table, columns, predicate.pg, ids);
  return [...oracleRows, ...pgRows];
}

function addIds(rows: readonly Row[], column: string, into: Set<string>): void {
  for (const row of rows) {
    const value = keyNorm(row[column]);
    if (/^\d+$/.test(value)) into.add(value);
  }
}

async function compareByIds(
  connection: oracledb.Connection,
  client: Client,
  table: string,
  idColumn: string,
  ids: readonly string[],
  oracleColumns: OracleColumns,
  pgColumns: PgColumns,
  primaryKeys: Map<string, string[]>,
  diffs: Diff[],
): Promise<void> {
  const oracleCols = oracleColumns.get(table);
  const pgCols = pgColumns.get(table);
  if (!oracleCols || !pgCols || ids.length === 0) return;
  const comparable = sharedColumns(oracleCols, pgCols);
  const pk = (primaryKeys.get(table) ?? []).filter((column) => oracleCols.has(column) && pgCols.has(column));
  const select = [...new Set([...comparable, ...pk, idColumn])];
  const predicate = {
    oracle: (idList: string) => `${oracleIdent(idColumn)} IN (${idList})`,
    pg: `${pgIdent(idColumn)} = ANY($1::bigint[])`,
  };
  const oracleRows = await fetchOracleRows(connection, table, select, predicate.oracle, ids);
  const pgRows = await fetchPgRows(client, table, select, predicate.pg, ids);
  compareRowSets(table, oracleRows, pgRows, comparable, pk, diffs);
}

async function compareLinked(
  connection: oracledb.Connection,
  client: Client,
  sampleIds: readonly string[],
  oracleColumns: OracleColumns,
  pgColumns: PgColumns,
  primaryKeys: Map<string, string[]>,
  diffs: Diff[],
): Promise<void> {
  const siteFilter = {
    oracle: (idList: string) => `${oracleIdent('site_id')} IN (${idList})`,
    pg: `${pgIdent('site_id')} = ANY($1::bigint[])`,
  };
  const particRows = await pluck(
    connection, client, 'site_partics', ['id', 'psnorg_id'], siteFilter, sampleIds, oracleColumns, pgColumns,
  );
  const eventRows = await pluck(
    connection, client, 'events', ['id', 'psnorg_id'], siteFilter, sampleIds, oracleColumns, pgColumns,
  );
  const docRows = await pluck(
    connection, client, 'site_docs', ['id'], siteFilter, sampleIds, oracleColumns, pgColumns,
  );
  const subdivRows = await pluck(
    connection, client, 'site_subdivisions', ['subdiv_id'], siteFilter, sampleIds, oracleColumns, pgColumns,
  );

  const particIds = new Set<string>();
  const peopleIds = new Set<string>();
  const eventIds = new Set<string>();
  const docIds = new Set<string>();
  const subdivIds = new Set<string>();
  addIds(particRows, 'id', particIds);
  addIds(particRows, 'psnorg_id', peopleIds);
  addIds(eventRows, 'id', eventIds);
  addIds(eventRows, 'psnorg_id', peopleIds);
  addIds(docRows, 'id', docIds);
  addIds(subdivRows, 'subdiv_id', subdivIds);

  const docParticRows = await pluck(
    connection,
    client,
    'site_doc_partics',
    ['psnorg_id'],
    {
      oracle: (idList) => `${oracleIdent('sdoc_id')} IN (${idList})`,
      pg: `${pgIdent('sdoc_id')} = ANY($1::bigint[])`,
    },
    [...docIds],
    oracleColumns,
    pgColumns,
  );
  const eventParticRows = await pluck(
    connection,
    client,
    'event_partics',
    ['psnorg_id'],
    {
      oracle: (idList) => `${oracleIdent('event_id')} IN (${idList})`,
      pg: `${pgIdent('event_id')} = ANY($1::bigint[])`,
    },
    [...eventIds],
    oracleColumns,
    pgColumns,
  );
  addIds(docParticRows, 'psnorg_id', peopleIds);
  addIds(eventParticRows, 'psnorg_id', peopleIds);

  const linked: Array<[string, string, string[]]> = [
    ['people_orgs', 'id', [...peopleIds]],
    ['site_partic_roles', 'sp_id', [...particIds]],
    ['conditions_text', 'event_id', [...eventIds]],
    ['event_partics', 'event_id', [...eventIds]],
    ['site_doc_partics', 'sdoc_id', [...docIds]],
    ['subdivisions', 'id', [...subdivIds]],
  ];
  for (const [table, column, ids] of linked) {
    log(`  linked ${table}`);
    await compareByIds(connection, client, table, column, ids, oracleColumns, pgColumns, primaryKeys, diffs);
  }
}

export async function compareMigration(options: {
  pg: PgConfig;
  sqlFile: string;
  sampleFile: string;
}): Promise<Diff[]> {
  const sampleIds = loadSampleIds(options.sampleFile);
  const sampleIdText = sampleIds.map(String);
  const tables = (await exportedTables(options.sqlFile)).filter((table) => /^[a-z0-9_]+$/.test(table));
  const diffs: Diff[] = [];
  const exported = new Set(tables);
  for (const table of EXPECTED_TABLES) {
    if (!exported.has(table)) diffs.push(makeDiff('exported', table, '', 'expected', 'not in export'));
  }

  const client = new Client(options.pg);
  await client.connect();
  try {
    await withOracle(requireOracleEnv(), async (connection) => {
      const oracleColumns = await loadOracleColumns(connection, tables);
      const pgColumns = await loadPgColumns(client);
      const primaryKeys = await loadPrimaryKeys(connection, tables);
      for (const table of tables) {
        log(table);
        const oracleCols = oracleColumns.get(table) ?? new Map<string, string>();
        const pgCols = pgColumns.get(table);
        if (!pgCols) {
          const oracleCount = await countOracle(connection, table);
          diffs.push(makeDiff('row-count', table, '', String(oracleCount), 'missing'));
          continue;
        }
        const oracleCount = await countOracle(connection, table);
        const pgCount = await countPg(client, table);
        if (oracleCount !== pgCount) {
          diffs.push(makeDiff('row-count', table, '', String(oracleCount), String(pgCount)));
        }
        const pk = primaryKeys.get(table) ?? [];
        await comparePrimaryKeys(connection, client, table, pk, pgCols, diffs);
        await compareNullCounts(connection, client, table, oracleCols, pgCols, diffs);
        await compareSrAction(client, table, oracleCols, pgCols, pk, diffs);
        await compareDefaults(client, table, oracleCols, pgCols, pk, diffs);

        const predicate = samplePredicate(table, new Set(oracleCols.keys()));
        if (!predicate) continue;
        const comparable = sharedColumns(oracleCols, pgCols);
        const usablePk = pk.filter((column) => oracleCols.has(column) && pgCols.has(column));
        const select = [...new Set([...comparable, ...usablePk])];
        const oracleRows = await fetchOracleRows(connection, table, select, predicate.oracle, sampleIdText);
        const pgRows = await fetchPgRows(client, table, select, predicate.pg, sampleIdText);
        compareRowSets(table, oracleRows, pgRows, comparable, usablePk, diffs);
      }
      log('geometry');
      await compareGeometry(connection, client, sampleIds, diffs);
      await compareLinked(connection, client, sampleIdText, oracleColumns, pgColumns, primaryKeys, diffs);
    });
  } finally {
    await client.end();
  }
  return diffs;
}
