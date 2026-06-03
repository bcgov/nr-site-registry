import { Module } from '@nestjs/common';
import { OperationalMetricsService } from './operational-metrics.service';
import { GraphqlMetricsPlugin } from './graphql-metrics.plugin';

/** Wires metrics service + Apollo plugin; imported by AppModule and GraphQLModule.forRootAsync. */
@Module({
  providers: [OperationalMetricsService, GraphqlMetricsPlugin],
  exports: [OperationalMetricsService, GraphqlMetricsPlugin],
})
export class MetricsModule {}

