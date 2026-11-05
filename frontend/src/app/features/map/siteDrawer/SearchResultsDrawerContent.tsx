import { FC, useEffect, useRef, useState } from 'react';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { Site } from '../MapView';
import { SearchResultsFilters } from '../../site/searchResults/SearchResultsFilters';
import { SearchResultsActions } from '../../site/searchResults/SearchResultsActions';
import FilterPills, { FilterPill } from '../../site/filters/FilterPills';
import { getSiteSearchResultsColumns } from '../../site/dto/Columns';
import { TableColumn } from '../../../components/table/TableColumn';
import {
  MapSearch_FilterSearchResultsQuery,
  SiteFilters,
  SiteSortBy,
  SortByDirection,
  useMapSearch_FilterSearchResultsLazyQuery,
} from '../../../../graphql/generated';
import {
  BarsIcon,
  FilterIcon,
  TableColumnsIcon,
} from '../../../components/common/icon';
import { formRowsMap } from '../../site/dto/SiteFilterConfig';
import { formatDateRange } from '../../../helpers/utility';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import Widget from '../../../components/widget/Widget';
import { Button } from '../../../components/button/Button';
import { Dropdown } from 'react-bootstrap';
import Grid from '../../../components/grid/Grid';
import Pagination from '../../../components/table/pagination/Pagination';
import { SearchSiteRow } from '../../site/searchSites';
import {
  buildSearchResultColumns,
  columnIdForSortField,
  columnSortField,
} from '../../site/searchResults/searchResultColumns';
import {
  isRowSelected as rowIsSelected,
  toggleSelectedRow,
} from '../../site/searchResults/selectedRows';
import { positiveInteger } from '../../../helpers/positiveInteger';
import {
  gridSortDirection,
  nextSortDirection,
  sortDirectionFromQuery,
  sortFieldFromQuery,
} from '../../../helpers/pagedList';

const defaultColumns = getSiteSearchResultsColumns(new Set(['map']));

const resultQueryParams = {
  page: withDefault(NumberParam, 1),
  pageSize: withDefault(NumberParam, 5),
  sortBy: withDefault(StringParam, SiteSortBy.Id),
  sortByDir: withDefault(StringParam, SortByDirection.Asc),
};

interface SearchResultsDrawerContentProps {
  siteIds: Array<Site['id']>;
  loading: boolean;
}
export const SearchResultsDrawerContent: FC<
  SearchResultsDrawerContentProps
> = ({ siteIds, loading: siteIdsLoading }) => {
  // Saving fetched data to local state allows us avoid table component flickering
  // when a refetch with new variables takes place
  const [searchResults, setSearchResults] = useState<
    MapSearch_FilterSearchResultsQuery['searchSites']
  >({
    sites: [],
    pageSize: 0,
    count: 0,
    page: 1,
  });

  const [columnsToDisplay, setColumnsToDisplay] =
    useState<TableColumn[]>(defaultColumns);
  const [filtersFormData, setFiltersFormData] = useState<SiteFilters>({});
  const [queryFilters, setQueryFilters] = useState<SiteFilters>({});
  const [selectedRows, setSelectedRows] = useState<SearchSiteRow[]>([]);
  const [query, setQuery] = useQueryParams(resultQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const page = positiveInteger(query.page, 1);
  const pageSize = positiveInteger(query.pageSize, 5);
  const sortBy = sortFieldFromQuery(
    query.sortBy,
    Object.values(SiteSortBy),
    SiteSortBy.Id,
  );
  const sortByDir = sortDirectionFromQuery(
    query.sortByDir,
    SortByDirection.Asc,
  );

  const [searchSitesQuery, { loading: siteDetailsLoading, called, error }] =
    useMapSearch_FilterSearchResultsLazyQuery();

  const siteIdsRef = useRef(siteIds);
  siteIdsRef.current = siteIds;
  const siteIdKey = [...siteIds]
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    )
    .join('\0');
  const appliedSiteIds = useRef<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (siteIdsLoading) {
      return;
    }

    const previousSiteIds = appliedSiteIds.current;
    if (previousSiteIds === null && siteIdKey.length === 0) {
      return;
    }
    const siteIdsChanged =
      previousSiteIds !== null && previousSiteIds !== siteIdKey;
    if (previousSiteIds === null || siteIdsChanged) {
      appliedSiteIds.current = siteIdKey;
    }
    if (siteIdsChanged && page !== 1) {
      setQuery({ page: 1 });
      return;
    }
    if (siteIdKey.length === 0) {
      return;
    }

    const id = ++requestId.current;
    setSelectedRows([]);
    searchSitesQuery({
      variables: {
        page,
        pageSize,
        sortBy,
        sortByDir,
        filters: { siteIds: siteIdsRef.current, ...queryFilters },
      },
    }).then((result) => {
      if (id !== requestId.current || !result.data?.searchSites) {
        return;
      }
      setSearchResults(result.data.searchSites);
    });
  }, [
    page,
    pageSize,
    queryFilters,
    searchSitesQuery,
    setQuery,
    siteIdKey,
    siteIdsLoading,
    sortBy,
    sortByDir,
  ]);

  const toggleColumnSelectionForDisplay = (column: TableColumn) => {
    setColumnsToDisplay((prevColumns) =>
      prevColumns.map((item) =>
        item.id === column.id && !item.disabled
          ? { ...item, isChecked: !item.isChecked }
          : item,
      ),
    );
  };

  const onFiltersChange = (key: string, value: any) => {
    setFiltersFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const onFiltersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryFilters(filtersFormData);
    setQuery({ page: 1 });
  };

  const onFiltersReset = () => {
    setFiltersFormData({});
    setQueryFilters({});
    setQuery({ page: 1 });
  };

  const onRemoveFilter = (filter: FilterPill) => {
    const { [filter.key as keyof SiteFilters]: _, ...rest } = filtersFormData;
    setFiltersFormData(rest);
    setQueryFilters(rest);
    setQuery({ page: 1 });
  };

  const filterPillsData: FilterPill[] = Object.entries(queryFilters)
    .map(([key, value]) => {
      if (!value) return null;
      const { label, type } = formRowsMap[key];

      if (type === FormFieldType.DateRange) {
        return {
          key,
          value: formatDateRange(value as [Date, Date]),
          label,
        };
      }
      return { key, value, label };
    })
    .filter((data): data is FilterPill => data !== null);

  const sites = searchResults.sites as SearchSiteRow[];
  const waitingForFirstResults = siteIds.length > 0 && !called;
  const resultsInFlight =
    siteIdsLoading || siteDetailsLoading || waitingForFirstResults;
  const searchFailed = Boolean(error) && !resultsInFlight && sites.length === 0;
  const isRowSelected = (row: SearchSiteRow) =>
    rowIsSelected(selectedRows, row);

  const gridColumns = buildSearchResultColumns(columnsToDisplay, {
    pageRows: sites,
    isSelected: isRowSelected,
    onToggleRow: (row, selected) => {
      setSelectedRows((current) => toggleSelectedRow(current, row, selected));
    },
    onTogglePage: (selected) => {
      setSelectedRows(selected ? [...sites] : []);
    },
  });
  const activeColumnId = columnIdForSortField(columnsToDisplay, sortBy);
  const gridSort = activeColumnId
    ? {
        id: activeColumnId,
        direction: gridSortDirection(sortByDir),
      }
    : null;

  const handleSortChange = (columnId: string) => {
    const nextField = columnSortField(columnsToDisplay, columnId);
    if (!nextField) {
      return;
    }
    setQuery({
      sortBy: nextField,
      sortByDir: nextSortDirection(sortBy, sortByDir, nextField),
      page: 1,
    });
  };

  type PanelOption = 'filters' | 'columns' | null;
  const [panelToShow, setPanelToShow] = useState<PanelOption>(null);

  const togglePanel = (panel: PanelOption) => {
    if (panelToShow === panel) {
      setPanelToShow(null);
      return;
    }
    setPanelToShow(panel);
  };

  return (
    <div className="d-flex flex-column gap-3">
      <Widget
        title={'Results'}
        customLabelCss="custom-search-widget-lbl"
        hideTable
        filter={
          <div>
            <div className="table-actions d-none d-md-flex ">
              <div
                className={`table-actions-items ${panelToShow === 'columns' ? 'active' : ''} `}
                onClick={() => {
                  togglePanel('columns');
                }}
              >
                <TableColumnsIcon />
                Columns
              </div>
              <div
                className={`table-actions-items ${panelToShow === 'filters' ? 'active' : ''}`}
                onClick={() => {
                  togglePanel('filters');
                }}
              >
                <FilterIcon />
                Filters
              </div>
            </div>
            <Dropdown className="d-flex d-md-none">
              <Dropdown.Toggle as={Button} variant="tertiary">
                <BarsIcon size={24} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => togglePanel('columns')}
                  className="d-flex align-items-center gap-2"
                >
                  <TableColumnsIcon />
                  <span>Columns</span>
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => togglePanel('filters')}
                  className="d-flex align-items-center gap-2"
                >
                  <TableColumnsIcon />
                  <span>Filters</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        }
      >
        <SearchResultsActions
          selectedRows={selectedRows}
          selectedColumns={columnsToDisplay}
          aria-label="search-results-actions"
        />
        <SearchResultsFilters
          aria-label="search-results-filters"
          columns={columnsToDisplay}
          filtersFormData={filtersFormData}
          panelToShow={panelToShow}
          selectedFilter={filterPillsData}
          setPanelToShow={setPanelToShow}
          onColumnSelectionChange={toggleColumnSelectionForDisplay}
          resetColumns={() => setColumnsToDisplay(defaultColumns)}
          onFiltersChange={onFiltersChange}
          onFiltersSubmit={onFiltersSubmit}
          onFiltersReset={onFiltersReset}
        />
        <FilterPills
          aria-label="selected-filters"
          filters={filterPillsData}
          onRemoveFilter={onRemoveFilter}
        />
        <div className="me-1">
          {searchFailed ? (
            <div className="noContent" role="alert">
              <span className="noContentText">Search failed</span>
            </div>
          ) : (
            <Grid
              label="Results"
              rows={sites}
              columns={gridColumns}
              sort={gridSort}
              onSortChange={handleSortChange}
              loading={resultsInFlight && sites.length === 0}
              fetching={resultsInFlight && sites.length > 0}
              empty={!resultsInFlight && !error && sites.length === 0}
            />
          )}
        </div>
        {sites.length > 0 ? (
          <Pagination
            changeResultsPerPage={(nextSize) => {
              setQuery({ pageSize: nextSize, page: 1 });
            }}
            selectPage={(nextPage) => {
              setQuery({ page: nextPage });
            }}
            currentPage={page}
            resultsPerPage={pageSize}
            totalResults={searchResults.count}
          />
        ) : null}
      </Widget>
    </div>
  );
};
