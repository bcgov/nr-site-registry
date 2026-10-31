import { print } from 'graphql';
import { GRAPHQL } from '../../helpers/endpoints';
import { getAxiosInstance } from '../../helpers/utility';
import { graphQLRecentViewsByUserId } from '../site/graphql/Dashboard';

export type RecentView = {
  userId: string;
  siteId: string;
  address: string;
  city: string;
  generalDescription: string;
  whenUpdated: string;
};

export async function fetchRecentViews(
  userId: string,
  signal?: AbortSignal,
): Promise<RecentView[]> {
  const response = await getAxiosInstance().post(
    GRAPHQL,
    {
      operationName: 'getRecentViewsByUserId',
      query: print(graphQLRecentViewsByUserId()),
      variables: {
        userId,
      },
    },
    { signal },
  );

  const errors = response.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors[0]?.message || 'Unable to load recent views');
  }

  const result = response.data?.data?.getRecentViewsByUserId;
  if (
    result &&
    (result.httpStatusCode === 200 || result.httpStatusCode === 404)
  ) {
    return (result.data ?? []) as RecentView[];
  }

  throw new Error(result?.message || 'Unable to load recent views');
}
