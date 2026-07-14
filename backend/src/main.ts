import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './app/logger/logger.service';
import { OperationalMetricsService } from './app/metrics/operational-metrics.service';
import { createHttpMetricsMiddleware } from './app/metrics/http-metrics.middleware';
const logger = new LoggerService();
async function main() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- Operational metrics (Prometheus / Sysdig) ---
  const metricsService = app.get(OperationalMetricsService);
  // Nest runs on Express (@nestjs/platform-express); getInstance() is the raw Express app.
  const http = app.getHttpAdapter().getInstance();
  http.use(createHttpMetricsMiddleware(metricsService));

  // GET /metrics on Express (not a Nest @Controller) so global Keycloak APP_GUARDs in
  // app.module.ts do not require a JWT for the cluster Prometheus/Sysdig scraper.
  http.get('/metrics', async (_req, res) => {
    await metricsService.refreshLtsaGauges();
    const registry = metricsService.getPromRegistry();
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  });

  await app.listen(process.env.PORT || 4007);
}
main()
  .then(() => {
    logger.log(`Process start up took ${process.uptime()} seconds`);
  })
  .catch((err) => {
    logger.error(err.message, err.stack);
  });
