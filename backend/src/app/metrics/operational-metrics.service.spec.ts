import { OperationalMetricsService } from './operational-metrics.service';

describe('OperationalMetricsService LTSA metrics', () => {
  it('records run, record, and lock metrics', async () => {
    const metrics = new OperationalMetricsService();
    metrics.recordLtsaRun('load', 'warning', 2.5);
    metrics.recordLtsaRecords('load', 'loaded', 10);
    metrics.recordLtsaRecords('load', 'skipped', 2);
    metrics.recordLtsaRecords('load', 'changed', 4);
    metrics.recordLtsaStageFailure('load', 'validation');
    metrics.recordLtsaLockConflict('load');

    const output = await metrics.getPromRegistry().metrics();
    expect(output).toContain(
      'site_registry_ltsa_runs_total{operation="load",outcome="warning"} 1',
    );
    expect(output).toContain(
      'site_registry_ltsa_records_total{operation="load",result="skipped"} 2',
    );
    expect(output).toContain(
      'site_registry_ltsa_stage_failures_total{operation="load",stage="validation"} 1',
    );
    expect(output).toContain(
      'site_registry_ltsa_lock_conflicts_total{operation="load"} 1',
    );
    for (const family of [
      'site_registry_ltsa_runs_total',
      'site_registry_ltsa_run_duration_seconds',
      'site_registry_ltsa_records_total',
      'site_registry_ltsa_stage_failures_total',
      'site_registry_ltsa_lock_conflicts_total',
      'site_registry_ltsa_last_success_unixtime_seconds',
      'site_registry_ltsa_last_run_records',
    ]) {
      expect(output).toContain(`# HELP ${family}`);
    }
  });

  it('refreshes latest-success gauges from the database', async () => {
    const dataSource = {
      isInitialized: true,
      options: {},
      query: jest.fn().mockResolvedValue([
        {
          operation: 'load',
          completed_at: '2026-07-14T12:00:00.000Z',
          records_returned: '0',
          records_loaded: '42',
          malformed_records: '3',
          changed_records: '7',
        },
        {
          operation: 'dump_1',
          completed_at: '2026-07-14T11:00:00.000Z',
          records_returned: '100',
          records_loaded: '0',
          malformed_records: '0',
          changed_records: '0',
        },
      ]),
    };
    const metrics = new OperationalMetricsService(dataSource as any);

    await metrics.refreshLtsaGauges();

    const output = await metrics.getPromRegistry().metrics();
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE status IN ('success', 'warning')"),
    );
    expect(output).toContain(
      'site_registry_ltsa_last_success_unixtime_seconds{operation="load"} 1784030400',
    );
    expect(output).toContain(
      'site_registry_ltsa_last_run_records{operation="load",result="loaded"} 42',
    );
    expect(output).toContain(
      'site_registry_ltsa_last_run_records{operation="load",result="skipped"} 3',
    );
    expect(output).toContain(
      'site_registry_ltsa_last_run_records{operation="load",result="changed"} 7',
    );
    expect(output).toContain(
      'site_registry_ltsa_last_run_records{operation="dump_1",result="returned"} 100',
    );
  });

  it('keeps metrics scrapeable when the LTSA migration is unavailable', async () => {
    const dataSource = {
      isInitialized: true,
      options: {},
      query: jest.fn().mockRejectedValue(new Error('relation missing')),
    };
    const metrics = new OperationalMetricsService(dataSource as any);
    await expect(metrics.refreshLtsaGauges()).resolves.toBeUndefined();
    await expect(metrics.getPromRegistry().metrics()).resolves.toContain(
      'site_registry_ltsa_last_success_unixtime_seconds',
    );
  });
});
