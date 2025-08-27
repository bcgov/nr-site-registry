import * as dotenv from 'dotenv';
dotenv.config();
import * as oracledb from 'oracledb';
const { Client } = require('pg');

// --- Oracle Config ---
const oracleConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONN_STRING,
};

// --- PostgreSQL Config ---
const pgClient = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT) || 5432,
});

// --- Helper: PascalCase → snake_case ---
function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

async function testConnection() {
  let connection;
  try {
    console.log('username:', process.env.ORACLE_USER);
    console.log('password:', process.env.ORACLE_PASSWORD);
    console.log('conn string:', process.env.ORACLE_CONN_STRING);
    connection = await oracledb.getConnection(oracleConfig);

    // Simple test query
    const result: oracledb.Result<any> = await connection.execute(
      `SELECT SYSDATE AS now FROM dual`,
    );
    console.log('Connected! Current time:', result.rows![0][0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing Oracle connection:', closeErr);
      }
    }
  }
}

async function compareAllTableRowCounts(): Promise<void> {
  let oracleConnection;
  try {
    oracleConnection = await oracledb.getConnection(oracleConfig);
    await pgClient.connect();

    // Get all Oracle table names from your schema
    const tableQuery = `
            SELECT TABLE_NAME
            FROM ALL_TABLES
            WHERE OWNER = 'SIS'
            `;
    const result = await oracleConnection.execute(tableQuery);
    const tableNames: string[] = result.rows!.map((row: any) => row[0]);

    //console.log('tableNames', tableNames);
    console.log(
      `\n${'Oracle Table'.padEnd(30)} ${'Postgres Table'.padEnd(30)} Oracle Count  PG Count   Match`,
    );
    console.log('-'.repeat(85));

    let pgTableNotFound = [];
    let oracleTableNotFound = [];
    for (const oracleTable of tableNames) {
      const pgTable = toSnakeCase(oracleTable);
      let oracleCount: number = 0;
      let pgCount: number = 0;

      //console.log('pgTable', pgTable);
      try {
        const sql = `SELECT COUNT(1) AS COUNT FROM SIS."${oracleTable}"`;
        const res = await oracleConnection.execute<{ COUNT: number }>(
          sql,
          [], // no binds
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );
        oracleCount = res.rows?.[0]?.COUNT ?? 0;
        //console.log('Oracle count:', oracleTable, oracleCount);
      } catch (e) {
        oracleTableNotFound.push(oracleTable);
        //console.warn(`Could not query Oracle table: ${oracleTable}`);
      }

      try {
        const pgRes = await pgClient.query(
          `SELECT COUNT(*) FROM sites."${pgTable}"`,
        );
        pgCount = Number(pgRes.rows?.[0]?.count ?? 0);
      } catch (e) {
        pgTableNotFound.push(pgTable);
      }

      //console.log(sqlTable, sqlCount);
      //console.log(pgTable, pgCount);

      const match = oracleCount === pgCount ? '✅' : '❌';
      //if (oracleCount !== pgCount)
      console.log(
        `${oracleTable.padEnd(30)} ${pgTable.padEnd(30)} ${String(oracleCount).padEnd(10)} ${String(pgCount).padEnd(10)} ${match}`,
      );
    }

    if (oracleTableNotFound.length > 0) {
      console.log('-'.repeat(85));
      console.log('Table not in Oracle:');
      console.log('-'.repeat(85));
      oracleTableNotFound.forEach((table) => {
        console.log(table);
      });
    }

    if (pgTableNotFound.length > 0) {
      console.log('-'.repeat(85));
      console.log('Table not in Postgres:');
      console.log('-'.repeat(85));
      pgTableNotFound.forEach((table) => {
        console.log(table);
      });
    }

    //console.log(pgTable, pgCount);
  } catch (err) {
    console.error('Connection or query failed:', err);
  } finally {
    await oracleConnection?.close(); // Close the Oracle connection pool properly
    await pgClient.end(); // Close Postgres client connection
  }
}

compareAllTableRowCounts();
