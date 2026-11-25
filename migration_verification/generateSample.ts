import * as fs from 'fs';
import { STRATA, STRATUM_LIMIT } from './lib/findings';
import { oracleQuery, requireOracleEnv, withOracle } from './lib/oracle';
import { SAMPLE_FILE } from './lib/paths';

export interface SampleFile {
  generatedAt: string;
  limitPerStratum: number;
  uatIds: number[];
  strata: Record<string, number[]>;
  ids: number[];
}

function existingUatIds(file: string): number[] {
  if (!fs.existsSync(file)) return [];
  const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (parsed === null || typeof parsed !== 'object' || !Array.isArray((parsed as { uatIds?: unknown }).uatIds)) {
    return [];
  }
  return (parsed as { uatIds: unknown[] }).uatIds.filter(
    (id): id is number => typeof id === 'number' && Number.isInteger(id),
  );
}

export function loadSampleIds(file: string): number[] {
  const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (parsed === null || typeof parsed !== 'object' || !Array.isArray((parsed as { ids?: unknown }).ids)) {
    throw new Error(`${file} has no ids. Run npm run verify -- --generate-sample`);
  }
  const ids = (parsed as { ids: unknown[] }).ids.map((id) => {
    if (typeof id !== 'number' || !Number.isInteger(id)) {
      throw new Error(`${file} contains a non-integer id`);
    }
    return id;
  });
  if (ids.length === 0) {
    throw new Error(`${file} has no ids. Run npm run verify -- --generate-sample`);
  }
  return ids;
}

function stratumSql(predicate: string): string {
  return `
    SELECT id FROM (
      SELECT s.id AS id
      FROM sis.sites s
      WHERE ${predicate}
      ORDER BY s.id
    )
    WHERE ROWNUM <= ${STRATUM_LIMIT}
  `;
}

function readId(row: Record<string, unknown>): number {
  const value = row.id;
  const id = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(id)) {
    throw new Error('Oracle returned a site id that is not an integer');
  }
  return id;
}

export async function generateSample(outFile: string = SAMPLE_FILE): Promise<SampleFile> {
  const uatIds = existingUatIds(outFile);
  const strata: Record<string, number[]> = {};
  await withOracle(requireOracleEnv(), async (connection) => {
    for (const [name, predicate] of Object.entries(STRATA)) {
      const rows = await oracleQuery(connection, stratumSql(predicate));
      strata[name] = rows.map(readId);
      console.error(`${name} ${strata[name]?.length ?? 0}`);
    }
  });
  const ids = [...new Set([...uatIds, ...Object.values(strata).flat()])].sort(
    (left, right) => left - right,
  );
  const sample: SampleFile = {
    generatedAt: new Date().toISOString(),
    limitPerStratum: STRATUM_LIMIT,
    uatIds,
    strata,
    ids,
  };
  fs.writeFileSync(outFile, `${JSON.stringify(sample, null, 2)}\n`);
  console.error(`uat ${uatIds.length}`);
  console.error(`unique ${ids.length}`);
  console.error(`wrote ${outFile}`);
  return sample;
}
