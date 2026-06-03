import type { GraphqlErrorClass, GraphqlOutcome } from './operational-metrics.service';

/** Maps wire HTTP status codes to outcome/error_class for HTTP and GraphQL metrics. */

export type HttpClassification = {
  outcome: GraphqlOutcome;
  errorClass: GraphqlErrorClass;
};

/**
 * Wire HTTP status: 2xx success; 4xx client failure; 5xx server failure.
 */
export function classifyHttpStatus(status: number): HttpClassification {
  if (status >= 500) {
    return { outcome: 'failure', errorClass: 'server' };
  }
  if (status >= 400) {
    return { outcome: 'failure', errorClass: 'client' };
  }
  return { outcome: 'success', errorClass: 'na' };
}

export function errorClassFromHttpStatus(status: number): GraphqlErrorClass {
  if (status >= 500) {
    return 'server';
  }
  if (status >= 400) {
    return 'client';
  }
  return 'unknown';
}
