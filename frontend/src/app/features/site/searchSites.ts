import { print } from 'graphql';
import { GRAPHQL } from '../../helpers/endpoints';
import { getAxiosInstance } from '../../helpers/utility';
import { SiteSortBy, SortByDirection } from '../../../graphql/generated';
import { graphQlSiteQuery } from './graphql/Site';

export type SearchSiteRow = {
  id: string;
  [field: string]: unknown;
};

export type SearchSitesResult = {
  sites: SearchSiteRow[];
  count: number;
  page: number;
  pageSize: number;
};

export type SearchSitesArgs = {
  searchParam: string;
  page: number;
  pageSize: number;
  sortBy: SiteSortBy;
  sortByDir: SortByDirection;
  filter: Record<string, unknown>;
  signal?: AbortSignal;
};

export async function searchSites(
  args: SearchSitesArgs,
): Promise<SearchSitesResult> {
  const searchParam = args.searchParam.trim();
  if (!searchParam) {
    return {
      sites: [],
      count: 0,
      page: args.page,
      pageSize: args.pageSize,
    };
  }

  const response = await getAxiosInstance().post(
    GRAPHQL,
    {
      operationName: 'searchSites',
      query: print(graphQlSiteQuery()),
      variables: {
        searchParam,
        page: args.page,
        pageSize: args.pageSize,
        sortBy: args.sortBy,
        sortByDir: args.sortByDir,
        filters: args.filter,
      },
    },
    { signal: args.signal },
  );

  const errors = response.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors[0]?.message || 'Search failed');
  }

  const result = response.data?.data?.searchSites;
  if (!result) {
    throw new Error('Search failed');
  }

  return {
    sites: (result.sites ?? []) as SearchSiteRow[],
    count: result.count ?? 0,
    page: result.page ?? args.page,
    pageSize: result.pageSize ?? args.pageSize,
  };
}
