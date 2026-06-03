import { EventEmitter } from 'events';
import { OperationalMetricsService } from './operational-metrics.service';
import { createHttpMetricsMiddleware } from './http-metrics.middleware';

function createMockResponse(statusCode: number) {
  const res = new EventEmitter() as EventEmitter & {
    statusCode: number;
    on: EventEmitter['on'];
  };
  res.statusCode = statusCode;
  return res;
}

describe('createHttpMetricsMiddleware', () => {
  it('records HTTP request and auth failure for 401', (done) => {
    const metrics = new OperationalMetricsService();
    const middleware = createHttpMetricsMiddleware(metrics);
    const req = { method: 'POST', path: '/graphql' } as any;
    const res = createMockResponse(401);

    middleware(req, res as any, () => {
      res.emit('finish');
      setImmediate(async () => {
        const output = await metrics.getPromRegistry().metrics();
        expect(output).toContain('site_registry_http_requests_total');
        expect(output).toContain('status="401"');
        expect(output).toContain('site_registry_auth_failures_total');
        expect(output).toContain('reason="unauthorized"');
        done();
      });
    });
  });

  it('skips recording for /metrics', async () => {
    const metrics = new OperationalMetricsService();
    const middleware = createHttpMetricsMiddleware(metrics);
    const req = { method: 'GET', path: '/metrics' } as any;
    const res = createMockResponse(200);

    await new Promise<void>((resolve) => {
      middleware(req, res as any, () => resolve());
    });

    res.emit('finish');
    const output = await metrics.getPromRegistry().metrics();
    expect(output).not.toMatch(/site_registry_http_requests_total\{/);
  });
});
