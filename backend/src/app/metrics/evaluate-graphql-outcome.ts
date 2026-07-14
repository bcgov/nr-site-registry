import {
  classifyHttpStatus,
  errorClassFromHttpStatus,
} from './classify-http-status';
import type {
  GraphqlErrorClass,
  GraphqlOutcome,
} from './operational-metrics.service';

/**
 * Classifies GraphQL operation success/failure for metrics.
 * Site Registry often returns HTTP 200 with failure in the JSON body (GenericResponse).
 */

export type GraphqlOutcomeEvaluation = {
  outcome: GraphqlOutcome;
  errorClass: GraphqlErrorClass;
};

/**
 * Prefer wire HTTP status, then GraphQL errors, then payload success/httpStatusCode
 * (BaseHttpResponse-style fields on operation result objects).
 */
export function evaluateGraphqlOutcome(args: {
  httpStatus?: number;
  graphqlErrors?: readonly unknown[] | null;
  responseData?: Record<string, unknown> | null | undefined;
}): GraphqlOutcomeEvaluation {
  const httpStatus = args.httpStatus ?? 200;

  if (httpStatus >= 400) {
    return {
      outcome: 'failure',
      errorClass: errorClassFromHttpStatus(httpStatus),
    };
  }

  if (Array.isArray(args.graphqlErrors) && args.graphqlErrors.length > 0) {
    return { outcome: 'failure', errorClass: 'unknown' };
  }

  const payloadStatus = findPayloadHttpStatus(args.responseData);
  if (payloadStatus !== undefined) {
    if (payloadStatus >= 400) {
      return {
        outcome: 'failure',
        errorClass: errorClassFromHttpStatus(payloadStatus),
      };
    }
    if (hasExplicitPayloadFailure(args.responseData)) {
      return { outcome: 'failure', errorClass: 'client' };
    }
  }

  return classifyHttpStatus(httpStatus);
}

/** Any top-level field object with success: false (BaseHttpResponse pattern). */
function hasExplicitPayloadFailure(
  data: Record<string, unknown> | null | undefined,
): boolean {
  if (!data) {
    return false;
  }

  for (const value of Object.values(data)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue;
    }
    const record = value as Record<string, unknown>;
    if (record.success === false) {
      return true;
    }
  }

  return false;
}

/** Highest httpStatusCode among top-level result objects in GraphQL data. */
function findPayloadHttpStatus(
  data: Record<string, unknown> | null | undefined,
): number | undefined {
  if (!data) {
    return undefined;
  }

  let maxStatus: number | undefined;

  for (const value of Object.values(data)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.httpStatusCode === 'number') {
      maxStatus =
        maxStatus === undefined
          ? record.httpStatusCode
          : Math.max(maxStatus, record.httpStatusCode);
    }
  }

  return maxStatus;
}
