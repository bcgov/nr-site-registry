import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';
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
  'http' | 'auth' | 'resource' | 'role' | 'unknown';

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

  constructor() {
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
}
