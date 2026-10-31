import React, { useEffect, useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  JsonParam,
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { RequestStatus } from '../../../helpers/requests/status';
import PageContainer from '../../../components/simple/PageContainer';
import {
  BarsIcon,
  FilterIcon,
  TickIcon,
  XmarkIcon,
} from '../../../components/common/icon';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../Store';
import SRUpdatesTableFilter from './srUpdatesTableFilter';
import { showNotification } from '../../../helpers/utility';
import { fetchInternalUserNameForDropdown } from '../dropdowns/DropdownSlice';
import './srUpdatesTables.css';
import { Button } from '../../../components/button/Button';
import { SiteSortBy, SortByDirection } from '../../../../graphql/generated';
import Grid from '../../../components/grid/Grid';
import Pagination from '../../../components/table/pagination/Pagination';
import {
  approvalSearchFrom,
  decidePendingSites,
  fetchPendingSitesForApproval,
  PendingApprovalRow,
} from './pendingSiteApprovals';
import {
  buildApprovalColumns,
  columnIdForApprovalSort,
  sortFieldForApprovalColumn,
} from './approvalColumns';

const approvalSortFields = new Set<string>([
  SiteSortBy.Id,
  SiteSortBy.WhenUpdated,
  SiteSortBy.WhoCreated,
  SiteSortBy.SiteAddress,
]);

const approvalQueryParams = {
  page: withDefault(NumberParam, 1),
  pageSize: withDefault(NumberParam, 5),
  sortBy: withDefault(StringParam, SiteSortBy.Id),
  sortByDir: withDefault(StringParam, SortByDirection.Asc),
  search: withDefault(JsonParam, null),
};

function sortFieldFromAddress(value: string | null | undefined): SiteSortBy {
  if (value && approvalSortFields.has(value)) {
    return value as SiteSortBy;
  }
  return SiteSortBy.Id;
}

function sortDirectionFromAddress(
  value: string | null | undefined,
): SortByDirection {
  return value === SortByDirection.Desc
    ? SortByDirection.Desc
    : SortByDirection.Asc;
}

function positiveInteger(
  value: number | null | undefined,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}

const SRUpdatesTables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const [query, setQuery] = useQueryParams(approvalQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const page = positiveInteger(query.page, 1);
  const pageSize = positiveInteger(query.pageSize, 5);
  const sortBy = sortFieldFromAddress(query.sortBy);
  const sortByDir = sortDirectionFromAddress(query.sortByDir);
  const search = approvalSearchFrom(query.search);

  const [displayFilters, SetDisplayFilters] = useState(false);
  const [showMobileTableMenu, SetShowMobileTableMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PendingApprovalRow[]>([]);

  useEffect(() => {
    dispatch(fetchInternalUserNameForDropdown());
  }, [dispatch]);

  const approvalsQuery = useQuery({
    queryKey: [
      'pendingSiteApprovals',
      search,
      page,
      pageSize,
      sortBy,
      sortByDir,
    ],
    queryFn: ({ signal }) =>
      fetchPendingSitesForApproval({
        search,
        page,
        pageSize,
        sortBy,
        sortByDir,
        signal,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  const decision = useMutation({
    mutationFn: decidePendingSites,
    onSuccess: async () => {
      setSelectedRows([]);
      showNotification(
        RequestStatus.success,
        'Successfully updated.',
        'Failed to update',
      );
      await queryClient.invalidateQueries({
        queryKey: ['pendingSiteApprovals'],
      });
    },
    onError: () => {
      showNotification(
        RequestStatus.failed,
        'Successfully updated.',
        'Failed to update',
      );
    },
  });

  const sites: PendingApprovalRow[] = approvalsQuery.data?.sites ?? [];
  const count = approvalsQuery.data?.count ?? 0;
  const loading = approvalsQuery.isLoading;
  const fetching = approvalsQuery.isFetching && !approvalsQuery.isLoading;
  const empty =
    approvalsQuery.isSuccess &&
    !approvalsQuery.isPlaceholderData &&
    sites.length === 0;

  const isRowSelected = (row: PendingApprovalRow) =>
    selectedRows.some((item) => item.siteId === row.siteId);

  const gridColumns = buildApprovalColumns({
    pageRows: sites,
    isSelected: isRowSelected,
    onToggleRow: (row, selected) => {
      setSelectedRows((current) => {
        if (selected) {
          if (current.some((item) => item.siteId === row.siteId)) {
            return current;
          }
          return [...current, row];
        }
        return current.filter((item) => item.siteId !== row.siteId);
      });
    },
    onTogglePage: (selected) => {
      setSelectedRows((current) => {
        if (selected) {
          const existingIds = new Set(current.map((item) => item.siteId));
          return [
            ...current,
            ...sites.filter((row) => !existingIds.has(row.siteId)),
          ];
        }
        const pageIds = new Set(sites.map((row) => row.siteId));
        return current.filter((item) => !pageIds.has(item.siteId));
      });
    },
  });

  const gridSort = {
    id: columnIdForApprovalSort(sortBy),
    direction:
      sortByDir === SortByDirection.Desc ? ('desc' as const) : ('asc' as const),
  };

  const handleSortChange = (columnId: string) => {
    const nextField = sortFieldForApprovalColumn(columnId);
    if (!nextField) {
      return;
    }
    const nextDirection =
      nextField === sortBy && sortByDir === SortByDirection.Asc
        ? SortByDirection.Desc
        : SortByDirection.Asc;
    setQuery({
      sortBy: nextField,
      sortByDir: nextDirection,
      page: 1,
    });
  };

  const rejectHandler = () => {
    if (selectedRows.length === 0 || decision.isPending) {
      return;
    }
    decision.mutate({ sites: selectedRows, isApproved: false });
  };

  const handleApprove = () => {
    if (selectedRows.length === 0 || decision.isPending) {
      return;
    }
    decision.mutate({ sites: selectedRows, isApproved: true });
  };

  return (
    <PageContainer role="SRApprovalPending">
      <div
        className="row search-container"
        data-testid="srreviewtable-component"
      >
        <h1 className="search-text-label">Site Registry Approvals</h1>
      </div>
      <div className="search-results-section-header-top">
        <div>
          {/* <h2 className="search-results-section-title">Results</h2> */}
        </div>
        <div className="table-actions hide-custom">
          <div
            className={`table-actions-items ${displayFilters ? 'active' : ''}`}
            onClick={() => {
              SetDisplayFilters(!displayFilters);
            }}
          >
            <FilterIcon />
            Filters
          </div>
        </div>
        <button
          className="display-upto-medium"
          type="button"
          onClick={() => {
            SetShowMobileTableMenu(!showMobileTableMenu);
          }}
          aria-label="menu for table columns /filter options"
          aria-controls="navbarMenu"
          aria-haspopup="true"
        >
          <BarsIcon className="bars-button-table-options" />
          <div
            className={`${
              showMobileTableMenu ? 'mobileTableColumnOptions' : 'd-none'
            }`}
          >
            <div>
              <div
                className={`table-actions-items ${
                  displayFilters ? 'active' : ''
                }`}
                onClick={() => {
                  SetDisplayFilters(!displayFilters);
                }}
              >
                <FilterIcon />
                <span
                  className="table-options-text-color"
                  data-testid="filters"
                >
                  Filters
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
      {displayFilters && (
        <SRUpdatesTableFilter
          closeSection={() => {
            SetDisplayFilters(false);
          }}
          onApply={(nextSearch) => {
            setQuery({ search: approvalSearchFrom(nextSearch), page: 1 });
          }}
          onReset={() => {
            setQuery({ search: null, page: 1 });
          }}
        />
      )}
      <div className="search-result-actions">
        <Button
          variant="secondary"
          disabled={selectedRows.length === 0 || decision.isPending}
          onClick={() => handleApprove()}
          size="medium"
          className={`${selectedRows.length > 0 ? 'approve-btn' : ''}`}
          data-testid="approve-btn"
        >
          <TickIcon className="me-2" />
          Public
        </Button>
        <Button
          variant="secondary"
          disabled={selectedRows.length === 0 || decision.isPending}
          onClick={() => rejectHandler()}
          size="medium"
          className={`${selectedRows.length > 0 ? 'not-public-btn' : ''}`}
          data-testid="reject-btn"
        >
          <XmarkIcon className="me-2" />
          Private
        </Button>
      </div>
      <div className="col-12" data-testid="srreview-table">
        {approvalsQuery.isError ? (
          <div className="noContent" role="alert">
            <span className="noContentText">Unable to load approvals</span>
          </div>
        ) : (
          <Grid
            label="Search Results"
            rows={sites}
            columns={gridColumns}
            sort={gridSort}
            onSortChange={handleSortChange}
            loading={loading}
            fetching={fetching}
            empty={empty}
          />
        )}
        {count > 0 ? (
          <Pagination
            changeResultsPerPage={(nextSize) => {
              setQuery({ pageSize: nextSize, page: 1 });
            }}
            selectPage={(nextPage) => {
              setQuery({ page: nextPage });
            }}
            currentPage={page}
            resultsPerPage={pageSize}
            totalResults={count}
          />
        ) : null}
      </div>
    </PageContainer>
  );
};

export default SRUpdatesTables;
