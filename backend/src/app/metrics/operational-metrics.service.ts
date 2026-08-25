import { Injectable, Optional } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';
import { DataSource } from 'typeorm';
import { classifyHttpStatus } from './classify-http-status';

/**
 * Central Prometheus registry for Site Registry operational metrics.
 * Exposed at GET /metrics (see main.ts). Scraped in OpenShift via pod annotations.
 *
 * Five metric families (prefix site_registry_):
 * - GraphQL: per operationName success/failure + latency (primary dashboards)
 * - HTTP: per request method/route/status (health, REST, wire-level errors)
 * - Auth: wire 401/403 only (guard label is "http" today)
 */
export type GraphqlOutcome = 'success' | 'failure';
export type GraphqlErrorClass = 'na' | 'client' | 'server' | 'unknown';
export type AuthFailureReason = 'unauthorized' | 'forbidden';
export type AuthFailureGuard =
  | 'http'
  | 'auth'
  | 'resource'
  | 'role'
  | 'unknown';
export type LtsaOperation = 'dump_1' | 'dump_2' | 'load';
export type LtsaOutcome = 'success' | 'warning' | 'failure';
export type LtsaRecordResult = 'returned' | 'loaded' | 'skipped' | 'changed';
export type LtsaFailureStage =
  | 'auth'
  | 'validation'
  | 'parse'
  | 'lock'
  | 'stage'
  | 'merge'
  | 'audit'
  | 'retention'
  | 'unknown';

const GRAPHQL_DURATION_BUCKETS = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
];

@Injectable()
export class OperationalMetricsService {
  private readonly registry: Registry;

  private readonly graphqlOperationsTotal: Counter<
    'operation' | 'outcome' | 'error_class'
  >;

  private readonly graphqlOperationDurationSeconds: Histogram<
    'operation' | 'outcome'
  >;

  private readonly httpRequestsTotal: Counter<
    'method' | 'route' | 'status' | 'outcome' | 'error_class'
  >;

  private readonly httpRequestDurationSeconds: Histogram<
    'method' | 'route' | 'outcome'
  >;

  private readonly authFailuresTotal: Counter<'reason' | 'guard'>;
  private readonly ltsaRunsTotal: Counter<'operation' | 'outcome'>;
  private readonly ltsaRunDurationSeconds: Histogram<'operation' | 'outcome'>;
  private readonly ltsaRecordsTotal: Counter<'operation' | 'result'>;
  private readonly ltsaStageFailuresTotal: Counter<'operation' | 'stage'>;
  private readonly ltsaLockConflictsTotal: Counter<'operation'>;
  private readonly ltsaLastSuccessUnixtimeSeconds: Gauge<'operation'>;
  private readonly ltsaLastRunRecords: Gauge<'operation' | 'result'>;

  constructor(@Optional() private readonly dataSource?: DataSource) {
    this.registry = new Registry();

    this.graphqlOperationsTotal = new Counter({
      name: 'site_registry_graphql_operations_total',
      help: 'Count of GraphQL operations by operationName and outcome.',
      labelNames: ['operation', 'outcome', 'error_class'],
      registers: [this.registry],
    });

    this.graphqlOperationDurationSeconds = new Histogram({
      name: 'site_registry_graphql_operation_duration_seconds',
      help: 'GraphQL operation duration in seconds.',
      labelNames: ['operation', 'outcome'],
      buckets: GRAPHQL_DURATION_BUCKETS,
      registers: [this.registry],
    });

    this.httpRequestsTotal = new Counter({
      name: 'site_registry_http_requests_total',
      help: 'HTTP requests by method, route, and status code.',
      labelNames: ['method', 'route', 'status', 'outcome', 'error_class'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'site_registry_http_request_duration_seconds',
      help: 'HTTP request duration in seconds.',
      labelNames: ['method', 'route', 'outcome'],
      buckets: GRAPHQL_DURATION_BUCKETS,
      registers: [this.registry],
    });

    this.authFailuresTotal = new Counter({
      name: 'site_registry_auth_failures_total',
      help: 'Authentication and authorization failures.',
      labelNames: ['reason', 'guard'],
      registers: [this.registry],
    });

    this.ltsaRunsTotal = new Counter({
      name: 'site_registry_ltsa_runs_total',
      help: 'LTSA processing runs by terminal outcome.',
      labelNames: ['operation', 'outcome'],
      registers: [this.registry],
    });
    this.ltsaRunDurationSeconds = new Histogram({
      name: 'site_registry_ltsa_run_duration_seconds',
      help: 'LTSA processing run duration in seconds.',
      labelNames: ['operation', 'outcome'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300, 900, 3600],
      registers: [this.registry],
    });
    this.ltsaRecordsTotal = new Counter({
      name: 'site_registry_ltsa_records_total',
      help: 'LTSA records returned, loaded, skipped, or changed.',
      labelNames: ['operation', 'result'],
      registers: [this.registry],
    });
    this.ltsaStageFailuresTotal = new Counter({
      name: 'site_registry_ltsa_stage_failures_total',
      help: 'LTSA failures by operation and bounded processing stage.',
      labelNames: ['operation', 'stage'],
      registers: [this.registry],
    });
    this.ltsaLockConflictsTotal = new Counter({
      name: 'site_registry_ltsa_lock_conflicts_total',
      help: 'LTSA loads rejected because another load held the advisory lock.',
      labelNames: ['operation'],
      registers: [this.registry],
    });
    this.ltsaLastSuccessUnixtimeSeconds = new Gauge({
      name: 'site_registry_ltsa_last_success_unixtime_seconds',
      help: 'Completion timestamp of the latest accepted LTSA operation.',
      labelNames: ['operation'],
      registers: [this.registry],
    });
    this.ltsaLastRunRecords = new Gauge({
      name: 'site_registry_ltsa_last_run_records',
      help: 'Record counts from the latest accepted LTSA operation.',
      labelNames: ['operation', 'result'],
      registers: [this.registry],
    });
  }

  getPromRegistry(): Registry {
    return this.registry;
  }

  /** Called from GraphqlMetricsPlugin after each GraphQL response is sent. */
  recordGraphqlOperation(args: {
    operation: string;
    outcome: GraphqlOutcome;
    errorClass: GraphqlErrorClass;
    durationSeconds: number;
  }): void {
    const operation = args.operation || 'anonymous';
    const labels = {
      operation,
      outcome: args.outcome,
      error_class: args.errorClass,
    };

    this.graphqlOperationsTotal.inc(labels);
    this.graphqlOperationDurationSeconds.observe(
      { operation, outcome: args.outcome },
      args.durationSeconds,
    );
  }

  /** Called from HTTP middleware on res.finish (see http-metrics.middleware.ts). */
  recordHttpRequest(args: {
    method: string;
    route: string;
    status: number;
    durationSeconds: number;
  }): void {
    const { outcome, errorClass } = classifyHttpStatus(args.status);
    const method = (args.method || 'GET').toUpperCase();
    const route = args.route || '/';
    const status = String(args.status);

    this.httpRequestsTotal.inc({
      method,
      route,
      status,
      outcome,
      error_class: errorClass,
    });

    this.httpRequestDurationSeconds.observe(
      { method, route, outcome },
      args.durationSeconds,
    );
  }

  /** Wire-level 401/403 from HTTP middleware; GraphQL auth in body uses graphql_operations_total. */
  recordAuthFailure(args: {
    reason: AuthFailureReason;
    guard: AuthFailureGuard;
  }): void {
    this.authFailuresTotal.inc({
      reason: args.reason,
      guard: args.guard,
    });
  }

  recordLtsaRun(
    operation: LtsaOperation,
    outcome: LtsaOutcome,
    durationSeconds: number,
  ): void {
    this.ltsaRunsTotal.inc({ operation, outcome });
    this.ltsaRunDurationSeconds.observe(
      { operation, outcome },
      durationSeconds,
    );
  }

  recordLtsaRecords(
    operation: LtsaOperation,
    result: LtsaRecordResult,
    count: number,
  ): void {
    this.ltsaRecordsTotal.inc({ operation, result }, count);
  }

  recordLtsaStageFailure(
    operation: LtsaOperation,
    stage: LtsaFailureStage,
  ): void {
    this.ltsaStageFailuresTotal.inc({ operation, stage });
  }

  recordLtsaLockConflict(operation: 'load'): void {
    this.ltsaLockConflictsTotal.inc({ operation });
  }

  /**
   * Refresh from PostgreSQL before each scrape/status request. Gauges therefore
   * survive process restarts and agree across replicas.
   */
  async refreshLtsaGauges(): Promise<void> {
    if (!this.dataSource?.isInitialized) return;
    try {
      const schema = (this.dataSource.options as { schema?: string }).schema;
      const runsTable = schema
        ? `"${schema.replace(/"/g, '""')}"."ltsa_runs"`
        : '"ltsa_runs"';
      const rows: Array<{
        operation: LtsaOperation;
        completed_at: Date | string;
        records_returned: number | string;
        records_loaded: number | string;
        malformed_records: number | string;
        changed_records: number | string;
      }> = await this.dataSource.query(`
        SELECT DISTINCT ON (operation)
               operation, completed_at, records_returned, records_loaded,
               malformed_records, changed_records
        FROM ${runsTable}
        WHERE status IN ('success', 'warning')
        ORDER BY operation, completed_at DESC
      `);
      const operations: LtsaOperation[] = ['dump_1', 'dump_2', 'load'];
      const results: LtsaRecordResult[] = [
        'returned',
        'loaded',
        'skipped',
        'changed',
      ];
      for (const operation of operations) {
        this.ltsaLastSuccessUnixtimeSeconds.set({ operation }, 0);
        for (const result of results) {
          this.ltsaLastRunRecords.set({ operation, result }, 0);
        }
      }
      for (const latest of rows) {
        this.ltsaLastSuccessUnixtimeSeconds.set(
          { operation: latest.operation },
          new Date(latest.completed_at).getTime() / 1000,
        );
        this.ltsaLastRunRecords.set(
          { operation: latest.operation, result: 'returned' },
          Number(latest.records_returned),
        );
        this.ltsaLastRunRecords.set(
          { operation: latest.operation, result: 'loaded' },
          Number(latest.records_loaded),
        );
        this.ltsaLastRunRecords.set(
          { operation: latest.operation, result: 'skipped' },
          Number(latest.malformed_records),
        );
        this.ltsaLastRunRecords.set(
          { operation: latest.operation, result: 'changed' },
          Number(latest.changed_records),
        );
      }
    } catch {
      // Metrics must remain scrapeable while migrations are being deployed.
    }
  }
}
