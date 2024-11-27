import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { TableColumn } from '../../../components/table/TableColumn';
import { useEffect, useState } from 'react';
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

  const [data, setData] = useState<IParcelDescriptionDto[]>(reduxState.data);
  const [currentPage, setCurrentPage] = useState<number>(
    reduxState.currentPage,
  );
  const [resultsPerPage, setResultsPerPage] = useState<number>(
    reduxState.resultsPerPage,
  );
  const [totalResults, setTotalResults] = useState<number>(
    reduxState.totalResults,
  );
  const [searchParam, setSearchParam] = useState<string>(
    reduxState.searchParam,
  );
  const [sortBy, setSortBy] = useState<string>(reduxState.sortBy);
  const [sortByDir, setSortByDir] = useState<string>(reduxState.sortByDir);
  const [sortByInputValue, setSortByInputValue] = useState<{
    [key: string]: any;
  }>(reduxState.sortByInputValue);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    reduxState.requestStatus,
  );

  const handleSelectPage = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      dispatch(updateCurrentPage(newPage));
      fetchNewParcelDescriptions({ newPage: newPage });
    }
  };

  const handleChangeResultsPerPage = (newResultsPerPage: number) => {
    if (newResultsPerPage !== resultsPerPage) {
      setResultsPerPage(newResultsPerPage);
      dispatch(updateResultsPerPage(newResultsPerPage));
      fetchNewParcelDescriptions({ newPageSize: newResultsPerPage });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParam = event.target.value;
    if (newSearchParam !== searchParam) {
      setSearchParam(newSearchParam);
      dispatch(updateSearchParam(newSearchParam));
      fetchNewParcelDescriptions({ newSearchParam: newSearchParam });
    }
  };

  const handleSearchClear = () => {
    if (searchParam !== initialParcelDescriptionsState.searchParam) {
      setSearchParam(initialParcelDescriptionsState.searchParam);
      dispatch(updateSearchParam(initialParcelDescriptionsState.searchParam));
      fetchNewParcelDescriptions({
        newSearchParam: initialParcelDescriptionsState.searchParam,
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
      setSortBy(newSortBy);
      setSortByDir(newSortByDir);
      setSortByInputValue({
        ...sortByInputValue,
        [graphQLPropertyName]: newSortByInputValue,
      });
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
      setSortBy(newSortBy);
      setSortByDir(newSortByDir);
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
    newPage?: number | null;
    newPageSize?: number | null;
    newSearchParam?: string | null;
    newSortBy?: string | null;
    newSortByDir?: string | null;
  }) => {
    const fetchParams: IFetchParcelDescriptionsParams = {
      siteId: siteId,
      page: newPage || currentPage,
      pageSize: newPageSize || resultsPerPage,
      searchParam: newSearchParam || searchParam,
      sortBy: newSortBy || sortBy,
      sortByDir: newSortByDir || sortByDir,
      showPending: false, // Unused in this component.
    };
    dispatch(fetchParcelDescriptions(fetchParams));
  };

  useEffect(() => {
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
