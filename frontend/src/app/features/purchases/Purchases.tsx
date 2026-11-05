import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { signInWithReturnUrl } from '../../auth/returnUrl';
import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import Grid from '../../components/grid/Grid';
import Pagination from '../../components/table/pagination/Pagination';
import { positiveInteger } from '../../helpers/positiveInteger';
import {
  gridSortDirection,
  nextSortDirection,
  pagedListFlags,
  sortDirectionFromQuery,
  sortFieldFromQuery,
} from '../../helpers/pagedList';
import { getUser } from '../../helpers/utility';
import { SortByDirection } from '../../../graphql/generated';
import {
  buildPurchaseColumns,
  columnIdForPurchaseSort,
  sortFieldForPurchaseColumn,
} from './purchaseColumns';
import { fetchPurchasedSites, purchaseSortFields } from './purchasedSites';

const purchaseQueryParams = {
  page: withDefault(NumberParam, 1),
  pageSize: withDefault(NumberParam, 10),
  sortBy: withDefault(StringParam, 'purchaseDate'),
  sortByDir: withDefault(StringParam, SortByDirection.Desc),
  search: withDefault(StringParam, ''),
};

const Purchases = () => {
  const auth = useAuth();
  const [query, setQuery] = useQueryParams(purchaseQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const page = positiveInteger(query.page, 1);
  const pageSize = positiveInteger(query.pageSize, 10);
  const sortBy = sortFieldFromQuery(
    query.sortBy,
    purchaseSortFields,
    'purchaseDate',
  );
  const sortByDir = sortDirectionFromQuery(
    query.sortByDir,
    SortByDirection.Desc,
  );

  useEffect(() => {
    if (getUser() === null) {
      signInWithReturnUrl(auth);
    }
  }, [auth]);

  const purchasesQuery = useQuery({
    queryKey: ['purchasedSites', page, pageSize, sortBy, sortByDir],
    queryFn: ({ signal }) =>
      fetchPurchasedSites({
        page,
        pageSize,
        sortBy,
        sortByDir,
        signal,
      }),
    placeholderData: keepPreviousData,
    retry: false,
  });

  const sites = purchasesQuery.data?.sites ?? [];
  const count = purchasesQuery.data?.count ?? 0;
  const { loading, fetching, empty } = pagedListFlags(
    sites.length,
    purchasesQuery,
  );

  const gridSort = {
    id: columnIdForPurchaseSort(sortBy),
    direction: gridSortDirection(sortByDir),
  };

  const handleSortChange = (columnId: string) => {
    const nextField = sortFieldForPurchaseColumn(columnId);
    if (!nextField) {
      return;
    }
    const nextDirection = nextSortDirection(sortBy, sortByDir, nextField);
    setQuery({
      sortBy: nextField,
      sortByDir: nextDirection,
      page: 1,
    });
  };

  return (
    <PageContainer role="purchases">
      <div>
        <CustomLabel label="Site Details" labelType="b-h1" />
      </div>
      <div className="col-12">
        <Grid
          label="Site Details"
          rows={sites}
          columns={buildPurchaseColumns()}
          sort={gridSort}
          onSortChange={handleSortChange}
          loading={loading}
          fetching={fetching}
          empty={empty}
        />
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

export default Purchases;
