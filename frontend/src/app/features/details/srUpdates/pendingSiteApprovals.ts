import { print } from 'graphql';
import { GRAPHQL } from '../../../helpers/endpoints';
import { getAxiosInstance } from '../../../helpers/utility';
import { SiteSortBy, SortByDirection } from '../../../../graphql/generated';
import {
  bulkAproveRejectChangesQL,
  getPendingSiteForSRApprovalQL,
} from '../../site/graphql/Site';

export type PendingApprovalRow = {
  id: string;
  siteId: string;
  changes: string;
  whoUpdated: string;
  whenUpdated: string;
  address: string;
};

export type ApprovalSearch = {
  id?: string;
  changes?: string;
  addrLine?: string;
  whenUpdated?: string;
  whoCreated?: string;
};

const searchFields = [
  'id',
  'changes',
  'addrLine',
  'whenUpdated',
  'whoCreated',
] as const;

export type PendingApprovalsResult = {
  sites: PendingApprovalRow[];
  count: number;
};

export type PendingApprovalsArgs = {
  search: ApprovalSearch | null;
  page: number;
  pageSize: number;
  sortBy: SiteSortBy;
  sortByDir: SortByDirection;
  signal?: AbortSignal;
};

export function approvalSearchFrom(value: unknown): ApprovalSearch | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const source = value as Record<string, unknown>;
  const search: ApprovalSearch = {};
  for (const field of searchFields) {
    const fieldValue = source[field];
    if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
      search[field] = fieldValue;
    }
  }
  return Object.keys(search).length > 0 ? search : null;
}

export async function fetchPendingSitesForApproval(
  args: PendingApprovalsArgs,
): Promise<PendingApprovalsResult> {
  const response = await getAxiosInstance().post(
    GRAPHQL,
    {
      operationName: 'getPendingSiteForSRApproval',
      query: print(getPendingSiteForSRApprovalQL()),
      variables: {
        searchParam: args.search,
        page: String(args.page),
        pageSize: String(args.pageSize),
        sortBy: args.sortBy,
        sortByDir: args.sortByDir,
      },
    },
    { signal: args.signal },
  );

  const errors = response.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors[0]?.message || 'Unable to load approvals');
  }

  const result = response.data?.data?.getPendingSiteForSRApproval;
  if (!result || result.httpStatusCode !== 200) {
    throw new Error(result?.message || 'Unable to load approvals');
  }

  return {
    sites: (result.data?.data ?? []) as PendingApprovalRow[],
    count: result.data?.totalRecords ?? 0,
  };
}

export async function decidePendingSites(args: {
  sites: PendingApprovalRow[];
  isApproved: boolean;
}): Promise<void> {
  const response = await getAxiosInstance().post(GRAPHQL, {
    operationName: 'bulkAproveRejectChanges',
    query: print(bulkAproveRejectChangesQL()),
    variables: {
      approveRejectDTO: {
        sites: args.sites,
        isApproved: args.isApproved,
        fromSiteDetails: false,
      },
    },
  });

  const errors = response.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors[0]?.message || 'Failed to update');
  }

  const result = response.data?.data?.bulkAproveRejectChanges;
  const status = result?.httpStatusCode;
  if (
    !result ||
    result.success === false ||
    (typeof status === 'number' && status !== 200)
  ) {
    throw new Error(result?.message || 'Failed to update');
  }
}
