import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { TableColumn } from '../../../components/table/TableColumn';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../Store';
import {
  fetchParcelDescriptions,
  initialParcelDescriptionsState,
} from './parcelDescriptionsSlice';
import { columns } from './parcelDescriptionsConfig';
import { useParams } from 'react-router-dom';
import ParcelDescriptionTable from './ParcelDescriptionTable';
import { IParcelDescriptionsState } from './parcelDescriptionsInterfaces';
import { RequestStatus } from '../../../helpers/requests/status';

const ParcelDescriptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  let {
    siteId,
    data,
    requestStatus,
    totalResults,
    currentPage,
    resultsPerPage,
    searchParam,
    sortBy,
    sortByDir,
    sortByInputValue,
    needsUpdate,
  } = useSelector((state: RootState) => state.parcelDescriptions);
  const { id } = useParams();
  const currentSiteId = Number(id);
  if (siteId !== currentSiteId) {
    // The redux cache has data from another site. Re-initialize everything..
    siteId = initialParcelDescriptionsState.siteId;
    data = initialParcelDescriptionsState.data;
    requestStatus = initialParcelDescriptionsState.requestStatus;
    totalResults = initialParcelDescriptionsState.totalResults;
    currentPage = initialParcelDescriptionsState.currentPage;
    resultsPerPage = initialParcelDescriptionsState.resultsPerPage;
    searchParam = initialParcelDescriptionsState.searchParam;
    sortBy = initialParcelDescriptionsState.sortBy;
    sortByDir = initialParcelDescriptionsState.sortByDir;
    sortByInputValue = initialParcelDescriptionsState.sortByInputValue;
    needsUpdate = initialParcelDescriptionsState.needsUpdate;
  }

  const handleSelectPage = (newPage: number) => {
    currentPage = newPage;
    needsUpdate = true;
    fetchNewParcelDescriptions();
  };

  const handleChangeResultsPerPage = (newResultsPerPage: number) => {
    resultsPerPage = newResultsPerPage;
    needsUpdate = true;
    fetchNewParcelDescriptions();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParam = event.target.value;
    searchParam = newSearchParam;
    needsUpdate = true;
    fetchNewParcelDescriptions();
  };

  const handleSearchClear = () => {
    searchParam = '';
    needsUpdate = true;
    fetchNewParcelDescriptions();
  };

  const tableChangeHandler = () => {
    // To Be Implemented As Part Of EDIT functionality
  };

  const handleSortInputChange = (
    graphQLPropertyName: any,
    newSortByInputValue: string | [Date, Date],
  ) => {
    sortByInputValue = {
      ...sortByInputValue,
      [graphQLPropertyName]: newSortByInputValue,
    };
    switch (newSortByInputValue) {
      case 'newToOld':
        sortBy = 'date_noted';
        sortByDir = 'DESC';
        break;
      case 'oldTonew':
        sortBy = 'date_noted';
        sortByDir = 'ASC';
        break;
      default:
        sortBy = 'id';
        sortByDir = 'ASC';
        break;
    }
    needsUpdate = true;
    fetchNewParcelDescriptions();
  };

  const handleTableSortChange = (column: TableColumn, descending: boolean) => {
    switch (column.graphQLPropertyName) {
      case 'descriptionType':
        sortBy = 'description_type';
        break;
      case 'idPinNumber':
        sortBy = 'id_pin_number';
        break;
      case 'dateNoted':
        sortBy = 'date_noted';
        break;
      case 'landDescription':
        sortBy = 'land_description';
        break;
      default:
        sortBy = 'id';
        break;
    }
    sortByDir = descending ? 'DESC' : 'ASC';
    needsUpdate = true;
    fetchNewParcelDescriptions();
  };

  const fetchNewParcelDescriptions = () => {
    if (needsUpdate) {
      requestStatus = RequestStatus.loading;
    }
    const updatedParcelDescriptionsState: IParcelDescriptionsState = {
      siteId: currentSiteId,
      currentPage: currentPage,
      resultsPerPage: resultsPerPage,
      searchParam: searchParam,
      totalResults: totalResults,
      data: data,
      sortBy: sortBy,
      sortByDir: sortByDir,
      sortByInputValue: sortByInputValue,
      requestStatus: requestStatus,
      needsUpdate: needsUpdate,
    };
    dispatch(fetchParcelDescriptions(updatedParcelDescriptionsState));
  };

  useEffect(() => {
    fetchNewParcelDescriptions();
  }, []);

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
