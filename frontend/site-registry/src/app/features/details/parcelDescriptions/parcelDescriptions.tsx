import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import Table from '../../../components/table/Table';
import { RequestStatus } from '../../../helpers/requests/status';
import { TableColumn } from '../../../components/table/TableColumn';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../Store';
import {
  IParcelDescriptionState,
  resetStateForNewSiteId,
  setCurrentPage,
  setData,
  setRequestStatus,
  setResultsPerPage,
  setSearchParam,
  setSortBy,
  setSortByDir,
  setSortByInputValue,
  setTotalResults,
} from './parcelDescriptionsSlice';
import { columns } from './parcelDescriptionsConfig';
import { getParcelDescriptions } from './getParcelDescriptions';
import './parcelDescriptions.css';
import { useParams } from 'react-router-dom';

const ParcelDescriptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const parcelDescriptionsState: IParcelDescriptionState = useSelector(
    (state: RootState) => state.parcelDescriptions,
  );
  const { id } = useParams();
  const siteId = Number(id);

  if (parcelDescriptionsState.siteId !== siteId) {
    dispatch(resetStateForNewSiteId(siteId));
  }

  const data = parcelDescriptionsState.data;
  const requestStatus = parcelDescriptionsState.requestStatus;
  const totalResults = parcelDescriptionsState.totalResults;
  const currentPage = parcelDescriptionsState.currentPage;
  const resultsPerPage = parcelDescriptionsState.resultsPerPage;
  const searchParam = parcelDescriptionsState.searchParam;
  const sortBy = parcelDescriptionsState.sortBy;
  const sortByDir = parcelDescriptionsState.sortByDir;
  const sortByInputValue = parcelDescriptionsState.sortByInputValue;

  async function updateParcelDescriptions() {
    let parcelDescriptions = await getParcelDescriptions(
      siteId,
      currentPage,
      resultsPerPage,
      searchParam,
      sortBy,
      sortByDir,
    );
    dispatch(setData(parcelDescriptions.data));
    dispatch(setTotalResults(parcelDescriptions.count));
    dispatch(setRequestStatus(RequestStatus.idle));
  }

  const handleSelectPage = (newPage: number) => {
    dispatch(setRequestStatus(RequestStatus.pending));
    dispatch(setCurrentPage(newPage));
  };

  const handleChangeResultsPerPage = (newResultsPerPage: number) => {
    dispatch(setRequestStatus(RequestStatus.pending));
    dispatch(setResultsPerPage(newResultsPerPage));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRequestStatus(RequestStatus.pending));
    const newSearchParam = event.target.value;
    dispatch(setSearchParam(newSearchParam));
  };

  const handleSearchClear = () => {
    dispatch(setRequestStatus(RequestStatus.pending));
    dispatch(setSearchParam(''));
  };

  const handleSortInputChange = (
    graphQLPropertyName: any,
    newSortByInputValue: string | [Date, Date],
  ) => {
    dispatch(
      setSortByInputValue({
        ...sortByInputValue,
        [graphQLPropertyName]: newSortByInputValue,
      }),
    );
    switch (newSortByInputValue) {
      case 'newToOld':
        dispatch(setSortBy('date_noted'));
        dispatch(setSortByDir('DESC'));
        break;
      case 'oldTonew':
        dispatch(setSortBy('date_noted'));
        dispatch(setSortByDir('ASC'));
        break;
      default:
        dispatch(setSortBy('id'));
        dispatch(setSortByDir('ASC'));
        break;
    }
    dispatch(setRequestStatus(RequestStatus.pending));
  };

  const handleTableSortChange = (column: TableColumn, descending: boolean) => {
    switch (column.graphQLPropertyName) {
      case 'descriptionType':
        dispatch(setSortBy('description_type'));
        break;
      case 'idPinNumber':
        dispatch(setSortBy('id_pin_number'));
        break;
      case 'dateNoted':
        dispatch(setSortBy('date_noted'));
        break;
      case 'landDescription':
        dispatch(setSortBy('land_description'));
        break;
      default:
        dispatch(setSortBy('id'));
        break;
    }
    dispatch(setSortByDir(descending ? 'DESC' : 'ASC'));
    dispatch(setRequestStatus(RequestStatus.pending));
  };

  useEffect(() => {
    updateParcelDescriptions();
  }, [currentPage, resultsPerPage, searchParam, sortBy, sortByDir]);

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
        <Table
          showPageOptions={true}
          label="Search Results"
          isLoading={requestStatus}
          columns={columns}
          data={data}
          totalResults={totalResults}
          selectPage={handleSelectPage}
          changeResultsPerPage={handleChangeResultsPerPage}
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
          allowRowsSelect={false}
          changeHandler={() => {}}
          editMode={false}
          idColumnName="id"
          sortHandler={handleTableSortChange}
        ></Table>
      </div>
    </div>
  );
};

export default ParcelDescriptions;
