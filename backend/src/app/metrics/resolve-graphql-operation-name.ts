import { getOperationAST, parse } from 'graphql';

/**
 * Resolves the operation label for metrics. Uses the client-provided operationName when
 * present; otherwise parses the query document (safe fallback; does not affect execution).
 */
export function resolveGraphqlOperationName(
  operationName: string | undefined | null,
  query?: string,
): string {
  const trimmed = operationName?.trim();
  if (trimmed) {
    return trimmed;
  }

  if (!query?.trim()) {
    return 'anonymous';
  }

  try {
    const document = parse(query);
    const operation = getOperationAST(document, undefined);
    return operation?.name?.value ?? 'anonymous';
  } catch {
    return 'anonymous';
  }
}
