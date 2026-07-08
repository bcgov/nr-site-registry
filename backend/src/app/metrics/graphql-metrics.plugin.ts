import { Plugin } from '@nestjs/apollo';
import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestContextWillSendResponse,
} from '@apollo/server';
import { OperationalMetricsService } from './operational-metrics.service';
import { evaluateGraphqlOutcome } from './evaluate-graphql-outcome';
import { resolveGraphqlOperationName } from './resolve-graphql-operation-name';

/**
 * Apollo plugin: records one counter + one histogram sample per GraphQL operation.
 * Registered in app.module.ts (GraphQLModule plugins). Does not change resolver behavior.
 *
 * Labels operation from client operationName (frontend) or parsed query name; otherwise "anonymous".
 */
@Plugin()
export class GraphqlMetricsPlugin implements ApolloServerPlugin {
  constructor(private readonly metrics: OperationalMetricsService) {}

  async requestDidStart(_requestContext: GraphQLRequestContext<any>) {
    const start = process.hrtime.bigint();

    return {
      // Fires after the response is built so we can read errors, data, and HTTP status.
      willSendResponse: async (
        requestContext: GraphQLRequestContextWillSendResponse<any>,
      ) => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const operation = resolveGraphqlOperationName(
          requestContext.request.operationName,
          requestContext.request.query,
        );

        const singleResult =
          requestContext.response.body.kind === 'single'
            ? requestContext.response.body.singleResult
            : undefined;

        const httpStatus =
          (requestContext.response as { http?: { status?: number } }).http
            ?.status ?? 200;

        const evaluation = evaluateGraphqlOutcome({
          httpStatus,
          graphqlErrors: singleResult?.errors,
          responseData: singleResult?.data as
            Record<string, unknown> | undefined,
        });

        this.metrics.recordGraphqlOperation({
          operation,
          outcome: evaluation.outcome,
          errorClass: evaluation.errorClass,
          durationSeconds,
        });
      },
    };
  }
}
