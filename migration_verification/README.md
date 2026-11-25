## Migration verification

`npm run verify` exports production Oracle with the current ora2pg scripts, loads a throwaway local Postgres, and exits non-zero when stored values differ from Oracle.

The comparison is the data, after the documented transforms. It does not check how the application reads a site.

Oracle credentials come from `.env` (`ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONN_STRING`). `ORACLE_CONN_STRING` is `host:port/service`. A VPN connection to the BC Gov network is required to reach that database. The script does not print the password. A full run reads all of production and can take a long time.

The export is written to `migration_verification/.export` and that directory is emptied at the start of a full run. Files in `ora2pg/data` are not read.

### Usage

From this directory, with Docker running and `npm install` already done in both this directory and `backend/`:

```
npm run verify
npm run verify -- --reuse
npm run verify -- --clean
npm run verify -- --generate-sample
```

- `npm run verify` exports Oracle into `.export`, loads a new database, compares, and deletes that database when the gate passes. If ora2pg does not write a new snapshot, the run stops.
- `--reuse` skips the export and loads `.export/output_new.sql` from the last run of this command. It still applies the current `rwmFlagLogic.sql`, constraint scripts, and TypeORM migrations. A change to `ora2pg.conf` or `modify_dml.py` needs a full run, because those run during export.
- `--clean` deletes the leftover `migration-verify-pg` container.
- `--generate-sample` rewrites `sample-sites.json` from live Oracle. That file is the frozen site list. Commit a regeneration on purpose; later runs do not pick new ids.

Before the row-by-row compare, the run checks `sites`. If the newest `when_updated` in Postgres is more than a day behind live Oracle, it stops and does not list per-table differences.

If the failure happens before any data is loaded, the empty database is removed. After the load has started, a failure leaves it up on port 55432, database `migration_verify`, user `postgres`, password `postgres`.

### What is compared

Equality rules, not baseline entries:

- Only tables the export actually wrote, in schema `sites`.
- Blank and null match. Text is trimmed. Null bytes and other non-printing control characters are ignored. Newlines stay. Dates compare as calendar days. Primary keys keep the time of day.
- `sr_action` is `public` exactly when `rwm_flag` contains `50`, and stays unset otherwise.
- `who_deleted`, `when_deleted`, and `required_action` stay blank when Oracle has no such column.
- Geometry on the sample sites is compared as WKT, with coordinates rounded to 6 decimal places.

For every exported table: row counts, Oracle primary-key sets, and blank counts on the address, disclosure, event, participant, document, and parcel columns.

For the frozen site ids in `sample-sites.json`: field values and child-row sets, including people, roles, conditions, document participants, and subdivisions reached from those sites. The list is those saved ids, plus up to 15 sites in each stratum (registry, disclosure, requirement dates, associations, documents, participants, subdivisions, public flag, internal flag).

### Baseline

`baseline.json` starts empty. The gate fails on every real difference. Copy a difference from `last-diff.json` into `accept` and fill in `reason`. The script never writes the baseline.

```json
{
  "accept": [
    {
      "check": "row-count",
      "table": "example",
      "key": "",
      "oracle": "1",
      "postgres": "2",
      "reason": "why this difference is accepted"
    }
  ]
}
```

A stale snapshot is refused before this list is written.
