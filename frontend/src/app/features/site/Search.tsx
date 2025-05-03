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
import { debounce, set } from 'lodash';
import Table from '../../components/table/Table';
import { fetchSearchSites, getSites, resetSiteSearch } from './SiteSearchSlice';
import { RequestStatus } from '../../helpers/requests/status';

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
  const { sites, page, pageSize, count, filter, status, error, searchParam } =
    useSelector(getSites);

  const debouncedSearch = debounce(
    (searchParam: string, page: number, pageSize: number, filters: any) => {
      setSearchText(searchParam);
      dispatch(
        fetchSearchSites({ searchParam, page, pageSize, filter: filters }),
      );
    },
    500,
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
    setUserAction(false);
    setSearchText(event.target.value);
    if (event.target.value.length >= 3) {
      const filterData: any = {};
      selectedFilters.forEach((filter: any) => {
        filterData[filter.key] = filter.value;
      });
      debouncedSearch(event.target.value, page, pageSize, filterData);
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
      debouncedSearch(searchParam, page, pageSize, filteredFormData);
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
  }, []);

  const handleRemoveFilter = (filter: any) => {
    setFormData((prevData) => {
      const updatedFilter = { ...prevData };
      delete updatedFilter[filter.key]; // Remove the filter key from the form data
      debouncedSearch(searchParam, page, pageSize, updatedFilter);

      return updatedFilter;
    });
    let currFilter = selectedFilters.filter((item) => item.key !== filter.key);
    setSelectedFilters(currFilter);
    localStorage.setItem('siteFilterPills', JSON.stringify(currFilter));
  };

  const handlePageSizeChange = (pageSize: number) => {
    debouncedSearch(searchParam, page, pageSize, formData);
  };

  const handlePageChange = (page: number) => {
    debouncedSearch(searchParam, page, pageSize, formData);
  };

  return (
    <PageContainer role="Search">
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
                  placeholder="Search for site address or name"
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
              columns={columnsToDisplay}
              onColumnSelectionChange={toggleColumnSelectionForDisplay}
              resetColumns={resetDefaultColums}
              filtersFormData={formData}
              onFiltersChange={handleInputChange}
              onFiltersSubmit={handleFormSubmit}
              onFiltersReset={handleReset}
            />
            <SearchResultsActions selectedRows={selectedRows} />
          </div>
          <FilterPills
            filters={selectedFilters}
            onRemoveFilter={(filter) => {
              handleRemoveFilter(filter);
            }}
          />
          <div>
            <div className="" aria-label="Search results">
              <Table
                showPageOptions={true}
                label="Search Results"
                isLoading={status || RequestStatus.idle}
                columns={columns.filter((x) => x.isChecked === true)}
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
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default Search;
