# Site Registry

## Documentation

- [Operational metrics overview](docs/operational-metrics-dashboard.md) — goals, metric families, **Sysdig dashboard panels**
- [Application metrics & Sysdig setup](docs/application-metrics-sysdig.md) — backend instrumentation, pod verification, PromQL
- [LTSA integration](docs/ltsa-integration.md) — end-to-end flow, API and script contracts, monitoring, recovery, and go-live checklist

## Monitoring (test)

**Sysdig dashboard:** `SiteRegistry-Test-Graphql`  
**Scope:** namespace `c6a6e5-test`, workload `nr-site-registry-test-backend`

For incidents, open **GRAPHQL HEALTH → Enquiry failures (server/unknown)**.  
Raw failure charts include expected `client` noise on site-detail tabs — see the dashboard Overview panel.

**Next (go-live):** add `user_audience` label (`internal` / `external` / `anonymous`) to split public BCeID traffic from IDIR.

test webhook