import { OperationalMetricsService } from './operational-metrics.service';
import { GraphqlMetricsPlugin } from './graphql-metrics.plugin';

describe('GraphqlMetricsPlugin', () => {
  it('increments success counter for GetSites operation', async () => {
    const metrics = new OperationalMetricsService();
    const plugin = new GraphqlMetricsPlugin(metrics);

    const listener = await plugin.requestDidStart({} as any);

    await listener?.willSendResponse?.({
      request: { operationName: 'GetSites' },
      response: { body: { kind: 'single', singleResult: {} } },
    } as any);

    const registry = metrics.getPromRegistry();
    const output = await registry.getSingleMetricAsString(
      'site_registry_graphql_operations_total',
    );

    expect(output).toContain('operation="GetSites"');
    expect(output).toContain('outcome="success"');
    expect(output).toContain('error_class="na"');
  });

  it('increments failure counter when GraphQL response has errors', async () => {
    const metrics = new OperationalMetricsService();
    const plugin = new GraphqlMetricsPlugin(metrics);

    const listener = await plugin.requestDidStart({} as any);

    await listener?.willSendResponse?.({
      request: { operationName: 'GetSites' },
      response: {
        body: {
          kind: 'single',
          singleResult: {
            errors: [{ message: 'nope' }],
          },
        },
      },
    } as any);

    const registry = metrics.getPromRegistry();
    const output = await registry.getSingleMetricAsString(
      'site_registry_graphql_operations_total',
    );

    expect(output).toContain('operation="GetSites"');
    expect(output).toContain('outcome="failure"');
    expect(output).toContain('error_class="unknown"');
  });
});

