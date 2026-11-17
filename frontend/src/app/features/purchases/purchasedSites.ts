import { print } from 'graphql';
import { SortByDirection } from '../../../graphql/generated';
import { GRAPHQL } from '../../helpers/endpoints';
import { getAxiosInstance } from '../../helpers/utility';
import { getPurchasedSitesQL } from '../site/graphql/Snapshot';

export const purchaseSortFields = [
  'siteId',
  'address',
  'city',
  'purchaseDate',
  'status',
] as const;

export type PurchaseSortField = (typeof purchaseSortFields)[number];

export function isPurchaseSortField(value: string): value is PurchaseSortField {
  return (purchaseSortFields as readonly string[]).includes(value);
}

export type PurchasedSite = {
  siteId: string;
  address: string;
  city: string;
  purchaseDate: string;
  status: string;
};

export type PurchasedSitesResult = {
  sites: PurchasedSite[];
  count: number;
};

export type PurchasedSitesArgs = {
  page: number;
  pageSize: number;
  sortBy: PurchaseSortField;
  sortByDir: SortByDirection;
  signal?: AbortSignal;
};

export async function fetchPurchasedSites(
  args: PurchasedSitesArgs,
): Promise<PurchasedSitesResult> {
  const response = await getAxiosInstance().post(
    GRAPHQL,
    {
      operationName: 'getPurchasedSites',
      query: print(getPurchasedSitesQL()),
      variables: {
        page: args.page,
        pageSize: args.pageSize,
        sortBy: args.sortBy,
        sortByDir: args.sortByDir,
      },
    },
    { signal: args.signal },
  );

  const result = response.data?.data?.getPurchasedSites;
  if (
    result &&
    (result.httpStatusCode === 200 || result.httpStatusCode === 404)
  ) {
    return {
      sites: (result.data ?? []) as PurchasedSite[],
      count: result.totalRecords ?? 0,
    };
  }

  const errors = response.data?.errors;
  const message = Array.isArray(errors) ? errors[0]?.message : undefined;
  throw new Error(message || result?.message || 'Unable to load purchases');
}
