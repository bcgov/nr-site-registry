import { useEffect } from 'react';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { GridSort } from '../../components/grid/Grid';
import { SortByDirection } from '../../../graphql/generated';
import {
  gridSortDirection,
  nextSortDirection,
  sortDirectionFromQuery,
  sortFieldFromQuery,
} from '../../helpers/pagedList';
import { positiveInteger } from '../../helpers/positiveInteger';

export const sectionListParamKeys = [
  'sortBy',
  'sortByDir',
  'page',
  'pageSize',
] as const;

export const sectionSearchParam = 'search';

function withoutQueryParams(search: string, keys: readonly string[]): string {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  );
  let changed = false;
  keys.forEach((key) => {
    if (params.has(key)) {
      params.delete(key);
      changed = true;
    }
  });
  if (!changed) {
    return search;
  }
  const next = params.toString();
  return next ? `?${next}` : '';
}

export function searchWithoutSectionListParams(search: string): string {
  return withoutQueryParams(search, sectionListParamKeys);
}

export function searchWithoutSectionNavigationParams(search: string): string {
  return withoutQueryParams(search, [
    ...sectionListParamKeys,
    sectionSearchParam,
  ]);
}

const sectionSearchQueryParams = {
  search: withDefault(StringParam, ''),
};

export function useSectionSearchQuery() {
  const [query, setQuery] = useQueryParams(sectionSearchQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const search = query.search ?? '';

  const setSearch = (value: string) => {
    setQuery({ search: value ? value : undefined }, 'replaceIn');
  };

  return { search, setSearch };
}

const sortQueryParams = {
  sortBy: withDefault(StringParam, ''),
  sortByDir: withDefault(StringParam, SortByDirection.Asc),
};

export function useSectionSortQuery(allowed: readonly string[]) {
  const [query, setQuery] = useQueryParams(sortQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const sortBy = sortFieldFromQuery(query.sortBy, allowed, '');
  const sortByDir = sortDirectionFromQuery(
    query.sortByDir,
    SortByDirection.Asc,
  );

  useEffect(() => {
    if (query.sortBy && !allowed.includes(query.sortBy)) {
      setQuery({ sortBy: undefined, sortByDir: undefined }, 'replaceIn');
    }
  }, [allowed, query.sortBy, setQuery]);

  const gridSort: GridSort | null = sortBy
    ? { id: sortBy, direction: gridSortDirection(sortByDir) }
    : null;

  const setColumnSort = (columnId: string) => {
    if (!allowed.includes(columnId)) {
      return;
    }
    setQuery({
      sortBy: columnId,
      sortByDir: nextSortDirection(sortBy, sortByDir, columnId),
    });
  };

  return { sortBy, sortByDir, gridSort, setQuery, setColumnSort };
}

const parcelSortFields = [
  'id',
  'description_type',
  'id_pin_number',
  'date_noted',
  'land_description',
] as const;

const parcelQueryParams = {
  page: withDefault(NumberParam, 1),
  pageSize: withDefault(NumberParam, 5),
  sortBy: withDefault(StringParam, 'id'),
  sortByDir: withDefault(StringParam, SortByDirection.Asc),
  search: withDefault(StringParam, ''),
};

export function useParcelListQuery() {
  const [query, setQuery] = useQueryParams(parcelQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const page = positiveInteger(query.page, 1);
  const pageSize = positiveInteger(query.pageSize, 5);
  const sortBy = sortFieldFromQuery(query.sortBy, parcelSortFields, 'id');
  const sortByDir = sortDirectionFromQuery(
    query.sortByDir,
    SortByDirection.Asc,
  );
  const search = query.search ?? '';

  return { page, pageSize, sortBy, sortByDir, search, setQuery };
}
