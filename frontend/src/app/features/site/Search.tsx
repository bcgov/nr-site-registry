import React, { useState, useEffect } from 'react';
import './Search.css';
import '@bcgov/design-tokens/css/variables.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSites,
  resetSites,
  setFetchLoadingState,
  updateSearchQuery,
  updatePageSizeSetting,
  resultsCount,
} from './dto/SiteSlice';

import { AppDispatch } from '../../Store';
import {
  selectAllSites,
  currentPageSelection,
  currentPageSize,
} from './dto/SiteSlice';
import SearchResults from './SearchResults';
import {
  ShoppingCartIcon,
  FolderPlusIcon,
  FileExportIcon,
  TableColumnsIcon,
  FilterIcon,
  CircleXMarkIcon,
  MagnifyingGlassIcon,
  BarsIcon,
} from '../../components/common/icon';
import Intro from './Intro';
import Column from './columns/Column';
import { TableColumn } from '../../components/table/TableColumn';
import { getSiteSearchResultsColumns } from './dto/Columns';
import SiteFilterForm from './filters/SiteFilterForm';
import PageContainer from '../../components/simple/PageContainer';
import { getUser } from '../../helpers/utility';
import { useAuth } from 'react-oidc-context';
import { addCartItem, resetCartItemAddedStatus } from '../cart/CartSlice';
import AddToFolio from '../folios/AddToFolio';
import { downloadCSV } from '../../helpers/csvExport/csvExport';

const Search = () => {
  const auth = useAuth();
  const [searchText, setSearchText] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const sites = useSelector(selectAllSites);
  const currSearchVal = useSelector((state: any) => state.sites);
  const currentPageInState = useSelector(currentPageSelection);
  const currentPageSizeInState = useSelector(currentPageSize);
  const totalRecords = useSelector(resultsCount);
  const [noUserAction, setUserAction] = useState(true);
  const [displayColumn, SetDisplayColumns] = useState(false);
  const [displayFilters, SetDisplayFilters] = useState(false);

  const columns = getSiteSearchResultsColumns();
  const [columnsToDisplay, setColumnsToDisplay] = useState<TableColumn[]>([
    ...columns,
  ]);
  const [showMobileTableMenu, SetShowMobileTableMenu] = useState(false);

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

  useEffect(() => {
    dispatch(
      fetchSites({ searchParam: currSearchVal.searchQuery ?? searchText }),
    );
  }, [currentPageInState]);

  useEffect(() => {
    dispatch(
      fetchSites({ searchParam: currSearchVal.searchQuery ?? searchText }),
    );
  }, [currentPageSizeInState]);

  const hideColumns = () => {
    SetDisplayColumns(false);
  };

  const resetDefaultColums = () => {
    setColumnsToDisplay(columns);
  };

  const cancelSearchFilter = () => {
    SetDisplayFilters(false);
  };

  useEffect(() => {}, []);

  const search = (value: any) => {
    return sites;
  };

  const dynamicSearchIconStyle = (left: any) => ({
    position: `absoulte`,
    left: `${left}px`,
  });

  const pageChange = (pageRequested: number, resultsCount: number) => {
    dispatch(
      updatePageSizeSetting({
        currentPage: pageRequested,
        pageSize: resultsCount,
      }),
    );
  };

  useEffect(() => {
    if (currSearchVal.searchQuery) {
      setUserAction(false);
      setSearchText(currSearchVal.searchQuery);
      dispatch(fetchSites({ searchParam: currSearchVal.searchQuery }));
    }
  }, []);

  // useEffect(() => {
  //   fetchSites(searchText);
  // }, [dispatch,  searchText]);

  const handleClearSearch = () => {
    setSearchText('');
    setUserAction(true);
    dispatch(resetSites(null));
    dispatch(updateSearchQuery(''));
  };

  const handleTextChange = (event: any) => {
    setUserAction(false);
    setSearchText(event.target.value);
    if (event.target.value.length >= 3) {
      dispatch(setFetchLoadingState(null));
      dispatch(fetchSites({ searchParam: event.target.value }));
      dispatch(updateSearchQuery(event.target.value));
    } else {
      dispatch(resetSites(null));
    }
  };

  const customStyle: React.CSSProperties = {
    left:
      document
        .getElementsByClassName('form-control textSearch')[0]
        ?.getBoundingClientRect().x +
      2 +
      'px',
    position: 'absolute',
    color: 'grey',
    margin: '4px',
  };

  const handleAddToShoppingCart = () => {
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const cartItems = selectedRows.map((row) => {
        return {
          userId: loggedInUser.profile.sub,
          siteId: row.id,
          whoCreated: loggedInUser.profile.given_name ?? '',
          price: 200.11,
        };
      });

      dispatch(resetCartItemAddedStatus(null));
      dispatch(addCartItem(cartItems)).unwrap();
    }
  };

  const [selectedRows, SetSelectedRows] = useState<any[]>([]);

  const changeHandler = (event: any) => {
    if (event && event.property === 'select_row') {
      if (event.value) {
        const index = selectedRows.findIndex((r: any) => r.id === event.row.id);
        if (index === -1) {
          SetSelectedRows([...selectedRows, event.row]);
        } else {
          // do nothing
        }
      } else {
        SetSelectedRows(selectedRows.filter((r: any) => r.id !== event.row.id));
      }

      //const index = selectedRows.findIndex((r: any) => r.id === event.row.id);
      // if (index > -1 && !event.value) {
      //   // If row is already selected, remove it
      //   SetSelectedRows(selectedRows.filter((r: any) => r.id !== event.row.id));
      // } else {
      //   // If row is not selected, add it
      //   SetSelectedRows([...selectedRows, event.row]);
      // }
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

  const [showAddToFolio, SetShowAddToFolio] = useState(false);

  const handleExport = () => {
    if (selectedRows.length > 0) {
      downloadCSV(selectedRows);
    }
  };

  return (
    <PageContainer role="Search">
      <div className="row search-container">
        <h1 className="search-text-label">Search Site Registry</h1>
        <div className="">
          <div className="d-flex align-items-center">
            <div className="custom-text-search">
              {!noUserAction ? null : (
                <div className="custom-text-search-start">
                  <MagnifyingGlassIcon></MagnifyingGlassIcon>
                </div>
              )}

              <div className={`custom-text-search-middle`}>
                <input
                  tabIndex={13}
                  aria-label="Search input"
                  placeholder="Search"
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
            {/* {!noUserAction ? null : (
              <MagnifyingGlassIcon className="search-icon " style={customStyle}>
              </MagnifyingGlassIcon>
            )}
            <input
              type="text"
              onChange={handleTextChange}
              className="form-control textSearch"
              placeholder="Search"
              aria-label="Search input"
              value={searchText}
              tabIndex={13}
            />
            {noUserAction ? null : (
              <CircleXMarkIcon
                className="clear-button"
                
              ></CircleXMarkIcon>
            )} */}
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
            <div className="search-results-section-header-top">
              <div>
                <h2 className="search-results-section-title">Results</h2>
              </div>
              <div className="table-actions hide-custom">
                <div
                  className={`table-actions-items ${
                    displayColumn ? 'active' : ''
                  } `}
                  onClick={() => {
                    SetDisplayColumns(!displayColumn);
                    SetDisplayFilters(false);
                  }}
                >
                  <TableColumnsIcon />
                  Columns
                </div>
                <div
                  className={`table-actions-items ${
                    displayFilters ? 'active' : ''
                  }`}
                  onClick={() => {
                    SetDisplayFilters(!displayFilters);
                    SetDisplayColumns(false);
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
                      className={`table-actions-items`}
                      onClick={() => {
                        SetDisplayColumns(!displayColumn);
                        SetDisplayFilters(false);
                      }}
                    >
                      <TableColumnsIcon />
                      <span className="table-options-text-color">Columns</span>
                    </div>
                    <div
                      className={`table-actions-items ${
                        displayFilters ? 'active' : ''
                      }`}
                      onClick={() => {
                        SetDisplayFilters(!displayFilters);
                        SetDisplayColumns(false);
                      }}
                    >
                      <FilterIcon />
                      <span className="table-options-text-color">Filters</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            {displayFilters && (
              <SiteFilterForm cancelSearchFilter={cancelSearchFilter} />
            )}
            {displayColumn ? (
              <div>
                {' '}
                <Column
                  toggleColumnSelectionForDisplay={
                    toggleColumnSelectionForDisplay
                  }
                  columns={columnsToDisplay}
                  reset={resetDefaultColums}
                  close={hideColumns}
                />
              </div>
            ) : null}
            <div className="search-result-actions">
              <div
                className="search-result-actions-btn"
                onClick={() => handleAddToShoppingCart()}
              >
                <ShoppingCartIcon />
                <span>Add Selected To Cart</span>
              </div>
              <div
                className="search-result-actions-btn"
                onClick={() => {
                  SetShowAddToFolio(!showAddToFolio);
                }}
              >
                <FolderPlusIcon />
                <span>Add Selected To Folio</span>
              </div>
              {showAddToFolio && (
                <AddToFolio
                  className="pos-absolute-search"
                  selectedRows={selectedRows}
                />
              )}

              <div className="search-result-actions-btn" onClick={handleExport}>
                <FileExportIcon />
                <span>Export Results As File</span>
              </div>
            </div>
          </div>
          <div>
            <div className="" aria-label="Search results">
              <SearchResults
                pageChange={pageChange}
                data={search(searchText)}
                columns={columnsToDisplay.filter((x) => x.isChecked === true)}
                totalRecords={totalRecords}
                changeHandler={changeHandler}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>

    // <div className="siteSearchContainer" role="search">

    // </div>
  );
};

export default Search;
