import React, { useEffect, useState } from 'react';
import SRUpdatesTableConfiguration from './srUpdatesTableConfiguration';
import { RequestStatus } from '../../../helpers/requests/status';
import PageContainer from '../../../components/simple/PageContainer';
import {
  BarsIcon,
  FilterIcon,
  TickIcon,
  XmarkIcon,
} from '../../../components/common/icon';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  bulkAproveRejectChanges,
  fetchPendingSiteForSRApproval,
  getSearchParam,
  getTotalRecords,
  selectAllSites,
  updateStatus,
} from './state/srUpdatesTableSlice';
import SRUpdatesTableFilter from './srUpdatesTableFilter';
import Table from '../../../components/table/Table';
import { showNotification } from '../../../helpers/utility';
import { fetchInternalUserNameForDropdown, getInternalUserNameForDropdown } from '../dropdowns/DropdownSlice';

const SRUpdatesTables = () => {
  const [displayFilters, SetDisplayFilters] = useState(false);
  const [showMobileTableMenu, SetShowMobileTableMenu] = useState(false);
  let [currentPage, SetCurrentPage] = useState(1);
  let [resultsPerPage, SetResultsPerPage] = useState(5);
  const [totalResults, SetTotalResults] = useState(1);
  const reviewPendingSites = useSelector(selectAllSites);
  const totalRecords = useSelector(getTotalRecords);
  const updateRequestStatus = useSelector(updateStatus);
  const searchParamRef = useSelector(getSearchParam);
  const [searchParam,SetSearchParam] = useState(searchParamRef)
  useEffect(()=>{
    SetSearchParam(searchParamRef)
  },[searchParamRef])

  useEffect(()=>{
    dispatch(fetchInternalUserNameForDropdown());
  },[])




  const dispatch = useDispatch<AppDispatch>();



  useEffect(() => {
    SetTotalResults(totalRecords);
  }, [totalRecords]);

  const [selectedRows, SetSelectedRows] = useState<any[]>([]);

  const changeHandler = (event: any) => {
    if (event && event.property === 'select_row') {
      if (event.value) {
        const index = selectedRows.findIndex(
          (r: any) => r.siteId === event.row.siteId,
        );
        if (index === -1) {
          SetSelectedRows([...selectedRows, event.row]);
        } else {
          // do nothing
        }
      } else {
        SetSelectedRows(
          selectedRows.filter((r: any) => r.siteId !== event.row.siteId),
        );
      }    
    } else if (event && event.property === 'select_all') {
      const newRows = event.value;
      if (event.selected) {
        SetSelectedRows((prevArray) => {
          const existingIds = new Set(prevArray.map((obj) => obj.siteId));
          const uniqueRows = newRows.filter(
            (row: any) => !existingIds.has(row.siteId),
          );
          return [...prevArray, ...uniqueRows];
        });
      } else {
        SetSelectedRows((prevArray) => {
          const idsToRemove = new Set(newRows.map((row: any) => row.siteId));
          return prevArray.filter((obj) => !idsToRemove.has(obj.siteId));
        });
      }
    }
  };

  const rejectHandler = () => {    
    if (selectedRows.length > 0) {
      dispatch(
        bulkAproveRejectChanges({
          sites: selectedRows,
          isApproved: false,
        }),
      );
    }
  };

  const handleApprove = () => {    
    if (selectedRows.length > 0) {
      dispatch(
        bulkAproveRejectChanges({
          sites: selectedRows,
          isApproved: true,
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(
      fetchPendingSiteForSRApproval({
        searchParam: searchParam,
        page: currentPage,
        pageSize: resultsPerPage     
      }),
    );
  }, []);

  const selectPage = (pageNumber: number): void => {
    SetCurrentPage(pageNumber);
  };

  const changeResultsPerPage = (pageNumber: number): void => {
    SetResultsPerPage(pageNumber);
  };

  useEffect(() => {

    showNotification(
        updateRequestStatus,
        'Successfully updated.',
        'Unable updated',
      );
      
    dispatch(
      fetchPendingSiteForSRApproval({
        searchParam: searchParam,
        page: currentPage,
        pageSize: resultsPerPage
      }),
    );
      
  }, [updateRequestStatus, currentPage, resultsPerPage]);

  return (
    <PageContainer role="SRApprovalPending" >
      <div className="row search-container" data-testid="srreviewtable-component">
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
                <span className="table-options-text-color" data-testid="filters">Filters</span>
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
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
        />
      )}
      <div className="search-result-actions">
        <div
          className="search-result-actions-btn"
          onClick={() => {
            handleApprove();
          }}
          data-testid="approve-btn"
        >
          <TickIcon />
          <span>Approve</span>
        </div>
        <div
          className="search-result-actions-btn"
          onClick={() => {
            rejectHandler();
          }}
          data-testid="reject-btn"
        >
          <XmarkIcon />
          <span>Not Public</span>
        </div>
      </div>
      <div className="col-12" data-testid="srreview-table">
        <Table
          showPageOptions={true}
          label="Search Results"
          isLoading={RequestStatus.success}
          columns={SRUpdatesTableConfiguration}
          data={reviewPendingSites}
          totalResults={totalResults}
          selectPage={selectPage}
          changeResultsPerPage={changeResultsPerPage}
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
          allowRowsSelect={true}
          changeHandler={(event) => {
            changeHandler(event);
          }}
          editMode={false}
          idColumnName="id"
        ></Table>
      </div>
    </PageContainer>
  );
};

export default SRUpdatesTables;
