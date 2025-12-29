import { FC, useCallback, useEffect, useState } from 'react';
import { Site } from '../MapView';
import { SearchResultsFilters } from '../../site/searchResults/SearchResultsFilters';
import { SearchResultsActions } from '../../site/searchResults/SearchResultsActions';
import FilterPills, { FilterPill } from '../../site/filters/FilterPills';
import { getSiteSearchResultsColumns } from '../../site/dto/Columns';
import { TableColumn } from '../../../components/table/TableColumn';
import {
  MapSearch_FilterSearchResultsQuery,
  SiteFilters,
  useMapSearch_FilterSearchResultsLazyQuery,
} from '../../../../graphql/generated';
import {
  BarsIcon,
  FilterIcon,
  SpinnerIcon,
  TableColumnsIcon,
} from '../../../components/common/icon';
import useDebouncedValue from '../../../helpers/useDebouncedValue';
import { formRowsMap } from '../../site/dto/SiteFilterConfig';
import { formatDateRange } from '../../../helpers/utility';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import Widget from '../../../components/widget/Widget';
import { RequestStatus } from '../../../helpers/requests/status';
import { Button } from '../../../components/button/Button';
import { Dropdown } from 'react-bootstrap';

const defaultColumns = getSiteSearchResultsColumns(new Set(['map']));

type Pagination = {
  page: number;
  pageSize: number;
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
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 5,
  });

  const [searchSitesQuery, { loading: siteDetailsLoading }] =
    useMapSearch_FilterSearchResultsLazyQuery({
      onCompleted: (data) => {
        setSearchResults(data.searchSites);
      },
    });

  const searchSitesWithFilters = useCallback(() => {
    if (siteIds.length === 0) {
      return;
    }
    setSelectedRows([]);
    searchSitesQuery({
      variables: {
        ...pagination,
        filters: { siteIds, ...queryFilters },
      },
    });
  }, [pagination, queryFilters, searchSitesQuery, siteIds]);

  useEffect(() => {
    searchSitesWithFilters();
  }, [searchSitesWithFilters]);

  useEffect(() => {
    // If the set of sites returned by map search changed, we reset the pagination
    // to prevent users from being stuck on pages that may be irrelevant to the new set
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [siteIds]);

  const siteDetailsLoadingDebounced = useDebouncedValue(siteDetailsLoading);

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
    setPagination((prev) => ({ ...prev, page: 1 }));
    searchSitesWithFilters();
  };

  const onFiltersReset = () => {
    setFiltersFormData({});
    setQueryFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
    searchSitesWithFilters();
  };

  const onRemoveFilter = (filter: FilterPill) => {
    const { [filter.key as keyof SiteFilters]: _, ...rest } = filtersFormData;
    setFiltersFormData(rest);
    setQueryFilters(rest);
    searchSitesWithFilters();
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

  const changeHandler = (event: any) => {
    if (!event) return;
    const { property, value, row, selected: selectAllChecked } = event;

    if (property === 'select_row') {
      setSelectedRows((prevRows) =>
        value
          ? prevRows.some((r) => r.id === row.id)
            ? prevRows
            : [...prevRows, row]
          : prevRows.filter((r) => r.id !== row.id),
      );
    } else if (property === 'select_all') {
      setSelectedRows(selectAllChecked ? [...value] : []);
    }
  };

  const loading = siteIdsLoading || siteDetailsLoadingDebounced;
  type PanelOption = 'filters' | 'columns' | null;
  const [panelToShow, setPanelToShow] = useState<PanelOption>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);

  const totalResults = searchResults.count || 0;
  const selectPage = (pageNumber: number): void => {
    setCurrentPage(pageNumber);
  };

  const changeResultsPerPage = (pageNumber: number): void => {
    setResultsPerPage(pageNumber);
  };

  useEffect(() => {
    setPagination({ page: currentPage, pageSize: resultsPerPage });
  }, [currentPage, resultsPerPage]);

  const togglePanel = (panel: PanelOption) => {
    if (panelToShow === panel) {
      setPanelToShow(null);
      return;
    }
    setPanelToShow(panel);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {loading && <SpinnerIcon size={20} className="site-fa-spin" />}
      <Widget
        changeHandler={changeHandler}
        title={'Results'}
        tableColumns={columnsToDisplay.filter((x) => x.isChecked === true)}
        tableData={searchResults.sites}
        tableIsLoading={loading ? RequestStatus.loading : RequestStatus.idle}
        allowRowsSelect={true}
        aria-label="Site Participant Widget"
        customLabelCss="custom-search-widget-lbl"
        hideTable={false}
        hideTitle={false}
        editMode={false}
        srMode={false}
        hideWidgetCheckbox={true}
        primaryKeycolumnName="id"
        // sortHandler={handleTableSortChange}
        totalResults={searchResults.count}
        selectPage={selectPage}
        changeResultsPerPage={changeResultsPerPage}
        currentPage={currentPage}
        resultsPerPage={resultsPerPage}
        showPageOptions={true}
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
      </Widget>
    </div>
  );
};
