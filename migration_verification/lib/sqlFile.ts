import * as fs from 'fs';
import * as readline from 'readline';

const INSERT_RE = /^INSERT INTO\s+(?:sites\.)?("?)([a-z0-9_]+)\1\b/i;
const COPY_RE = /^COPY\s+(?:sites\.)?("?)([a-z0-9_]+)\1\b/i;

export async function exportedTables(sqlFile: string): Promise<string[]> {
  const names = new Set<string>();
  const stream = fs.createReadStream(sqlFile);
  const lines = readline.createInterface({ input: stream, crlfDelay: Infinity });
  try {
    for await (const line of lines) {
      const trimmed = line.trimStart();
      const match = INSERT_RE.exec(trimmed) ?? COPY_RE.exec(trimmed);
      const name = match?.[2];
      if (name) names.add(name.toLowerCase());
    }
  } finally {
    lines.close();
    stream.destroy();
  }
  if (names.size === 0) {
    throw new Error(`${sqlFile} has no INSERT or COPY statements`);
  }
  return [...names].sort();
}
