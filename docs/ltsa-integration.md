# LTSA integration

This document is the operational and technical reference for the Site Registry (SITE) exchange with the Land Title and Survey Authority (LTSA). It describes the inherited baseline and the hardened implementation now present in this repository. Source-controlled code and tests still require deployment and environment validation; dashboards, alerts, schedules, contacts, and operating procedures are not active merely because they are documented here.

The historical incident source is [`../ltsa-deets.md`](../ltsa-deets.md). In December 2025 the inbound load stopped for an extended period because the legacy `sqlldr` process could not resolve the `ENVPROD1` Oracle connect identifier (`ORA-12154`). The outbound exchange and LTSA processing still worked, so request-only monitoring would not have detected the stale SITE data. The principal operational control is therefore the age of the last successful inbound load, not merely API availability.

## Scope and operating assumptions

- On-premises jobs continue to be started by an external scheduler. This application does not schedule them.
- The specific production days and times are **unknown and must be confirmed** with the on-prem team before alert thresholds or go-live are approved. Repository `crontab.cfg` contains deployment placeholders, not an authoritative schedule.
- Calls use Keycloak bearer tokens. The authorization policy remains **any authenticated token**; there is no LTSA-specific role requirement. This broad access is an accepted residual risk and should be revisited separately.
- LTSA run metadata is retained indefinitely. Detailed per-record before/after rollback audit is retained for 90 days.
- Sysdig alerts must route to both the SITE application/operations team and the on-prem scheduling/transfer team.

## Ownership

| Area | Primary owner | Required handoff |
|---|---|---|
| On-prem scheduler, script host, Oracle/DMZ environment, local files and job logs | On-prem team | Confirm schedule and expected completion window; investigate jobs that never reach the API |
| DMZ SSH/SCP/SFTP and LTSA SFTP exchange | On-prem team, with LTSA for the remote service | Preserve the only file copy; coordinate transport incidents |
| `/ltsa/dump`, `/ltsa/load`, `/ltsa/status`, PostgreSQL merge and run/audit data | SITE application team | Investigate endpoint, validation, lock, transaction, database and application failures |
| OpenShift deployment, `/metrics`, Sysdig dashboard and alert routing | SITE application/operations team | Maintain dashboard and notify both teams |
| Fixed-width response content and LTSA processing | LTSA | Investigate upstream format/content or missing response |
| Audit-authorized rollback approval and execution | Restricted database/operator role plus business owner | Two-person approval, evidence capture and post-rollback reconciliation |

Contact names, paging groups and escalation times are deployment-specific and must be recorded in the operational system before go-live; do not put credentials or personal access tokens in this document.

## End-to-end flow

There are two outbound PID halves and one or more inbound response files:

1. The external on-prem scheduler starts `lto_1.sh` and `lto_2.sh` at configured times.
2. Each script obtains a Keycloak client-credentials token through `get_keycloak_token.sh`.
3. `lto_dump.sh 1` calls `GET /ltsa/dump?type=1`; type 2 calls the same endpoint with `type=2`.
4. SITE queries distinct, left-zero-padded, nine-character PIDs. Type 1 contains PIDs below `025000000`; type 2 contains PIDs at or above it. Results are sorted ascending.
5. The script writes `PARCEL_ID_LIST_<YYMMDD_HH>.TXT`, transfers it through the DMZ host, and uses SFTP to put it in LTSA's `import` directory.
6. LTSA looks up legal descriptions and places `PARCEL_DESCRIPTION_RESPONSE_*.TXT` in its `export` directory.
7. At a separately configured time, the external scheduler starts `lto_load.sh`. The repository copy of that orchestrator is unchanged legacy reference: it fetches response files through the DMZ, then passes the first `PARCEL_DESCRIPTION_RESPONSE_*.TXT` to the API adapter. If multiple files accumulate, process them one at a time in deterministic order before calling `lto_load_new.sh`; the on-prem deployment may wrap that behavior outside source control.
8. `lto_load_new.sh` obtains a token and uploads a multipart field named `file` to `POST /ltsa/load` for one response file per invocation.
9. The backend parses LTSA's fixed-width records, compares the accepted batch with the prior successful batch, and applies changed parent/child subdivision data and site links.
10. The synchronous HTTP response determines whether the on-prem script archives the file or retains it for investigation/retry. Run metadata, metrics, `/ltsa/status`, Sysdig dashboards and freshness alerts provide the operational record.

The dump and load schedules are independent. A successful dump does not prove LTSA returned a response, and a successful SFTP fetch does not prove SITE merged it. Monitor every boundary and the complete-cycle freshness signal.

### Baseline limitations addressed by hardening

The current scripts do not consistently validate HTTP status, propagate every remote command failure, protect atomic outputs, or preserve all files safely. The current loader rotates shared current/previous tables before validating that the upload contains usable rows, performs the merge as many separate database operations rather than one transaction, logs the first 50 raw lines, and has no durable run history, overlap lock, status endpoint, per-record rollback audit, freshness metric, or alert. These are known baseline risks, not approved operating behavior.

## Active and inherited files

Repository changes in `ltsa/` are limited to the hardened API adapters (`lto_dump.sh`, `lto_load_new.sh`) and their supporting helpers. Legacy orchestrators and helpers remain in the tree unchanged for reference; production hosts may carry newer wrappers outside source control.

| File | Status | Purpose |
|---|---|---|
| `ltsa/lto_dump.sh` | Hardened API adapter | Call `GET /ltsa/dump` and turn the JSON `data` array into one PID per line |
| `ltsa/lto_load_new.sh` | Hardened API adapter | Multipart upload to `POST /ltsa/load` for one response file |
| `ltsa/ltsa_common.sh` | Supporting helper | Shared logging, retries, JSON completion events and path resolution for the hardened adapters |
| `ltsa/reconcile_ltsa.sh`, `ltsa/reconcile_ltsa_state.sh` | Supporting utilities | Cutover and regression comparison without exposing legal descriptions |
| `ltsa/tests/run_tests.sh` | Supporting tests | Mock-based checks for the hardened adapters and reconciliation utilities |
| `ltsa/lto_1.sh`, `ltsa/lto_2.sh` | Legacy reference | Outbound orchestrators; unchanged in source control, call `lto_dump.sh` when deployed |
| `ltsa/lto_load.sh` | Legacy reference | Inbound orchestrator; unchanged in source control, calls `lto_load_new.sh` for the first response file |
| `ltsa/get_keycloak_token.sh` | Legacy reference | Client-credentials token helper used by the hardened adapters |
| `ltsa/lto/lto.properties` | Active deployment template | Paths, endpoints and credentials substituted outside source control |
| `ltsa/lto/lto_ftp_cmds`, `ltsa/lto/lto_get_desc` | Legacy SFTP batch inputs | LTSA import/export commands; preserve every sole copy during transport |
| `ltsa/crontab.cfg` | Deployment template | Shows separate dump/load jobs, but placeholder schedules are not authoritative |
| `ltsa/lto/lto_load.ctl` | Legacy reference | Authoritative fixed-width field positions formerly consumed by SQL*Loader |
| `ltsa/lto/lto_clean.sql`, `ltsa/lto/lto_load.sql` | Legacy reference, superseded by backend | Former Oracle table rotation and `sis_util_pkg.merge_lto_descriptions` invocation |
| `ltsa/lto/ltodump_1.sql`, `ltsa/lto/ltodump_2.sql` | Legacy reference, superseded by backend | Former Oracle PID exports |
| `backend/src/app/controller/ltsa.controller.ts` | Active backend entry point | Authenticated dump, load, and operational status routes |
| `backend/src/app/services/ltsa/ltsa.service.ts` | Active backend processing | PID query, fixed-width parsing and legacy-equivalent merge |
| `backend/src/app/services/ltsa/merge_lto_descriptions.md` | Behavioral reference | Parent, child and site-link rules inherited from Oracle |

Do not re-enable legacy SQL or SQL*Loader during normal recovery. They document compatibility and may be used only in an explicitly approved rollback/cutover plan.

## Configuration

The on-prem handoff requires `API_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, and `KEYCLOAK_CLIENT_SECRET`, plus the task paths in `lto/lto.properties`. Secrets must come from the approved on-prem secret mechanism, not source control or command-line logs.

Optional script controls are `LTSA_MAX_RETRIES` (default 5), `LTSA_CONNECT_TIMEOUT` (10 seconds), `LTSA_TOKEN_MAX_TIME` (30 seconds), `LTSA_DUMP_MAX_TIME` (60 seconds), `LTSA_LOAD_MAX_TIME` (120 seconds), `LTSA_PROPERTIES_FILE`, and `LTSA_ARCHIVE_DIR`. Variables beginning `LTSA_SKIP_` and command overrides such as `LTSA_TOKEN_COMMAND` exist for isolated testing; they must not be enabled in production.

The backend accepts `LTSA_MAX_UPLOAD_BYTES`; its safe default is 100 MiB. Set it only after measuring representative response files and validating ingress timeout, ephemeral-storage, and database-processing capacity. Sysdig's missed-cycle threshold is configured outside the application after the actual schedule and grace period are confirmed.

## API contracts

All routes are under `/ltsa`, require `Authorization: Bearer <token>`, and accept any valid authenticated token. The on-prem client must treat the HTTP status and JSON body together; a transport-level success is not a completed business operation.

### `GET /ltsa/dump?type=1|2`

`type` is required:

- `1`: distinct padded PID `< 025000000`
- `2`: distinct padded PID `>= 025000000`

Current compatible success body:

```json
{
  "status": "success",
  "message": "Retrieved subdivisions data for type 1",
  "timestamp": "2026-07-14T20:00:00.000Z",
  "type": 1,
  "count": 123,
  "data": ["000000001", "000000002"]
}
```

The client writes each `data` element as one line. It must reject malformed JSON, a missing/non-numeric `count`, a `count`/array mismatch, non-nine-digit values, non-2xx responses and stale temporary output. Output is published atomically only after the complete response validates.

Hardened error classification:

- `400` invalid or missing type; do not retry unchanged.
- `401`/`403` invalid authentication/authorization; repair credentials, do not retry blindly.
- `429` or `5xx` transient throttling/service failure; bounded retry with backoff.

### `POST /ltsa/load`

Request: `multipart/form-data` with exactly one `.txt` upload in field `file`. The configured request/file size limit is authoritative; confirm the maximum production response size before go-live.

The route is synchronous: acceptance means parsing, comparison, transactional merge and durable run outcome have completed. The hardened response has stable fields:

```json
{
  "status": "success",
  "outcome": "success",
  "runId": "uuid",
  "timestamp": "2026-07-14T21:00:00.000Z",
  "filename": "PARCEL_DESCRIPTION_RESPONSE_....TXT",
  "fileHash": "sha256:...",
  "recordsProcessed": 1000,
  "recordsLoaded": 1000,
  "recordsSkipped": 0,
  "recordsChanged": 12,
  "subdivisionUpdates": 10,
  "subdivisionInserts": 2,
  "siteSubdivisionInserts": 1,
  "warnings": []
}
```

`outcome` is `success` or `warning` on an accepted file. `warning` indicates accepted valid records plus skipped malformed rows; it is operationally successful but must be visible and reviewed. Reprocessing an identical previously successful file is safe and returns an accepted outcome with zero changed records. A file with zero valid records is rejected and must never replace the comparison baseline.

Target error classification:

- `400` missing/wrong extension, malformed request, invalid content or zero valid records; retain file and investigate.
- `401`/`403` authentication/authorization; retain file and repair access.
- `409` or `423` another load holds the lock; retryable with bounded backoff.
- `413` configured upload limit exceeded; retain file and escalate rather than splitting it without approval.
- `429` throttling; retryable.
- `500`/`503` unexpected application/database failure; domain mutations roll back, failed metadata remains, and bounded retry is allowed.

Clients archive only `success` or accepted `warning`. They stop on the first failed file and retain that file and all unprocessed files.

### `GET /ltsa/status`

This authenticated endpoint exposes low-detail operational state for `dump_1`, `dump_2`, and `load`: latest and last-successful outcomes, timestamps, age in seconds, run ID, file hash where applicable, safe counts, and warning state. It does not decide whether the age is stale because the deployment schedule is external and unconfirmed. It must not expose legal descriptions, raw rows, token details, credentials or detailed before/after audit. Operators use it to correlate the scheduler, API and Sysdig; it does not replace run-history/audit access controls.

## LTSA fixed-width response format

Positions are one-based and inclusive, inherited from `lto_load.ctl`. A complete line is 530 characters; child fields are optional for shorter records. Parent PID plus status requires at least 10 characters.

| Positions | Width | Field | Handling |
|---|---:|---|---|
| 1–9 | 9 | Parent PID | Required, trimmed and stored left-zero-padded |
| 10 | 1 | Parent PID status | `X`/`E` make `valid_pid` null; any other value makes it `Y` |
| 11–265 | 255 | Parent legal description | Optional; trim padding |
| 266–274 | 9 | Child PID | Optional |
| 275 | 1 | Child PID status | Optional |
| 276–530 | 255 | Child legal description | Optional |

The parser normalizes control characters, Unicode quotation marks, dashes and spaces to preserve field alignment. Reconciliation must allow only explicitly documented normalization; otherwise compare exact values. Malformed short/invalid rows become counted warnings if at least one valid row remains. Raw legal descriptions must not be written to normal application logs or metric labels.

## Merge semantics

The target batch is compared with the **prior successful batch**, not the immediately preceding failed attempt. Only rows new or changed across all six fixed-width fields are merged.

For each changed row:

1. Update an existing parent subdivision by padded PID, or insert it if absent.
2. Set legal description, status and `valid_pid`; mark changes as `LTO-LOAD`.
3. Process a child only when the parent status is neither `X` nor `E` and child PID exists.
4. Update an existing child, or clone the parent's PIN, BCAA folio and Crown Lands file number into a new child while using child-specific PID/status/description.
5. For every site linked to the parent, create a missing child site-subdivision link with `initial_indicator=N`, `send_to_sr=Y` and `LTO-LOAD` audit identity.

The hardening design preserves these rules while replacing destructive shared current/previous rotation with run-scoped batches.

## Hardening design and invariants

- A portable on-prem lock directory prevents overlap on one script host; a non-blocking PostgreSQL advisory lock prevents concurrent loads across callers/pods. Lock conflict is retryable.
- Network operations have connect/overall timeouts and retry only network errors, `409`/`423`, `429` and `5xx`. Validation and authentication errors are not blindly retried.
- Dump output is written to a temporary file, validated and atomically renamed. A failed request cannot send stale data.
- Every inbound response file is processed in deterministic filename order. The process never selects only the first match.
- SSH/SCP/SFTP/API exit codes are checked. A remote file is not deleted until another verified copy exists; a local file is archived only after API acceptance.
- Upload parsing is bounded and does not depend on unbounded whole-file memory. The configured maximum must exceed a measured production high-water mark with an approved margin.
- A file hash/run ID makes attempts traceable. Same-file reprocessing is accepted and does not duplicate domain changes.
- Zero valid rows is a hard rejection. Partial malformed input produces explicit skipped counts and an accepted warning only when valid rows remain.
- Staging, change detection, subdivision/link mutations and detailed audit writes are atomic in one database transaction. Unexpected failure rolls them all back.
- Failed run metadata is written outside the rolled-back domain transaction.
- Run-scoped batch records preserve the prior successful comparison source. Cleanup may never prune the currently required comparison batch.
- Run metadata is indefinite. Detailed before/after audit and non-required staging data are pruned after 90 days.

## Failure modes and response

| Signal or symptom | Likely boundary | Immediate action |
|---|---|---|
| No dump attempt near expected time | External scheduler/script host | On-prem team checks scheduler, host, lock and logs |
| Token request `401`/missing token | Keycloak configuration | On-prem team validates secret/URL/realm/client without printing secret |
| Dump fails or returns invalid/zero unexpectedly | Backend/database/contract | Retain prior published file; SITE investigates run/API; do not send stale output |
| SFTP/SSH/SCP failure | DMZ/network/LTSA | Verify which host has a complete copy; never delete the sole copy |
| LTSA response absent | LTSA or schedule mismatch | On-prem team checks remote export and contacts LTSA |
| Load lock conflict | Overlapping invocation | Retry with backoff; repeated conflicts require schedule/host investigation |
| Load `400`, zero valid or high skipped count | File format/content | Retain and quarantine file; SITE and LTSA review safely |
| Load timeout/`5xx` | App/database/network | Check `/ltsa/status` by file hash/run ID before retry; retry safely if not accepted |
| Warning accepted | Partial malformed rows | Archive as accepted, open review, reconcile skipped records |
| Last successful load too old | Any upstream boundary | Treat as end-to-end incident; page both teams |
| Domain counts abnormal | Wrong/partial input or data regression | Stop subsequent files if unsafe, compare prior cycles, reconcile before continuing |

## Operator runbook

### Routine cycle verification

1. Confirm the externally configured expected cycle and current time zone.
2. Check on-prem completion summaries for both dump halves and every inbound response file.
3. Query authenticated `GET /ltsa/status`; record latest successful load run ID, file hash, outcome, records loaded/skipped/changed and completion time.
4. In Sysdig, confirm a recent successful load, no stage failure, acceptable skipped count, expected duration and plausible volume.
5. Confirm the freshness alert is green. A successful dump alone is insufficient.
6. For `warning`, inspect safe reason/count metadata and open follow-up; do not expose raw legal descriptions in tickets.

### Failure/retry

1. Stop duplicate/manual launches and identify whether a load is active.
2. Preserve all local/DMZ/remote files. Record filename, size and SHA-256 hash; never paste content into chat/tickets.
3. Identify the last completed boundary from scheduler logs, machine-readable script summary, `/ltsa/status` and run metadata.
4. For transport, lock, throttle or service-unavailable errors, use bounded retry. Before retry after an ambiguous timeout, check file hash/run ID to avoid guessing.
5. Do not retry unchanged `400`, `401`, `403` or `413`; correct the cause.
6. Reprocessing an accepted identical file is safe, but verify it reports zero changed records and does not create duplicate links.
7. Escalate freshness breaches to both teams and LTSA when evidence places the fault upstream.
8. Close only after a successful load and reconciliation restore freshness.

### Missed-cycle recovery

Confirm with LTSA whether response files remain available and whether multiple files accumulated. Fetch all files, order deterministically, process one at a time, stop on first failure, and retain later files. Compare final SITE state to the expected sequence; do not combine or reorder files without business approval.

### Stale on-prem lock recovery

Concurrent `POST /ltsa/load` requests receive HTTP `409` while the backend advisory lock is held; the hardened `lto_load_new.sh` retries those responses with backoff. On-prem wrappers may add directory locks under `${app_path}/lto_task/`; if a job reports an existing lock, first verify the PID, process command, start time, scheduler state, and any active SSH/SFTP/curl child processes. Remove a wrapper lock directory only after proving that no matching job is active and preserving its logs. Never automate age-only lock deletion: a slow live transfer or reused PID can make that unsafe. Start one controlled retry and confirm its completion event after cleanup.

## Restricted audit rollback

Rollback changes production domain data and is not a normal retry. Detailed rollback evidence is available only for 90 days.

1. Declare an incident and freeze further LTSA loads at the external scheduler and, if needed, application level.
2. Obtain approval from the SITE business/data owner and a restricted database operator. Use two-person review.
3. Identify the exact successful `runId`, file hash, completion time, prior successful comparison run and affected counts. Verify the run is within the 90-day audit window.
4. Back up affected `subdivisions`, `site_subdivisions`, run metadata, batch records and detailed audit rows. Record backup location/checksum in the restricted incident record.
5. Generate a dry-run rollback set from per-record `before` images. Validate entity IDs and current values. If a current row differs from that run's `after` image, stop: a later/manual change would be overwritten.
6. In one controlled transaction, restore updates from `before` images and remove only links/subdivisions proven to have been inserted by the target run. Do not infer changes solely from `who_updated`.
7. Keep run metadata immutable. Add a rollback marker/reference rather than deleting the original run or audit.
8. Re-run dry-run comparison, commit only after reviewer approval, then reconcile domain state to the intended prior successful batch.
9. Re-enable scheduling only after SITE and on-prem owners sign off. Monitor the next complete cycle and retain the incident evidence according to policy.

If detailed audit has expired, do not attempt record-level reconstruction from metadata counts. Use a separately approved database restore/replay strategy.

## Reconciliation

Before cutover, run legacy and hardened implementations in a production-like environment with the same inputs. Do not dual-write uncontrolled production data.

Reconciliation must show:

- exact sets and counts for dump type 1 and type 2, with no overlap and the boundary at `025000000`;
- exact accepted fixed-width records and field parsing, except documented character normalization;
- exact changed-row set relative to the same prior successful batch;
- equivalent parent updates/inserts, child updates/inserts and site-subdivision links;
- equivalent `valid_pid`, inherited parent fields and `LTO-LOAD` audit identity;
- identical no-op behavior on same-file replay;
- rollback of all domain changes on injected failure;
- explicit accounting for every malformed/skipped row.

Any unexplained discrepancy blocks cutover. Attach a safe count/hash report and owner approvals to the release record; do not attach raw legal descriptions unless the record is access-restricted.

Use `ltsa/reconcile_ltsa.sh` for normalized PID-list and completion-event comparisons. Use `ltsa/reconcile_ltsa_state.sh` with the two dump halves plus identically-columned legacy/new `subdivisions` and `site_subdivisions` exports for the full state report. The full-state utility reports match flags and row counts without printing legal descriptions.

## Go-live checklist

- [ ] Actual production dump/load days, times, time zone, holidays and maximum expected delay confirmed by on-prem and SITE owners.
- [ ] Named escalation contacts and alert destinations for both teams recorded.
- [ ] On-prem jobs remain externally scheduled and hardened adapters (`lto_dump.sh`, `lto_load_new.sh`) are installed with correct executable paths.
- [ ] Keycloak client, API URL, DMZ SSH/SCP and LTSA SFTP connectivity validated without exposing secrets.
- [ ] Measured maximum file size/line count and backend/proxy timeout and upload limits validated.
- [ ] Fixed-width fixtures, zero-valid rejection, partial-warning, same-file replay and multi-file ordering (one file per `lto_load_new.sh` call) tested.
- [ ] Backend advisory lock (`409`) and any on-prem wrapper locks tested; stale lock recovery documented.
- [ ] Database migration, capacity and backup/restore validated.
- [ ] Metadata indefinite retention and 90-day detailed audit pruning verified; required prior comparison batch survives pruning.
- [ ] `/ltsa/status` returns safe, persistent state after pod restart.
- [ ] Anticipated LTSA metrics are present in production Sysdig with the actual namespace/workload labels.
- [ ] Freshness threshold is based on the confirmed next expected cycle, not a guessed 24-hour window.
- [ ] Failure, warning, malformed row, volume, latency and repeated lock alerts tested and routed to both teams.
- [ ] Exact reconciliation completed with no unexplained differences.
- [ ] Restricted rollback drill completed inside the 90-day audit window.
- [ ] SITE, on-prem and business/data owners approve cutover and the legacy fallback window.
- [ ] First production cycle is attended; outbound halves, LTSA return, inbound merge, counts and freshness are confirmed.

See [`application-metrics-sysdig.md`](./application-metrics-sysdig.md#ltsa-batch-integration) for implemented metric names, PromQL and dashboard/alert setup.
