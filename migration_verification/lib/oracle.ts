import * as oracledb from 'oracledb';
import { lowerRow } from './equality';

export interface OracleEnv {
  user: string;
  password: string;
  connectString: string;
}

export function requireOracleEnv(): OracleEnv {
  const user = process.env.ORACLE_USER ?? '';
  const password = process.env.ORACLE_PASSWORD ?? '';
  const connectString = process.env.ORACLE_CONN_STRING ?? '';
  const values: Array<[string, string]> = [
    ['ORACLE_USER', user],
    ['ORACLE_PASSWORD', password],
    ['ORACLE_CONN_STRING', connectString],
  ];
  for (const [name, value] of values) {
    if (value === '' || value.includes('<<')) {
      throw new Error(`${name} is not set in migration_verification/.env`);
    }
    if (/[\r\n]/.test(value)) {
      throw new Error(`${name} contains a newline`);
    }
  }
  return { user, password, connectString };
}

export async function withOracle<T>(
  env: OracleEnv,
  fn: (connection: oracledb.Connection) => Promise<T>,
): Promise<T> {
  (oracledb as unknown as { fetchAsString: unknown[] }).fetchAsString = [oracledb.CLOB];
  const connection = await oracledb.getConnection({
    user: env.user,
    password: env.password,
    connectString: env.connectString,
  });
  try {
    return await fn(connection);
  } finally {
    await connection.close();
  }
}

export async function oracleQuery(
  connection: oracledb.Connection,
  sql: string,
  binds: oracledb.BindParameters = {},
): Promise<Record<string, unknown>[]> {
  const result = await connection.execute(sql, binds, {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
  });
  return (result.rows ?? []).map((row) => lowerRow(row as Record<string, unknown>));
}

export async function forEachOracleRow(
  connection: oracledb.Connection,
  sql: string,
  onRow: (row: Record<string, unknown>) => void,
): Promise<void> {
  const result = await connection.execute(sql, [], {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    resultSet: true,
    prefetchRows: 1000,
  });
  const resultSet = result.resultSet;
  if (!resultSet) return;
  try {
    while (true) {
      const batch = (await resultSet.getRows(1000)) as Record<string, unknown>[];
      if (batch.length === 0) break;
      for (const row of batch) onRow(lowerRow(row));
    }
  } finally {
    await resultSet.close();
  }
}
