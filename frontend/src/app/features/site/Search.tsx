import React, { useState, useEffect } from 'react';
import './Search.css';
import '@bcgov/design-tokens/css/variables.css';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../../Store';
import {
  CircleXMarkIcon,
  MagnifyingGlassIcon,
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
import { debounce } from 'lodash';
import Table from '../../components/table/Table';
import { fetchSearchSites, getSites, resetSiteSearch } from './SiteSearchSlice';
import { RequestStatus } from '../../helpers/requests/status';
import { SiteSortBy, SortByDirection } from '../../../graphql/generated';
import { fetchSiteRiskCd } from '../details/dropdowns/DropdownSlice';

const Search = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState('');
  const [noUserAction, setUserAction] = useState(true);
  const columns = getSiteSearchResultsColumns();
  const [columnsToDisplay, setColumnsToDisplay] = useState<TableColumn[]>([
    ...columns,
  ]);
  const [selectedRows, SetSelectedRows] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<
    { key: string; value: string; label: string }[]
  >([]);
  const [formData, setFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>({});
  const {
    sites,
    page,
    pageSize,
    count,
    sortBy,
    sortByDir,
    status,
    searchParam,
  } = useSelector(getSites);

  const debouncedSearch = debounce(
    (
      searchParam: string,
      page: number,
      pageSize: number,
      sortBy: SiteSortBy = SiteSortBy.Id,
      sortByDir: SortByDirection = SortByDirection.Asc,
      filters: any,
    ) => {
      dispatch(
        fetchSearchSites({
          searchParam,
          page,
          pageSize,
          sortBy,
          sortByDir,
          filter: filters,
        }),
      );
    },
    50,
  );

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

  const handleClearSearch = () => {
    setSearchText('');
    setUserAction(true);
    dispatch(resetSiteSearch());
  };

  const handleTextChange = (event: any) => {
    const value = event.target.value;
    setSearchText(value);
    setUserAction(false);

    // Clear search results if input is empty
    if (value.length === 0) {
      dispatch(resetSiteSearch());
      return;
    }

    // Trigger search for inputs with 3+ characters
    if (value.length >= 3) {
      const filterData: any = {};
      selectedFilters.forEach((filter: any) => {
        filterData[filter.key] = filter.value;
      });
      debouncedSearch(
        value,
        page,
        pageSize,
        SiteSortBy.Id,
        SortByDirection.Asc,
        filterData,
      );
    }
  };

  const changeHandler = (event: any) => {
    if (event && event.property === 'select_row') {
      if (event.value) {
        const index = selectedRows.findIndex((r: any) => r.id === event.row.id);
        if (index === -1) {
          SetSelectedRows([...selectedRows, event.row]);
        }
      } else {
        SetSelectedRows(selectedRows.filter((r: any) => r.id !== event.row.id));
      }
    } else if (event && event.property === 'select_all') {
      const newRows = event.value;
      if (event.selected) {
        SetSelectedRows((prevArray) => {
          const existingIds = new Set(prevArray.map((obj) => obj.id));
          const uniqueRows = newRows.filter(
            (row: any) => !existingIds.has(row.id),
          );
          return [...prevArray, ...uniqueRows];
        });
      } else {
        SetSelectedRows((prevArray) => {
          const idsToRemove = new Set(newRows.map((row: any) => row.id));
          return prevArray.filter((obj) => !idsToRemove.has(obj.id));
        });
      }
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
    const filteredFormData: { [key: string]: string } = {};
    const filters: { key: string; value: string; label: string }[] = [];
    const flattedArr = flattenFormRows(formRows);
    // Filter out form data with non-empty values and construct filteredFormData and filters
    for (const [key, value] of Object.entries(formData)) {
      let currLabel =
        flattedArr && flattedArr.find((row) => row.graphQLPropertyName === key);
      if (key === 'whenCreated' || key === 'whenUpdated') {
        let dateRangeValue = formatDateRange(value);
        filteredFormData[key] = value;
        filters.push({
          key,
          value: dateRangeValue,
          label: currLabel?.label ?? '',
        });
      } else if (value.trim() !== '') {
        filteredFormData[key] = value;
        filters.push({ key, value, label: currLabel?.label ?? '' });
      }
    }

    // show and format pill.
    if (filters.length !== 0) {
      debouncedSearch(
        searchParam,
        page,
        pageSize,
        sortBy,
        sortByDir,
        filteredFormData,
      );
      setSelectedFilters(filters);

      // Save filter selections to local storage
      localStorage.setItem('siteFilterPills', JSON.stringify(filters));
    }
  };

  const handleReset = () => {
    setFormData({});
    setSelectedFilters([]);
    localStorage.removeItem('siteFilterPills');
  };

  useEffect(() => {
    const storedFilters = localStorage.getItem('siteFilterPills');
    if (storedFilters) {
      const parsedFilters = JSON.parse(storedFilters);
      const initialFormData: any = {};
      parsedFilters.forEach((filter: any) => {
        initialFormData[filter.key] = filter.value;
      });
      setFormData(initialFormData);
      setSelectedFilters(parsedFilters);
    }

    if (status === RequestStatus.success && sites.length > 0) {
      setSearchText(searchParam);
      setUserAction(false);
    }

    dispatch(fetchSiteRiskCd());
  }, [dispatch, searchParam, sites.length, status]);

  const handleRemoveFilter = (filter: any) => {
    setFormData((prevData) => {
      const updatedFilter = { ...prevData };
      delete updatedFilter[filter.key]; // Remove the filter key from the form data
      debouncedSearch(
        searchParam,
        page,
        pageSize,
        sortBy,
        sortByDir,
        updatedFilter,
      );

      return updatedFilter;
    });
    let currFilter = selectedFilters.filter((item) => item.key !== filter.key);
    setSelectedFilters(currFilter);
    localStorage.setItem('siteFilterPills', JSON.stringify(currFilter));
  };

  const handlePageSizeChange = (pageSize: number) => {
    debouncedSearch(searchParam, page, pageSize, sortBy, sortByDir, formData);
  };

  const handlePageChange = (page: number) => {
    debouncedSearch(searchParam, page, pageSize, sortBy, sortByDir, formData);
  };

  // Mapping between GraphQL field names and SiteSortBy enum values
  const columnToSortByMap: Record<string, SiteSortBy> = {
    id: SiteSortBy.Id,
    srStatus: SiteSortBy.SrStatus,
    siteRiskCode: SiteSortBy.SiteRiskCode,
    commonName: SiteSortBy.CommonName,
    site_address: SiteSortBy.SiteAddress,
    generalDescription: SiteSortBy.GeneralDescription,
    city: SiteSortBy.City,
    whoCreated: SiteSortBy.WhoCreated,
    latdeg: SiteSortBy.LatDeg,
    longdeg: SiteSortBy.LongDeg,
    latDegressMinutesSeconds: SiteSortBy.LatDegreesMinutesSeconds,
    longDegreesMinutesSeconds: SiteSortBy.LongDegreesMinutesSeconds,
    whenCreated: SiteSortBy.WhenCreated,
    whenUpdated: SiteSortBy.WhenUpdated,
    latlongReliabilityFlag: SiteSortBy.LatLongReliabilityFlag,
    consultantSubmitted: SiteSortBy.ConsultantSubmitted,
  };

  const handleTableSortChange = (column: TableColumn, descending: boolean) => {
    const sortByDir: SortByDirection = descending
      ? SortByDirection.Desc
      : SortByDirection.Asc;
    let sortBy: SiteSortBy = columnToSortByMap[column.graphQLPropertyName];
    if (column.graphQLPropertyName === 'addrLine_1,addrLine_2,addrLine_3') {
      sortBy = columnToSortByMap['site_address'];
    } else if (
      column.graphQLPropertyName === 'longDegrees,longMinutes,longSeconds'
    ) {
      sortBy = columnToSortByMap['longDegreesMinutesSeconds'];
    } else if (
      column.graphQLPropertyName === 'latDegrees,latMinutes,latSeconds'
    ) {
      sortBy = columnToSortByMap['latDegressMinutesSeconds'];
    } else {
      sortBy = columnToSortByMap[column.graphQLPropertyName];
    }
    if (sortBy) {
      debouncedSearch(searchParam, page, pageSize, sortBy, sortByDir, formData);
    }
  };

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
          <div
            className="row search-container results"
            aria-label="search-results-section-title"
          >
            <SearchResultsFilters
              aria-label="search-results-filters"
              columns={columnsToDisplay}
              onColumnSelectionChange={toggleColumnSelectionForDisplay}
              resetColumns={resetDefaultColums}
              filtersFormData={formData}
              onFiltersChange={handleInputChange}
              onFiltersSubmit={handleFormSubmit}
              onFiltersReset={handleReset}
            />
            <SearchResultsActions
              selectedRows={selectedRows}
              aria-label="search-results-actions"
            />
          </div>
          <FilterPills
            aria-label="selected-filters"
            filters={selectedFilters}
            onRemoveFilter={(filter) => {
              handleRemoveFilter(filter);
            }}
          />
          <div>
            <div className="" aria-label="Search results">
              <Table
                aria-label="Search results table"
                showPageOptions={true}
                label="Search Results"
                isLoading={status || RequestStatus.idle}
                columns={columnsToDisplay.filter((x) => x.isChecked === true)}
                data={sites}
                allowRowsSelect={true}
                changeHandler={changeHandler}
                editMode={false}
                idColumnName="id"
                totalResults={count}
                selectPage={handlePageChange}
                changeResultsPerPage={handlePageSizeChange}
                currentPage={page}
                resultsPerPage={pageSize}
                sortHandler={handleTableSortChange}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Search;
