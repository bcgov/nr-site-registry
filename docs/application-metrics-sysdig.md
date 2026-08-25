# Application metrics and Sysdig dashboards

Summary for **nr-site-registry**: instrument the backend so each API/GraphQL operation reports **success vs failure**, expose Prometheus-format metrics, and visualize them in **Sysdig Monitor**.

**Related:** [Sysdig team setup (platform)](https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/app-monitoring/sysdig-monitor-setup-team/) · [Operational metrics overview](./operational-metrics-dashboard.md)

---

## Goals

- See **per-operation** health: successes, failures, and volume over time.
- Use **Sysdig** for dashboards (org standard on BC Gov OpenShift).
- Start in **test**; extend to prod after validation.
- **Out of scope for the original v1:** general-purpose alerts, ticket automation, and a full SLO program. The LTSA hardening requires targeted batch/freshness alerts as a go-live control; see [LTSA batch integration](#ltsa-batch-integration-target-design).

---

## How the pieces fit together

| Layer | What it does |
|--------|----------------|
| **Application** | Increments counters on each GraphQL operation (success/failure). |
| **`/metrics` endpoint** | Exposes counters in Prometheus text format. |
| **Platform scrape** | Sysdig/Prometheus pulls `/metrics` from backend pods (often via pod annotations). |
| **Sysdig dashboards** | PromQL panels: rates, totals, breakdown by `operation`. |

```text
Frontend → GraphQL → NestJS backend
                        ↓ (plugin records outcome)
                   GET /metrics
                        ↓ (scrape every ~15–60s)
                   Sysdig Monitor → Dashboards
```

**SysdigTeam CR** (in `<license-plate>-tools`) grants **access** to Sysdig. It does **not** create application metrics. App metrics require **code + scrape + dashboards**.

---

## Prerequisites

- [ ] **Sysdig team** exists and is **Ready** in `<license-plate>-tools` (e.g. `c6a6e5-tools`, `e38158-tools`).
- [ ] Teammates use the **same email in the CR** as their **SSO login** to Sysdig.
- [ ] Access to **test** app namespace (e.g. `c6a6e5-test`) for deploy and dashboard filters.

### Useful commands (tools namespace)

```bash
oc api-resources | grep -i sysdig
oc get sysdig-teams -n <license-plate>-tools
oc get sysdig-team <name> -n <license-plate>-tools -o yaml
```

Resource name on cluster is usually **`sysdig-teams`** (not `sysdigteam`). Kind in YAML: **`SysdigTeam`**, `apiVersion: ops.gov.bc.ca/v1alpha1`.

---

## Part 1 — Instrument the backend (code)

**Stack:** NestJS 10, GraphQL (Apollo Federation), `backend/`.

### 1.1 Add dependency

```bash
cd backend && npm install prom-client
```

### 1.2 Metrics to expose

Five currently documented general metric families (prefix `site_registry_`):

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `site_registry_graphql_operations_total` | Counter | `operation`, `outcome`, `error_class` | Success/failure per GraphQL operation |
| `site_registry_graphql_operation_duration_seconds` | Histogram | `operation`, `outcome` | GraphQL latency per operation |
| `site_registry_http_requests_total` | Counter | `method`, `route`, `status`, `outcome`, `error_class` | HTTP requests (excludes `/metrics`) |
| `site_registry_http_request_duration_seconds` | Histogram | `method`, `route`, `outcome` | HTTP request latency |
| `site_registry_auth_failures_total` | Counter | `reason`, `guard` | Wire 401/403 only |

**GraphQL labels:**

- **`operation`:** GraphQL `operationName` (e.g. `searchSites`), or `anonymous` if missing.
- **`outcome`:** `success` or `failure` (GraphQL errors, `success: false`, or payload `httpStatusCode` ≥ 400).
- **`error_class`:** `na` on success; `client`, `server`, or `unknown` on failure.

**Auth labels:** `reason` = `unauthorized` (401) or `forbidden` (403); `guard` = `http` today.

**Avoid** high-cardinality labels (user IDs, raw IDs in paths).

LTSA batch metrics are a separate target design. Their anticipated names and labels are documented below so dashboards are not mistaken for already-deployed telemetry.

### 1.3 Suggested files

| File | Role |
|------|------|
| `backend/src/app/metrics/operational-metrics.service.ts` | Defines counters; `recordGraphql(operation, outcome, errorClass)` |
| `backend/src/app/metrics/graphql-metrics.plugin.ts` | Apollo `@Plugin()` — records on `willSendResponse` |
| `backend/src/app/metrics/metrics.module.ts` | Providers + exports |
| `backend/src/main.ts` | Register `GET /metrics` |
| `backend/src/app.module.ts` | Import `MetricsModule` |

### 1.4 GraphQL plugin (why not every resolver?)

- GraphQL can return **HTTP 200** with `"errors": [...]` — ingress HTTP metrics look healthy while the operation failed.
- One **Apollo plugin** covers all operations consistently.
- No changes needed in individual resolver files for basic success/failure.

**Hook:** `requestDidStart` → `willSendResponse` → read `operationName`, check `response.body.singleResult.errors`, increment counter.

### 1.5 Expose `/metrics`

After `NestFactory.create`, register on the Express instance:

```typescript
http.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

**Auth:** Keycloak guards must **not** block the scraper. Use `@Unprotected()` on a metrics route or exclude `/metrics` from guards.

### 1.6 Local verification

```bash
npm run start:dev
curl http://localhost:4007/metrics | grep site_registry
# Run GraphQL operations, then curl again — counters should increase
```

---

## Part 2 — Enable scrape in Kubernetes (test)

Add pod annotations on the **backend** deployment (`charts/app/templates/backend/templates/deployment.yaml`):

```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: {{ .Values.backend.service.targetPort | quote }}
    prometheus.io/path: "/metrics"
```

The chart sets `PORT` and `containerPort` from the same `backend.service.targetPort`. **Confirm the live port on the pod** (test has used **3000**; local dev often **4007**; `charts/app/values.yaml` may list another value per environment).

Deploy to **test** via the normal pipeline.

### 2.1 Find the backend pod (test example)

Helm release in test is typically `nr-site-registry-test`. Backend resources use the `backend` component name.

| Resource | Example name (test) |
|----------|---------------------|
| Namespace | `c6a6e5-test` (replace `<license-plate>-test`) |
| Deployment | `nr-site-registry-test-backend` |
| Pod | `nr-site-registry-test-backend-<replicaset-hash>-<id>` |
| Labels | `app.kubernetes.io/name=backend`, `app.kubernetes.io/instance=nr-site-registry-test` |

```bash
oc project c6a6e5-test

# List backend pods (pick one in Running, READY 1/1)
oc get pods -l app.kubernetes.io/name=backend,app.kubernetes.io/instance=nr-site-registry-test

# Example pod name (yours will differ after redeploy):
# nr-site-registry-test-backend-7f4dc577df-7fkhf
```

### 2.2 Confirm scrape annotations and listen port

Before port-forward, read **PORT** and **prometheus.io/port** from the running pod (do not assume 8080):

```bash
POD=nr-site-registry-test-backend-7f4dc577df-7fkhf   # replace with your pod name

oc describe pod "$POD" | grep -E 'prometheus.io|^\s+PORT:|containerPort|Liveness|Readiness'
```

Expected on a metrics-enabled test deploy:

- `prometheus.io/scrape: true`
- `prometheus.io/path: /metrics`
- `prometheus.io/port: 3000` (must match `PORT` env and container port)
- `PORT: 3000`, probes on `:3000`

### 2.3 Port-forward and curl `/metrics` (two terminals)

Use the **container port** from the previous step as the **remote** port (`3000` in test). Pick any free **local** port (e.g. `13000`) to avoid clashing with other apps on 8080/3000:

**Terminal 1** (leave running):

```bash
oc project c6a6e5-test
oc port-forward pod/"$POD" -c nr-site-registry-test-backend 13000:3000
```

You should see `Forwarding from 127.0.0.1:13000 -> 3000`. If you see `connection refused` on **8080**, the app is not listening there — use `3000` (or whatever `describe` shows).

**Terminal 2:**

```bash
# Metric families (may be HELP/TYPE only until traffic exists)
curl -s http://127.0.0.1:13000/metrics | grep -E '^# (HELP|TYPE) site_registry'

# Full check with headers
curl -v http://127.0.0.1:13000/metrics | head -30
```

**Pass:** `HTTP/1.1 200 OK`, `Content-Type: text/plain`, and five `site_registry_*` HELP lines.

### 2.4 Generate UI traffic, then verify counters

1. Use **test** Site Registry in the browser (search, open a site, logged in if possible).
2. Re-run:

```bash
curl -s http://127.0.0.1:13000/metrics | grep site_registry_graphql_operations_total

# Sample lines only (no comments)
curl -s http://127.0.0.1:13000/metrics | grep -v '^#' | grep site_registry
```

**Pass:** Named operations appear, e.g. `operation="searchSites",outcome="success"`. Low or no `operation="anonymous"` after real UI use.

**Note:** Many `outcome="failure",error_class="client"` lines are common when the API returns `success: false` (permissions, not logged in, empty cart). That is application classification, not broken metrics. Use Sysdig `rate()` and filter `error_class` for server/unknown when judging system health.

### 2.5 Verify inside the pod (optional, no port-forward)

```bash
oc exec "$POD" -c nr-site-registry-test-backend -- \
  sh -c 'wget -qO- http://127.0.0.1:3000/metrics 2>&1 | head -20'
```

If this works but local port-forward fails, fix local port mapping or a stale pod name.

### 2.6 Port-forward via Service (alternative)

```bash
oc get svc -n c6a6e5-test | grep backend
oc port-forward -n c6a6e5-test svc/nr-site-registry-test-backend 13000:3000
curl -s http://127.0.0.1:13000/metrics | grep site_registry
```

If metrics work on the pod but not in Sysdig after ~30–60 minutes, ask the Teams channel **OpenShift-howto-sysdig** whether additional scrape config (e.g. ServiceMonitor) is required.

---

## Part 3 — Sysdig: confirm metrics, then build dashboards

**Prerequisite:** Part 2 pod verification succeeds (`curl` → 200, counters after UI traffic).

### 3.1 Explore (metric exists?)

1. Log in to **Sysdig Monitor** (platform SSO).
2. Open **Explore** / **Metrics** (Prometheus).
3. Search: `site_registry_graphql_operations_total`.
4. Filter by **namespace** `c6a6e5-test` (or your `<license-plate>-test`), **workload** `nr-site-registry-test-backend`, **cluster**.

If the metric does not appear, fix scrape/code before building dashboards.

### 3.1.1 Prove Explore matches pod metrics

1. Note the time; run search + open a site in test UI.
2. In Explore, run:

```promql
sum(rate(site_registry_graphql_operations_total{kube_namespace_name="c6a6e5-test"}[5m])) by (operation)
```

**Pass:** Non-zero rates for `searchSites`, `findSiteBySiteId`, or `findSiteBySiteIdLoggedInUser` around that time.

### 3.2 Example PromQL panels

Replace namespace with yours (e.g. `c6a6e5-test`):

**Failures (24h) — stat panel**

```promql
sum(increase(site_registry_graphql_operations_total{outcome="failure", kube_namespace_name="c6a6e5-test"}[24h]))
```

**Successes (24h) — stat panel**

```promql
sum(increase(site_registry_graphql_operations_total{outcome="success", kube_namespace_name="c6a6e5-test"}[24h]))
```

**Failure rate by operation — time series**

```promql
sum(rate(site_registry_graphql_operations_total{outcome="failure", kube_namespace_name="c6a6e5-test"}[5m])) by (operation)
```

**Success rate by operation — time series**

```promql
sum(rate(site_registry_graphql_operations_total{outcome="success", kube_namespace_name="c6a6e5-test"}[5m])) by (operation)
```

**Error percentage by operation**

```promql
sum(rate(site_registry_graphql_operations_total{outcome="failure", kube_namespace_name="c6a6e5-test"}[5m])) by (operation)
/
sum(rate(site_registry_graphql_operations_total{kube_namespace_name="c6a6e5-test"}[5m])) by (operation)
```

Use **Explore** to confirm exact label names (`kube_namespace_name`, `kube_workload_name`, etc.) — they can vary slightly by platform.

### LTSA batch integration

The LTSA exchange is initiated by an external on-prem scheduler and includes DMZ/SFTP steps that may fail before the backend receives a request. HTTP/GraphQL metrics therefore cannot prove that the integration is current. The primary control is a database-backed last-success timestamp exported after startup and refreshed after each run.

The backend now exposes these metric names. They remain operationally unverified until the hardened version is deployed and confirmed in Sysdig Explore. Keep labels low-cardinality: never use filename, file hash, run ID, PID, user, legal description, exception text, pod, or free-form stage text as application labels.

| Metric | Type | Labels | Meaning |
|---|---|---|---|
| `site_registry_ltsa_runs_total` | Counter | `operation` (`dump_1`, `dump_2`, `load`), `outcome` (`success`, `warning`, `failure`) | Completed attempts by result |
| `site_registry_ltsa_run_duration_seconds` | Histogram | `operation`, `outcome` | End-to-end backend operation duration |
| `site_registry_ltsa_records_total` | Counter | `operation`, `result` (`returned`, `loaded`, `skipped`, `changed`) | Records handled across completed attempts |
| `site_registry_ltsa_stage_failures_total` | Counter | `operation`, `stage` (`auth`, `validation`, `parse`, `lock`, `stage`, `merge`, `audit`, `retention`, `unknown`) | Failure point, using an enumerated stage |
| `site_registry_ltsa_lock_conflicts_total` | Counter | `operation` (`load`) | Non-blocking advisory-lock conflicts |
| `site_registry_ltsa_last_success_unixtime_seconds` | Gauge | `operation` | Completion time of the last successful/accepted-warning operation, restored from run metadata |
| `site_registry_ltsa_last_run_records` | Gauge | `operation`, `result` (`returned`, `loaded`, `skipped`, `changed`) | Counts from the most recently completed run, restored from run metadata |

Accepted `warning` loads count as successful for freshness but remain visible in the warning and skipped-row panels. Failed run metadata is persisted outside a rolled-back merge transaction. Run metadata is retained indefinitely; detailed per-record before/after audit is retained for 90 days.

#### Validate the metric contract

1. Confirm `/metrics` contains every `site_registry_ltsa_*` HELP/TYPE declaration.
2. Execute controlled dump halves, a valid load, a partial-malformed warning, a zero-valid rejection and an overlapping-load conflict.
3. Confirm counters increase once, labels stay within the enumerated values, and the last-success gauge changes only for `success` or accepted `warning`.
4. Restart/replace all backend pods and confirm last-success/last-run gauges recover from durable run metadata.
5. In Sysdig Explore, discover the actual namespace/workload label names before saving panels. Examples below use `kube_namespace_name`.

Use a dashboard variable or replace `$namespace` with the production namespace. If Sysdig does not support that variable syntax, save an explicit namespace filter.

**Last successful load age (hours)**

```promql
(time() - max(site_registry_ltsa_last_success_unixtime_seconds{
  operation="load",
  kube_namespace_name="$namespace"
})) / 3600
```

**Completed loads by outcome**

```promql
sum(increase(site_registry_ltsa_runs_total{
  operation="load",
  kube_namespace_name="$namespace"
}[24h])) by (outcome)
```

**Failures by operation**

```promql
sum(increase(site_registry_ltsa_runs_total{
  outcome="failure",
  kube_namespace_name="$namespace"
}[24h])) by (operation)
```

**Failure stage**

```promql
sum(increase(site_registry_ltsa_stage_failures_total{
  kube_namespace_name="$namespace"
}[24h])) by (operation, stage)
```

**Skipped records**

```promql
sum(increase(site_registry_ltsa_records_total{
  operation="load",
  result="skipped",
  kube_namespace_name="$namespace"
}[24h]))
```

**Latest accepted load counts**

```promql
max(site_registry_ltsa_last_run_records{
  operation="load",
  kube_namespace_name="$namespace"
}) by (result)
```

**Load p95 duration**

```promql
histogram_quantile(
  0.95,
  sum(rate(site_registry_ltsa_run_duration_seconds_bucket{
    operation="load",
    kube_namespace_name="$namespace"
  }[30m])) by (le)
)
```

**Lock conflicts**

```promql
sum(increase(site_registry_ltsa_lock_conflicts_total{
  operation="load",
  kube_namespace_name="$namespace"
}[1h]))
```

When multiple pods export the same database-restored gauge, use `max` rather than `sum` to avoid multiplying the value by replica count. Counters may be summed across pods; use `increase`/`rate` so pod restarts are handled correctly.

#### Dashboard panels

Create an **LTSA Integration** dashboard or section with:

- last successful load time and age;
- runs by operation/outcome;
- failures by stage;
- latest loaded/skipped/changed counts;
- loaded and changed volume by cycle;
- p50/p95 load duration;
- advisory-lock conflicts;
- deployment/pod health alongside the batch signals.

Sysdig configuration is manual/platform-managed because this repository has no alert-as-code mechanism. Record dashboard/alert ownership and links in the release/operations system.

#### Required alerts

Route every LTSA alert to both the SITE application/operations team and the on-prem scheduling/transfer team.

**No successful load by the next expected cycle — critical**

The precise schedule is unknown and **must be confirmed** before this alert is created. Set the threshold to the time from one expected successful load through the next expected load plus an agreed grace period. Do not assume daily or use a guessed number of hours.

```promql
time() - max(site_registry_ltsa_last_success_unixtime_seconds{
  operation="load",
  kube_namespace_name="$namespace"
}) > $confirmed_cycle_and_grace_seconds
```

Also handle an absent series as critical (for example with a Sysdig no-data condition), because no historical success is not healthy.

**Load failure — critical**

```promql
sum(increase(site_registry_ltsa_runs_total{
  operation="load",
  outcome="failure",
  kube_namespace_name="$namespace"
}[15m])) > 0
```

**Dump-half failure — high**

```promql
sum(increase(site_registry_ltsa_runs_total{
  operation=~"dump_1|dump_2",
  outcome="failure",
  kube_namespace_name="$namespace"
}[15m])) by (operation) > 0
```

This alert cannot detect a scheduler that never invokes the dump API. Add no-data/expected-cycle checks for each dump half after the actual schedule is confirmed, and correlate them with on-prem scheduler monitoring.

**Accepted warning or skipped rows — high**

```promql
sum(increase(site_registry_ltsa_runs_total{
  operation="load",
  outcome="warning",
  kube_namespace_name="$namespace"
}[15m])) > 0
```

```promql
sum(increase(site_registry_ltsa_records_total{
  operation="load",
  result="skipped",
  kube_namespace_name="$namespace"
}[15m])) > 0
```

**Repeated load-lock conflicts — high**

```promql
sum(increase(site_registry_ltsa_lock_conflicts_total{
  operation="load",
  kube_namespace_name="$namespace"
}[30m])) >= 2
```

**Abnormal volume — high**

Choose bounds only after observing and reconciling representative cycles. Compare the durable latest-run loaded count with approved absolute bounds or a recording-rule baseline; avoid dividing by zero when no historical cycles exist.

```promql
max(site_registry_ltsa_last_run_records{
  operation="load",
  result="loaded",
  kube_namespace_name="$namespace"
}) < $approved_min_records
or
max(site_registry_ltsa_last_run_records{
  operation="load",
  result="loaded",
  kube_namespace_name="$namespace"
}) > $approved_max_records
```

**Sustained timeout risk — warning**

Set `$backend_timeout_seconds` from the deployed ingress/client timeout and alert below it with enough headroom for safe completion.

```promql
histogram_quantile(
  0.95,
  sum(rate(site_registry_ltsa_run_duration_seconds_bucket{
    operation="load",
    kube_namespace_name="$namespace"
  }[30m])) by (le)
) > $approved_duration_warning_seconds
```

Test each alert with a controlled failure before production sign-off. Capture notification evidence from both recipient teams. The full flow, runbook, reconciliation gate and go-live checklist are in [LTSA integration](./ltsa-integration.md).

### 3.3 Dashboard: SiteRegistry-Test-Graphql (built)

Full panel catalog with titles, types, PromQL, and how to read each panel:
**[Operational metrics dashboard — panel reference](./operational-metrics-dashboard.md#sysdig-dashboard-siteregistry-test-graphql)**

**Quick summary**

| Section | Panels | Metric families |
|---------|--------|-----------------|
| OVERVIEW | 1 | (text) |
| GRAPHQL HEALTH | 8 | `graphql_operations_total`, `graphql_operation_duration_seconds` |
| HTTP LAYER | 5 | `http_requests_total`, `http_request_duration_seconds` |
| AUTH | 2 | `auth_failures_total` |

**Incident panel:** Enquiry failures with `error_class=~"server|unknown"`.

**Dashboard scope:** namespace `c6a6e5-test`, workload `nr-site-registry-test-backend`.  
**Default time range:** Last **6 hours** for `rate[5m]` charts; Last **24 hours** for Number panels using `increase[6h]` / `[24h]`.

---

## Part 4 — Impact on the existing app

| Area | Expected impact |
|------|------------------|
| GraphQL API / business logic | **No change** to contracts or behavior |
| Performance | **Negligible** (counter increment per request) |
| Risk | Plugin must not throw; `/metrics` must not be blocked by auth |
| Deploy | Normal backend release to test, then prod |

**Rollback:** redeploy previous image; remove annotations if needed.

---

## Definition of done

- [x] `oc describe pod` shows `prometheus.io/scrape`, `prometheus.io/path=/metrics`, and `prometheus.io/port` matching `PORT` (e.g. **3000** in `c6a6e5-test`).
- [x] `oc port-forward` to that port (e.g. `13000:3000`) and `curl` returns **200** with all `site_registry_*` HELP lines.
- [x] After UI traffic, `curl` shows `site_registry_graphql_operations_total` samples (e.g. `searchSites`, `findSiteBySiteIdLoggedInUser`).
- [x] Sysdig **Explore** finds the metric with `kube_namespace_name="c6a6e5-test"` (or your test namespace).
- [x] Dashboard **SiteRegistry-Test-Graphql** with 4 sections and 16 panels (test).
- [x] Doc updated with metric names and panel reference.
- [ ] Clone dashboard for prod (change namespace/workload only).
- [ ] `user_audience` label for external-user monitoring at go-live.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `port-forward` → `connection refused` on **8080** inside pod | Backend listens on another port (test: **3000**). Run `oc describe pod` and forward `LOCAL:3000`. |
| `curl: (52) Empty reply from server` | Port-forward not running, wrong local port, or tunnel lost after refused backend port |
| `/metrics` returns 401 | Keycloak blocking scraper |
| `/metrics` 404 | Route not registered |
| Only HELP/TYPE, no sample lines | No traffic yet; use UI then curl again |
| Local counters OK, Sysdig empty | Missing/wrong scrape annotations or platform config; confirm `prometheus.io/port` matches listen port |
| Only `anonymous` operation | Clients not sending `operationName` |
| Many `failure` / `client` on site-detail ops | Often expected (`success: false` in JSON when not authorized or missing data) |
| Teammate can't see Sysdig team | Email in CR ≠ SSO login email; or CR not Reconciled |

**Platform help:** Microsoft Teams **OpenShift-howto-sysdig**

---

## Work split (ticket-friendly)

| Task | Owner |
|------|--------|
| Backend metrics + `/metrics` | App team |
| Helm scrape annotations + test deploy | App / DevOps |
| Confirm scrape in Sysdig | Platform / Teams **OpenShift-howto-sysdig** if stuck |
| Dashboard panels | App team |
| SysdigTeam / access | Already in `<license-plate>-tools` (edit users via CR only) |

---

## References

- [Sysdig Monitor – team setup](https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/app-monitoring/sysdig-monitor-setup-team/)
- RED metrics: rate, errors, duration
- [Operational metrics overview](./operational-metrics-dashboard.md)
