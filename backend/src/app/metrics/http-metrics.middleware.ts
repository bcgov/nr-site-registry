import type { Request, Response, NextFunction } from 'express';
import { OperationalMetricsService } from './operational-metrics.service';

/**
 * Express middleware registered in main.ts on the underlying Express instance.
 * Complements GraphQL metrics: counts HTTP requests (status code, route, duration).
 * Use GraphQL metrics for per-operation health (searchSites, etc.).
 */

/** Keeps Prometheus label cardinality low (one series per route pattern, not per site id). */
function normalizeRoute(path: string | undefined): string {
  if (!path || path === '/') {
    return '/';
  }
  // Collapse UUIDs and numeric ids for lower cardinality.
  return path
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/:id',
    )
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function createHttpMetricsMiddleware(
  metrics: OperationalMetricsService,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Do not count scraper traffic against http_requests_total.
    if (req.path === '/metrics') {
      next();
      return;
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      const status = res.statusCode || 200;

      metrics.recordHttpRequest({
        method: req.method,
        route: normalizeRoute(req.path),
        status,
        durationSeconds,
      });

      if (status === 401) {
        metrics.recordAuthFailure({ reason: 'unauthorized', guard: 'http' });
      } else if (status === 403) {
        metrics.recordAuthFailure({ reason: 'forbidden', guard: 'http' });
      }
    });

    next();
  };
}
