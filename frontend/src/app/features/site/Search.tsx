import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Search.css';
import '@bcgov/design-tokens/css/variables.css';
import { useDispatch, useSelector } from 'react-redux';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { AppDispatch } from '../../Store';
import {
  BarsIcon,
  CircleXMarkIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  TableColumnsIcon,
} from '../../components/common/icon';
import Intro from './Intro';
import { TableColumn } from '../../components/table/TableColumn';
import { getSiteSearchResultsColumns } from './dto/Columns';
import PageContainer from '../../components/simple/PageContainer';
import { flattenFormRows, formatDateRange } from '../../helpers/utility';
import FilterPills from './filters/FilterPills';
import { formRows } from './dto/SiteFilterConfig';
import { SearchResultsFilters } from './searchResults/SearchResultsFilters';
import { SearchResultsActions } from './searchResults/SearchResultsActions';
import { positiveInteger } from '../../helpers/positiveInteger';
import {
  gridSortDirection,
  nextSortDirection,
  pagedListFlags,
  sortDirectionFromQuery,
  sortFieldFromQuery,
} from '../../helpers/pagedList';
import useDebouncedValue from '../../helpers/useDebouncedValue';
import Grid from '../../components/grid/Grid';
import Pagination from '../../components/table/pagination/Pagination';
import { selectSearchFilter, setSearchFilter } from './SiteSearchSlice';
import { SiteSortBy, SortByDirection } from '../../../graphql/generated';
import { fetchSiteRiskCd } from '../details/dropdowns/DropdownSlice';
import Widget from '../../components/widget/Widget';
import { Dropdown } from 'react-bootstrap';
import { Button } from '../../components/button/Button';
import { searchSites, SearchSiteRow } from './searchSites';
import {
  buildSearchResultColumns,
  columnIdForSortField,
  columnSortField,
  displayedSearchCellText,
} from './searchResults/searchResultColumns';
import {
  isRowSelected as rowIsSelected,
  toggleSelectedRow,
} from './searchResults/selectedRows';

const searchQueryParams = {
  page: withDefault(NumberParam, 1),
  pageSize: withDefault(NumberParam, 5),
  sortBy: withDefault(StringParam, SiteSortBy.Id),
  sortByDir: withDefault(StringParam, SortByDirection.Asc),
  search: withDefault(StringParam, ''),
};

type StoredFilter = { key: string; value: string; label: string };

function readStoredFilters(): StoredFilter[] {
  try {
    const stored = localStorage.getItem('siteFilterPills');
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function filterObjectFrom(filters: StoredFilter[]): Record<string, unknown> {
  return filters.reduce<Record<string, unknown>>((accumulator, filter) => {
    accumulator[filter.key] = filter.value;
    return accumulator;
  }, {});
}

const Search = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [query, setQuery] = useQueryParams(searchQueryParams, {
    removeDefaultsFromUrl: true,
  });
  const search = query.search ?? '';
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

  const [searchText, setSearchText] = useState(search);
  const debouncedSearchText = useDebouncedValue(searchText);
  const lastWrittenSearch = useRef(search);

  const columns = getSiteSearchResultsColumns();
  const [columnsToDisplay, setColumnsToDisplay] = useState<TableColumn[]>([
    ...columns,
  ]);
  const [selectedRows, setSelectedRows] = useState<SearchSiteRow[]>([]);
  const [selectedFilters, setSelectedFilters] =
    useState<StoredFilter[]>(readStoredFilters);
  const [formData, setFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>(filterObjectFrom(selectedFilters));

  const submittedFilter = useMemo(
    () => filterObjectFrom(selectedFilters),
    [selectedFilters],
  );
  const searchFilter = useSelector(selectSearchFilter);
  const searchFilterReady =
    JSON.stringify(searchFilter) === JSON.stringify(submittedFilter);

  const searchQuery = useQuery({
    queryKey: [
      'searchSites',
      search,
      page,
      pageSize,
      sortBy,
      sortByDir,
      searchFilter,
    ],
    queryFn: ({ signal }) =>
      searchSites({
        searchParam: search,
        page,
        pageSize,
        sortBy,
        sortByDir,
        filter: searchFilter,
        signal,
      }),
    enabled: searchFilterReady && search.trim().length >= 3,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const sites = searchQuery.data?.sites ?? [];
  const count = searchQuery.data?.count ?? 0;
  const { loading, fetching, empty } = pagedListFlags(
    sites.length,
    searchQuery,
  );

  useEffect(() => {
    if (search !== lastWrittenSearch.current) {
      lastWrittenSearch.current = search;
      setSearchText(search);
    }
  }, [search]);

  useEffect(() => {
    if (debouncedSearchText === lastWrittenSearch.current) {
      return;
    }
    if (debouncedSearchText === searchText && debouncedSearchText !== search) {
      lastWrittenSearch.current = debouncedSearchText;
      setSelectedRows([]);
      setQuery({ search: debouncedSearchText, page: 1 });
    }
  }, [debouncedSearchText, searchText, search, setQuery]);

  useEffect(() => {
    dispatch(setSearchFilter(submittedFilter));
  }, [dispatch, submittedFilter]);

  useEffect(() => {
    dispatch(fetchSiteRiskCd());
  }, [dispatch]);

  const toggleColumnSelectionForDisplay = (column: TableColumn) => {
    const index = columnsToDisplay.findIndex((item) => item.id === column.id);

    if (index !== -1 && !columnsToDisplay[index].disabled) {
      const updatedColumnsToDisplay = [...columnsToDisplay];
      updatedColumnsToDisplay[index] = {
        ...updatedColumnsToDisplay[index],
        isChecked: !updatedColumnsToDisplay[index].isChecked,
      };
      setColumnsToDisplay(updatedColumnsToDisplay);
    }
  };

  const resetDefaultColums = () => {
    setColumnsToDisplay(columns);
  };

  const rememberQueryChange = () => {
    setSelectedRows([]);
  };

  const handleClearSearch = () => {
    lastWrittenSearch.current = '';
    setSearchText('');
    rememberQueryChange();
    setQuery({ search: '', page: 1 });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);

    if (value.trim().length === 0) {
      lastWrittenSearch.current = '';
      rememberQueryChange();
      setQuery({ search: '', page: 1 });
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const filteredFormData: { [key: string]: any } = {};
    const filters: StoredFilter[] = [];
    const flattedArr = flattenFormRows(formRows);
    for (const [key, value] of Object.entries(formData)) {
      const currLabel =
        flattedArr && flattedArr.find((row) => row.graphQLPropertyName === key);
      if (key === 'whenCreated' || key === 'whenUpdated') {
        const dateRangeValue = formatDateRange(value);
        filteredFormData[key] = value;
        filters.push({
          key,
          value: dateRangeValue,
          label: currLabel?.label ?? '',
        });
      } else if (typeof value === 'string' && value.trim() !== '') {
        filteredFormData[key] = value;
        filters.push({ key, value, label: currLabel?.label ?? '' });
      }
    }

    if (filters.length !== 0) {
      setSelectedFilters(filters);
      setFormData(filteredFormData);
      localStorage.setItem('siteFilterPills', JSON.stringify(filters));
      rememberQueryChange();
      setQuery({ page: 1 });
    }
  };

  const handleReset = () => {
    setFormData({});
    setSelectedFilters([]);
    localStorage.removeItem('siteFilterPills');
    rememberQueryChange();
    setQuery({ page: 1 });
  };

  const handleRemoveFilter = (filter: StoredFilter) => {
    const nextFormData = { ...formData };
    delete nextFormData[filter.key];
    const nextFilters = selectedFilters.filter(
      (item) => item.key !== filter.key,
    );
    setFormData(nextFormData);
    setSelectedFilters(nextFilters);
    localStorage.setItem('siteFilterPills', JSON.stringify(nextFilters));
    rememberQueryChange();
    setQuery({ page: 1 });
  };

  const handleSortChange = (columnId: string) => {
    const nextField = columnSortField(columnsToDisplay, columnId);
    if (!nextField) {
      return;
    }
    const nextDirection = nextSortDirection(sortBy, sortByDir, nextField);
    rememberQueryChange();
    setQuery({
      sortBy: nextField,
      sortByDir: nextDirection,
      page: 1,
    });
  };

  const isRowSelected = (row: SearchSiteRow) =>
    rowIsSelected(selectedRows, row);

  const gridColumns = buildSearchResultColumns(columnsToDisplay, {
    pageRows: sites,
    isSelected: isRowSelected,
    onToggleRow: (row, selected) => {
      setSelectedRows((current) => toggleSelectedRow(current, row, selected));
    },
    onTogglePage: (selected) => {
      setSelectedRows((current) => {
        if (selected) {
          const existingIds = new Set(current.map((item) => item.id));
          return [
            ...current,
            ...sites.filter((row: SearchSiteRow) => !existingIds.has(row.id)),
          ];
        }
        const pageIds = new Set(sites.map((row: SearchSiteRow) => row.id));
        return current.filter((item) => !pageIds.has(item.id));
      });
    },
  });

  const activeColumnId = columnIdForSortField(columnsToDisplay, sortBy);
  const gridSort = activeColumnId
    ? {
        id: activeColumnId,
        direction: gridSortDirection(sortByDir),
      }
    : null;

  type PanelOption = 'filters' | 'columns' | null;
  const [panelToShow, setPanelToShow] = useState<PanelOption>(null);

  const togglePanel = (panel: PanelOption) => {
    if (panelToShow === panel) {
      setPanelToShow(null);
      return;
    }
    setPanelToShow(panel);
  };

  const noUserAction = searchText.trim().length === 0;

  return (
    <PageContainer role="Search" aria-label="Search">
      <div className="search-container">
        <h1 className="search-text-label">Search Site Registry</h1>
        <div className="">
          <div className="d-flex align-items-center">
            <div className="custom-text-search">
              {!noUserAction ? null : (
                <div className="custom-text-search-start">
                  <MagnifyingGlassIcon className="customSearchIcon"></MagnifyingGlassIcon>
                </div>
              )}

              <div className={`custom-text-search-middle`}>
                <input
                  tabIndex={13}
                  aria-label="Search input"
                  placeholder="Search for site address or name or pid"
                  onChange={handleTextChange}
                  value={searchText}
                  type="text"
                  className={`textSearch custom-text-search-control  ${
                    !noUserAction ? `addBorder` : ``
                  }`}
                />
              </div>
              {noUserAction ? null : (
                <div className="custom-text-search-end">
                  <CircleXMarkIcon
                    role="button"
                    aria-label="Clear search"
                    onClick={() => {
                      handleClearSearch();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {noUserAction ? (
        <div>
          <Intro></Intro>
        </div>
      ) : (
        <div className="search-parent">
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
              visibleCellText={displayedSearchCellText}
              aria-label="search-results-actions"
            />
            <SearchResultsFilters
              aria-label="search-results-filters"
              columns={columnsToDisplay}
              filtersFormData={formData}
              panelToShow={panelToShow}
              selectedFilter={selectedFilters}
              setPanelToShow={setPanelToShow}
              onColumnSelectionChange={toggleColumnSelectionForDisplay}
              resetColumns={resetDefaultColums}
              onFiltersChange={handleInputChange}
              onFiltersSubmit={handleFormSubmit}
              onFiltersReset={handleReset}
            />
            <FilterPills
              aria-label="selected-filters"
              filters={selectedFilters}
              onRemoveFilter={(filter) => {
                handleRemoveFilter(filter);
              }}
            />
            {searchQuery.isError ? (
              <div className="noContent" role="alert">
                <span className="noContentText">Search failed</span>
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
            {sites.length > 0 ? (
              <Pagination
                changeResultsPerPage={(nextSize) => {
                  rememberQueryChange();
                  setQuery({ pageSize: nextSize, page: 1 });
                }}
                selectPage={(nextPage) => {
                  rememberQueryChange();
                  setQuery({ page: nextPage });
                }}
                currentPage={page}
                resultsPerPage={pageSize}
                totalResults={count}
              />
            ) : null}
          </Widget>
        </div>
      )}
    </PageContainer>
  );
};

export default Search;
