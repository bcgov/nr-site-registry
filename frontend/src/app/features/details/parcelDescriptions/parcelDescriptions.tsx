import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { TableColumn } from '../../../components/table/TableColumn';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  fetchParcelDescriptions,
  initialParcelDescriptionsState,
  parcelDescriptions,
  resetAllDataForSite,
  updateCurrentPage,
  updateResultsPerPage,
  updateSearchParam,
  updateSortBy,
  updateSortByDir,
  updateSortByInputValue,
} from './parcelDescriptionsSlice';
import { columns } from './parcelDescriptionsConfig';
import { useParams } from 'react-router-dom';
import ParcelDescriptionTable from './ParcelDescriptionTable';
import {
  IFetchParcelDescriptionsParams,
  IParcelDescriptionDto,
} from './parcelDescriptionsInterfaces';
import { RequestStatus } from '../../../helpers/requests/status';

const ParcelDescriptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxState = useSelector(parcelDescriptions);

  const { id } = useParams();
  const siteId = Number(id);
  if (reduxState.siteId !== siteId) {
    // The redux cache has data from another site. Re-initialize everything.
    dispatch(resetAllDataForSite(siteId));
    const fetchParams: IFetchParcelDescriptionsParams = {
      siteId: siteId,
      page: initialParcelDescriptionsState.currentPage,
      pageSize: initialParcelDescriptionsState.resultsPerPage,
      searchParam: initialParcelDescriptionsState.searchParam,
      sortBy: initialParcelDescriptionsState.sortBy,
      sortByDir: initialParcelDescriptionsState.sortByDir,
      showPending: false, // Unused in this component.
    };
    dispatch(fetchParcelDescriptions(fetchParams));
  }

  const [data, setData] = React.useState<IParcelDescriptionDto[]>(
    reduxState.data,
  );
  const [currentPage, setCurrentPage] = React.useState<number>(
    reduxState.currentPage,
  );
  const [resultsPerPage, setResultsPerPage] = React.useState<number>(
    reduxState.resultsPerPage,
  );
  const [totalResults, setTotalResults] = React.useState<number>(
    reduxState.totalResults,
  );
  const [searchParam, setSearchParam] = React.useState<string>(
    reduxState.searchParam,
  );
  const [sortBy, setSortBy] = React.useState<string>(reduxState.sortBy);
  const [sortByDir, setSortByDir] = React.useState<string>(
    reduxState.sortByDir,
  );
  const [sortByInputValue, setSortByInputValue] = React.useState<{
    [key: string]: any;
  }>(reduxState.sortByInputValue);
  const [requestStatus, setRequestStatus] = React.useState<RequestStatus>(
    reduxState.requestStatus,
  );

  const handleSelectPage = (newPage: number) => {
    if (newPage !== currentPage) {
      dispatch(updateCurrentPage(newPage));
      fetchNewParcelDescriptions({ newPage: newPage });
    }
  };

  const handleChangeResultsPerPage = (newResultsPerPage: number) => {
    if (newResultsPerPage !== resultsPerPage) {
      dispatch(updateResultsPerPage(newResultsPerPage));
      fetchNewParcelDescriptions({ newPageSize: newResultsPerPage });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParam = event.target.value;
    if (newSearchParam !== searchParam) {
      dispatch(updateSearchParam(newSearchParam));
      fetchNewParcelDescriptions({ newSearchParam: newSearchParam });
    }
  };

  const handleSearchClear = () => {
    if (searchParam !== '') {
      dispatch(updateSearchParam(''));
      fetchNewParcelDescriptions({
        newSearchParam: '',
      });
    }
  };

  const tableChangeHandler = () => {
    // To Be Implemented As Part Of EDIT functionality
  };

  const handleSortInputChange = (
    graphQLPropertyName: any,
    newSortByInputValue: string | [Date, Date],
  ) => {
    let newSortBy: string;
    let newSortByDir: string;
    switch (newSortByInputValue) {
      case 'newToOld':
        newSortBy = 'date_noted';
        newSortByDir = 'DESC';
        break;
      case 'oldTonew':
        newSortBy = 'date_noted';
        newSortByDir = 'ASC';
        break;
      default:
        newSortBy = 'id';
        newSortByDir = 'ASC';
        break;
    }
    if (sortByInputValue[graphQLPropertyName] !== newSortByInputValue) {
      dispatch(updateSortBy(newSortBy));
      dispatch(updateSortByDir(newSortByDir));
      dispatch(
        updateSortByInputValue({
          ...sortByInputValue,
          [graphQLPropertyName]: newSortByInputValue,
        }),
      );
      fetchNewParcelDescriptions({
        newSortBy: newSortBy,
        newSortByDir: newSortByDir,
      });
    }
  };

  const handleTableSortChange = (column: TableColumn, descending: boolean) => {
    let newSortBy = 'id';
    let newSortByDir = descending ? 'DESC' : 'ASC';
    switch (column.graphQLPropertyName) {
      case 'descriptionType':
        newSortBy = 'description_type';
        break;
      case 'idPinNumber':
        newSortBy = 'id_pin_number';
        break;
      case 'dateNoted':
        newSortBy = 'date_noted';
        break;
      case 'landDescription':
        newSortBy = 'land_description';
        break;
    }

    if (newSortBy !== sortBy) {
      dispatch(updateSortBy(newSortBy));
      dispatch(updateSortByDir(newSortByDir));
      fetchNewParcelDescriptions({
        newSortBy: newSortBy,
        newSortByDir: newSortByDir,
      });
    }
  };

  const fetchNewParcelDescriptions = ({
    newPage,
    newPageSize,
    newSearchParam,
    newSortBy,
    newSortByDir,
  }: {
    newPage?: number;
    newPageSize?: number;
    newSearchParam?: string;
    newSortBy?: string;
    newSortByDir?: string;
  }) => {
    const fetchParams: IFetchParcelDescriptionsParams = {
      siteId: siteId,
      page: newPage !== undefined ? newPage : currentPage,
      pageSize: newPageSize !== undefined ? newPageSize : resultsPerPage,
      searchParam: newSearchParam !== undefined ? newSearchParam : searchParam,
      sortBy: newSortBy !== undefined ? newSortBy : sortBy,
      sortByDir: newSortByDir !== undefined ? newSortByDir : sortByDir,
      showPending: false, // Unused in this component.
    };
    dispatch(fetchParcelDescriptions(fetchParams));
  };

  React.useEffect(() => {
    // Update local state with redux state.
    setData(reduxState.data);
    setCurrentPage(reduxState.currentPage);
    setRequestStatus(reduxState.requestStatus);
    setResultsPerPage(reduxState.resultsPerPage);
    setSearchParam(reduxState.searchParam);
    setSortBy(reduxState.sortBy);
    setSortByDir(reduxState.sortByDir);
    setSortByInputValue(reduxState.sortByInputValue);
    setTotalResults(reduxState.totalResults);
  }, [reduxState]);

  return (
    <div
      id="parcel-descriptions-component"
      data-testid="parcel-descriptions-component"
    >
      <div className="row justify-content-between p-0">
        <div className="col-9">
          <SearchInput
            label={'Search'}
            searchTerm={searchParam}
            clearSearch={handleSearchClear}
            handleSearchChange={handleSearchChange}
          />
        </div>
        <div className="col-3">
          <Sort
            formData={sortByInputValue}
            editMode={true}
            handleSortChange={handleSortInputChange}
          />
        </div>
      </div>
      <div className="row">
        <h2>Parcel Description</h2>
        <hr />
        <ParcelDescriptionTable
          showPageOptions={true}
          requestStatus={requestStatus}
          columns={columns}
          data={data}
          totalResults={totalResults}
          handleSelectPage={handleSelectPage}
          handleChangeResultsPerPage={handleChangeResultsPerPage}
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
          handleTableSortChange={handleTableSortChange}
          tableChangeHandler={tableChangeHandler}
        />
      </div>
    </div>
  );
};

export default ParcelDescriptions;
