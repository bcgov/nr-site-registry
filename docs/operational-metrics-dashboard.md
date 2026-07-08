# Operational metrics & dashboards

This document describes how we surface **what the system is doing** — successful vs failed operations — so teams can see health at a glance without relying on tickets or log diving first.

**Current scope:** dashboards that reflect operations (success / failure, volume, optionally latency).  
**Out of scope for now:** automatic ticket creation, on-call paging, or full operational-excellence ticket catalogs.

---

## Goals

- Show **per-operation** (or per-endpoint) **success vs failure** over time.
- Use **the same metrics stack** the organization already uses (typically Prometheus-compatible metrics, viewed in **Sysdig**, **Grafana**, or similar).
- Enable a **test-environment proof** before broader rollout; **local** is useful for fast iteration, **shared test** is stronger for leadership demos when cluster scraping exists.

---

## How metrics fit together

| Piece | Role |
|--------|------|
| **Application** | Exposes counters (and optionally histograms) — often at `/metrics` — with stable names and labels. |
| **Collector** | Prometheus, Sysdig agent, or platform scrape pulls metrics from pods (often via Kubernetes annotations). |
| **Dashboard** | Sysdig / Grafana queries those series (e.g. PromQL `rate(...)`) and plots trends. |

Instrumentation uses **Prometheus-style** naming whether or not the UI is Sysdig or Grafana.

---

## What to measure

### Minimum useful signals

For each **operation** you care about (GraphQL operation name, REST route, or named business flow):

1. **Success** — counter incremented when work completes as intended.
2. **Failure** — counter incremented when the operation fails (with **labels** for *reason* or *class* if you have multiple failure modes).
3. **Volume** — derived from `rate(counter[interval])` so traffic spikes are visible alongside errors.

Optional next step: **latency** (histogram or summary) per operation to catch slowdowns before hard failures.

### Defining success vs failure

| Outcome | Typical treatment |
|---------|-------------------|
| Completed business logic, HTTP 2xx | **Success** |
| Expected client issues (4xx) | Separate counter or label (`client_error`) — avoid blending with server failures if you want a clear “system health” view |
| 5xx, timeouts, uncaught errors | **Failure** |

**GraphQL:** A single HTTP 200 can mask resolver failures. Prefer **per-operation** or **per-field** counters where it matters for clarity.

### Naming & labels (guidelines)

- Use **consistent metric prefixes** (e.g. `site_registry_*`) and **lowercase** with underscores.
- **Labels** carry dimensions: `operation`, `outcome` / `error_type`, and Kubernetes labels are usually added by the platform (`namespace`, `workload`, etc.).
- Keep **cardinality** low: avoid high-cardinality labels (raw IDs, unbounded paths).

---

## What belongs on a dashboard

Aligned with common practice (including PromQL-style queries such as `rate(successful_processing_total{...}[$__interval])`):

1. **Scope** — filters for **cluster**, **namespace**, **deployment/workload** so prod and test are never mixed by mistake.
2. **At-a-glance** — large stat panels: successful vs unsuccessful counts (or rates) for the period.
3. **Trends** — time series for **success rate**, **failure rate**, and **request/operation volume**.
4. **Optional** — CPU/memory or dependency health if the platform exposes them for the same workload.
5. **Context** — short “Dashboard overview” text: what this board is for, what “good” looks like, and where to look next (logs, runbooks).

---

## Sysdig dashboard: SiteRegistry-Test-Graphql

**Environment:** test (`c6a6e5-test`)  
**Workload:** `nr-site-registry-test-backend`  
**Default time range:** Last **6 hours** for `rate[5m]` charts; Last **24 hours** for `increase[6h]` / `[24h]` Number panels

All panels live on **one dashboard** grouped into **sections** (layout only — same URL, same scope).

### How to read this board

| Question | Where to look |
|----------|----------------|
| “Should we act?” | **GRAPHQL HEALTH → Enquiry failures (server/unknown)** |
| “Is there traffic?” | Total successes, success rate charts |
| “What’s failing everywhere?” (debug) | All GraphQL failures by operation |
| “Wire HTTP / auth problems?” | **HTTP LAYER**, **AUTH** sections |
| “Are public users broken?” (future) | Needs **`user_audience=external`** label in code — not on dashboard yet |

**Important:** High GraphQL **failure** counts often mean `error_class=client` (e.g. `success: false` on site-detail tabs for logged-in users). That is **not** the same as an outage. Use the **enquiry + server/unknown** panel for actionable signals.

### Section: OVERVIEW (1 panel)

#### Panel: Dashboard overview

| Setting | Value |
|---------|--------|
| **Type** | Text |
| **Purpose** | Scope (`c6a6e5-test`), how to read `client` vs `server` vs `unknown`, which panel to use for incidents |

**Suggested content:**

```text
Site Registry — test operational dashboard
Scope: c6a6e5-test / nr-site-registry-test-backend

For incidents: GRAPHQL HEALTH → Enquiry failures (server/unknown)

Raw failure charts include expected client failures on site-detail APIs
(disclosure, cart, etc.) when users are logged in — not necessarily user-facing outages.

Metric prefix: site_registry_*
```

### Section: GRAPHQL HEALTH (8 panels)

Covers metric families **1** (`graphql_operations_total`) and **2** (`graphql_operation_duration_seconds`).

#### Panel 1: Enquiry failures — server/unknown only (action panel)

| Setting | Value |
|---------|--------|
| **Type** | Timechart |
| **Metric** | `site_registry_graphql_operations_total` |
| **Reads as** | Real problems on search / site view / map — **open this first in standup** |

```promql
sum(rate(site_registry_graphql_operations_total{
  operation=~"searchSites|findSiteBySiteId|findSiteBySiteIdLoggedInUser|MapSearch_findSitesAndPlaces",
  outcome="failure",
  error_class=~"server|unknown"
}[5m])) by (operation)
```

**Filters explained:**

- **operation** — enquiry flows only (excludes tab APIs like `getSiteDisclosureBySiteId`)
- **outcome=failure** — backend classified as failed
- **error_class=server|unknown** — drops expected `client` noise

#### Panel 2: GraphQL successes by operation

| Setting | Value |
|---------|--------|
| **Type** | Timechart |

```promql
sum(rate(site_registry_graphql_operations_total{outcome="success"}[5m])) by (operation)
```

**Reads as:** Successful GraphQL ops per second, one line per `operation` name.

#### Panel 3: GraphQL failures by operation (debug)

| Setting | Value |
|---------|--------|
| **Type** | Timechart |

```promql
sum(rate(site_registry_graphql_operations_total{outcome="failure"}[5m])) by (operation)
```

**Reads as:** All failures including tab noise — useful for debugging, **not** the primary incident panel.

#### Panel 4: Total GraphQL successes

| Setting | Value |
|---------|--------|
| **Type** | Number |
| **Dashboard time** | Last 6h or 24h (match `[6h]` / `[24h]`) |

```promql
sum(increase(site_registry_graphql_operations_total{outcome="success"}[6h]))
```

Use **no** `by (operation)` on Number panels.

#### Panel 5: Total GraphQL failures

| Setting | Value |
|---------|--------|
| **Type** | Number |

```promql
sum(increase(site_registry_graphql_operations_total{outcome="failure"}[6h]))
```

Use `[6h]` if metrics are newer than 24h and `[24h]` shows empty.

#### Panel 6: Failures by error_class (optional)

| Setting | Value |
|---------|--------|
| **Type** | Timechart |

```promql
sum(rate(site_registry_graphql_operations_total{outcome="failure"}[5m])) by (error_class)
```

**Reads as:** How much is `client` vs `server` vs `unknown`.

| `error_class` | Meaning |
|---------------|---------|
| `na` | Success only |
| `client` | `success: false`, 4xx-style business/permission |
| `server` | 5xx-style / server errors |
| `unknown` | GraphQL `errors` array |

#### Panel 7: Enquiry GraphQL latency by operation

| Setting | Value |
|---------|--------|
| **Type** | Timechart |
| **Metric** | `site_registry_graphql_operation_duration_seconds` |

```promql
sum(rate(site_registry_graphql_operation_duration_seconds_sum{
  operation=~"searchSites|findSiteBySiteId|findSiteBySiteIdLoggedInUser|MapSearch_findSitesAndPlaces"
}[5m])) by (operation)
/
sum(rate(site_registry_graphql_operation_duration_seconds_count{
  operation=~"searchSites|findSiteBySiteId|findSiteBySiteIdLoggedInUser|MapSearch_findSitesAndPlaces"
}[5m])) by (operation)
```

**Reads as:** Average seconds per enquiry operation (~0.05 = 50 ms).

#### Panel 8: GraphQL latency — all ops (optional)

| Setting | Value |
|---------|--------|
| **Type** | Timechart |

```promql
sum(rate(site_registry_graphql_operation_duration_seconds_sum[5m]))
/
sum(rate(site_registry_graphql_operation_duration_seconds_count[5m]))
```

### Section: HTTP LAYER (5 panels)

Covers metric families **3** (`http_requests_total`) and **4** (`http_request_duration_seconds`).

GraphQL traffic often appears as **`route="/"`** — that is normal.

#### Panel 1: HTTP requests per second

| **Type** | Timechart |
| **Query** | `sum(rate(site_registry_http_requests_total[5m]))` |
| **Reads as** | Total HTTP traffic to the backend |

#### Panel 2: HTTP requests by status

| **Type** | Timechart |
| **Query** | `sum(rate(site_registry_http_requests_total[5m])) by (status)` |
| **Reads as** | Mix of 200, 401, 403, 500, etc. |

#### Panel 3: HTTP failures by status

| **Type** | Timechart |
| **Query** | `sum(rate(site_registry_http_requests_total{outcome="failure"}[5m])) by (status, error_class)` |
| **Reads as** | Wire-level 4xx/5xx (complements GraphQL body failures) |

#### Panel 4: HTTP latency (average seconds)

| **Type** | Timechart |

```promql
sum(rate(site_registry_http_request_duration_seconds_sum[5m]))
/
sum(rate(site_registry_http_request_duration_seconds_count[5m]))
```

#### Panel 5: HTTP by route (optional / debug)

| **Type** | Timechart |
| **Query** | `topk(5, sum(rate(site_registry_http_requests_total[5m])) by (route))` |

### Section: AUTH (2 panels)

Covers metric family **5** (`auth_failures_total`). Counts **wire 401/403** only — not GraphQL auth in JSON bodies.

#### Panel 1: Auth failures (6h total)

| **Type** | Number |
| **Query** | `sum(increase(site_registry_auth_failures_total[6h]))` |
| **Reads as** | Count of 401/403 in the window — often low in test |

#### Panel 2: Auth failures over time

| **Type** | Timechart |
| **Query** | `sum(rate(site_registry_auth_failures_total[5m])) by (reason)` |
| **Labels** | `reason=unauthorized` (401), `reason=forbidden` (403) |

### Golden operations (enquiry list)

| Operation | User action |
|-----------|-------------|
| `searchSites` | Site search |
| `findSiteBySiteId` | Open site (anonymous / public path) |
| `findSiteBySiteIdLoggedInUser` | Open site (logged in) |
| `MapSearch_findSitesAndPlaces` | Map search |

### Planned follow-up (go-live)

- Add **`user_audience`** label: `internal` (IDIR), `external` (BCeID / BCeID Business), `anonymous`
- New section **PUBLIC / EXTERNAL** with enquiry panels filtered to `user_audience="external"`
- Clone dashboard for prod (change namespace/workload only)

---

## Environment strategy

| Environment | Use |
|-------------|-----|
| **Local** | Fast feedback while adding instrumentation; optional local Prometheus + Grafana for learning. |
| **Test (shared cluster)** | Preferred for **stakeholder demos** when metrics are scraped the same way as production — proves end-to-end visibility. |

Workflow that often works well: validate instrumentation **locally**, then deploy to **test** for the dashboard people actually share.

---

## Test pod verification (OpenShift)

After deploy to test, confirm `/metrics` on the **backend** pod before building Sysdig dashboards. Full steps, PromQL, and troubleshooting: **[Application metrics & Sysdig](./application-metrics-sysdig.md)** (Part 2 and Part 3).

Quick reference (namespace `c6a6e5-test`, port **3000** on current test deploy — always confirm with `oc describe pod`):

```bash
oc project c6a6e5-test
oc get pods -l app.kubernetes.io/name=backend,app.kubernetes.io/instance=nr-site-registry-test

POD=<your-backend-pod>   # e.g. nr-site-registry-test-backend-7f4dc577df-7fkhf

# Terminal 1
oc port-forward pod/"$POD" -c nr-site-registry-test-backend 13000:3000

# Terminal 2 — then use the test UI, and run again
curl -s http://127.0.0.1:13000/metrics | grep -E '^# (HELP|TYPE) site_registry'
curl -s http://127.0.0.1:13000/metrics | grep site_registry_graphql_operations_total
```

| Check | Pass criteria |
|-------|----------------|
| Scrape annotations | `prometheus.io/scrape=true`, `path=/metrics`, `port` = container `PORT` |
| HTTP | `curl` returns **200**, no login |
| Labels | `operation="searchSites"` (and other named ops) after UI traffic |
| Sysdig | Explore finds `site_registry_graphql_operations_total` in `c6a6e5-test` |

---

## Future extensions (not required for the first slice)

- **Alerts** (error rate, latency SLO) with notification channels.
- **Operational excellence hub** — links from dashboards to runbooks, service catalog, and recurring incident themes.
- **Ticket integration** — only if the team wants workflow automation; not part of the initial dashboard-only goal.

---

## References

- [Application metrics & Sysdig](./application-metrics-sysdig.md) — implementation, **test pod verification**, PromQL examples
- [SiteRegistry-Test-Graphql panel catalog](#sysdig-dashboard-siteregistry-test-graphql) — all 16 panels by section
- RED method (rate, errors, duration) for request-style services.
- USE method (utilization, saturation, errors) for resources.
- Org standard: confirm with platform whether **test** uses the same **Sysdig** / **Prometheus** scrape path as production and how namespaces are labeled.