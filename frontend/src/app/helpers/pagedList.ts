import { SortByDirection } from '../../graphql/generated';

export function sortFieldFromQuery<Field extends string>(
  value: string | null | undefined,
  allowed: readonly Field[] | ReadonlySet<string>,
  fallback: Field,
): Field {
  if (value == null) {
    return fallback;
  }
  const known =
    allowed instanceof Set
      ? allowed.has(value)
      : (allowed as readonly string[]).includes(value);
  return known ? (value as Field) : fallback;
}

export function sortDirectionFromQuery(
  value: string | null | undefined,
  fallback: SortByDirection,
): SortByDirection {
  if (value === SortByDirection.Asc || value === SortByDirection.Desc) {
    return value;
  }
  return fallback;
}

export function nextSortDirection(
  currentField: string,
  currentDirection: SortByDirection,
  nextField: string,
): SortByDirection {
  return nextField === currentField && currentDirection === SortByDirection.Asc
    ? SortByDirection.Desc
    : SortByDirection.Asc;
}

export function gridSortDirection(direction: SortByDirection): 'asc' | 'desc' {
  return direction === SortByDirection.Desc ? 'desc' : 'asc';
}

export function pagedListFlags(
  rowCount: number,
  query: {
    isLoading: boolean;
    isFetching: boolean;
    isSuccess: boolean;
    isPlaceholderData: boolean;
  },
) {
  return {
    loading: query.isLoading,
    fetching: query.isFetching && !query.isLoading,
    empty: query.isSuccess && !query.isPlaceholderData && rowCount === 0,
  };
}
