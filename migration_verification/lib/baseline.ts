import * as crypto from 'crypto';
import * as fs from 'fs';

export interface Diff {
  check: string;
  table: string;
  key: string;
  oracle: string;
  postgres: string;
}

export interface BaselineEntry extends Diff {
  reason: string;
}

const CLIP = 180;

export function clip(value: string): string {
  if (value.length <= 200) return value;
  const hash = crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
  return `${value.slice(0, CLIP)}…#${hash}`;
}

export function loadBaseline(file: string): BaselineEntry[] {
  const parsed: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as { accept?: unknown }).accept)
  ) {
    throw new Error(`${file} must be a JSON object with an accept array`);
  }
  return (parsed as { accept: unknown[] }).accept.map((entry, index) => {
    if (!isBaselineEntry(entry)) {
      throw new Error(`${file} accept[${index}] is missing check, table, key, oracle, postgres, or reason`);
    }
    if (entry.reason.trim() === '') {
      throw new Error(`${file} accept[${index}] needs a reason`);
    }
    return entry;
  });
}

function isBaselineEntry(value: unknown): value is BaselineEntry {
  if (value === null || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.check === 'string' &&
    typeof entry.table === 'string' &&
    typeof entry.key === 'string' &&
    typeof entry.oracle === 'string' &&
    typeof entry.postgres === 'string' &&
    typeof entry.reason === 'string'
  );
}

export function isAccepted(entries: readonly BaselineEntry[], diff: Diff): boolean {
  return entries.some(
    (entry) =>
      entry.check === diff.check &&
      entry.table === diff.table &&
      entry.key === diff.key &&
      entry.oracle === diff.oracle &&
      entry.postgres === diff.postgres,
  );
}

export function formatDiff(diff: Diff): string {
  const key = diff.key === '' ? '' : `  ${diff.key}`;
  return `${diff.check}  ${diff.table}${key}  oracle=${diff.oracle}  postgres=${diff.postgres}`;
}

export function sha256(parts: readonly string[]): string {
  const hash = crypto.createHash('sha256');
  for (const part of parts) {
    hash.update(part);
    hash.update('\0');
  }
  return hash.digest('hex');
}
