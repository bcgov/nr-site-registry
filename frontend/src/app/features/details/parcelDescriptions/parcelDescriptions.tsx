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
import {
  getParcelDescriptionsTableColumns,
  ParcelDescriptionType,
} from './parcelDescriptionsConfig';
import { useParams } from 'react-router-dom';
import ParcelDescriptionTable from './ParcelDescriptionTable';
import {
  IFetchParcelDescriptionsParams,
  IParcelDescriptionDto,
  IParcelDescriptionSaveDto,
} from './parcelDescriptionsInterfaces';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import {
  saveRequestStatus,
  setupParcelDescriptionsDataForSaving,
} from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import './parcelDescriptions.css';

type ParcelDescriptionsChangeEvent = {
  property: 'descriptionType' | 'idPinNumber' | 'dateNoted';
  value:
    | string
    | boolean
    | Date
    | null
    | IParcelDescriptionDto[]
    | ParcelDescriptionType;
  row?: IParcelDescriptionDto;
  selected?: boolean;
};

const ParcelDescriptions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reduxState = useSelector(parcelDescriptions);
  const viewMode: SiteDetailsMode = useSelector(siteDetailsMode);
  const saveSiteDetailsRequestStatus: RequestStatus =
    useSelector(saveRequestStatus);
  const resetDetails = useSelector(resetSiteDetails);

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

  const [dbRows, setDbRows] = React.useState<IParcelDescriptionDto[]>(
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
  const [updatedRows, setUpdatedRows] = React.useState<
    IParcelDescriptionSaveDto[]
  >([]);
  const [mergedRows, setMergedRows] = React.useState<IParcelDescriptionDto[]>(
    [],
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

  const handleRowUpdate = (newRow: IParcelDescriptionDto) => {
    let rowExistsInMemory = false;
    const newUpdatedRows: IParcelDescriptionSaveDto[] = updatedRows.map(
      (originalRow) => {
        // Try to replace the existing row with the updated row.
        if (newRow.id === originalRow.id) {
          rowExistsInMemory = true;
          return {
            ...newRow,
            apiAction: UserActionEnum.updated,
            srAction: 'pending',
          } as IParcelDescriptionSaveDto;
        } else {
          return originalRow;
        }
      },
    );
    if (!rowExistsInMemory) {
      // Add the newly edited row to the array of edited rows.
      newUpdatedRows.push({
        ...newRow,
        apiAction: UserActionEnum.updated,
      } as IParcelDescriptionSaveDto);
    }

    setUpdatedRows(newUpdatedRows);
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Modified,
          `Parcel Descriptions: ${newRow.id}`,
        ).toPlainObject(),
      ),
    );
  };

  const idPinNumberIsValid = (
    newIdPinNumber: string,
    descriptionType: ParcelDescriptionType,
  ): boolean => {
    switch (descriptionType) {
      case ParcelDescriptionType.ParcelID:
      case ParcelDescriptionType.CrownLandPIN:
        return newIdPinNumber.length <= 9;
      case ParcelDescriptionType.CrownLandFileNumber:
        return newIdPinNumber.length <= 7;
    }
  };

  const handleTableChange = (event: ParcelDescriptionsChangeEvent) => {
    if (event.row !== undefined) {
      let newRow: IParcelDescriptionDto;
      switch (event.property) {
        case 'descriptionType':
          // There is an edge case where the user enters a 9 digit idPinNumber
          // then changes the description type to Crown Land File Number, which
          // only allows an input length of 7. Truncate the value.
          const value = event.value as ParcelDescriptionType;
          if (value === ParcelDescriptionType.CrownLandFileNumber) {
            event.row.idPinNumber = event.row.idPinNumber.slice(0, 7);
          }
          newRow = {
            ...event.row,
            descriptionType: value,
          };
          handleRowUpdate(newRow);
          break;
        case 'idPinNumber':
          if (
            idPinNumberIsValid(
              event.value as string,
              event.row?.descriptionType as ParcelDescriptionType,
            )
          ) {
            newRow = {
              ...event.row,
              idPinNumber: event.value as string,
            };
            handleRowUpdate(newRow);
          }
          break;
        case 'dateNoted':
          let newDateString: string;
          if (event.value === null) {
            // This happens when clearing the date widget.
            newDateString = '';
          } else {
            const newDate = event.value as Date;
            newDateString = newDate.toISOString();
          }
          newRow = {
            ...event.row,
            dateNoted: newDateString,
          };
          handleRowUpdate(newRow);
          break;
      }
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
    dispatch(setupParcelDescriptionsDataForSaving([...updatedRows]));
  }, [updatedRows]);

  React.useEffect(() => {
    if (viewMode == SiteDetailsMode.EditMode) {
      // Merge rows from DB with user edited rows upon the update of either.
      const newMergedRows = dbRows.map((dbRow) => {
        const match = updatedRows.find((updatedRow) => {
          return updatedRow.id === dbRow.id;
        });
        if (match) {
          return match as IParcelDescriptionDto;
        } else {
          return dbRow;
        }
      });
      setMergedRows(newMergedRows);
    } else {
      setMergedRows(dbRows);
    }
  }, [dbRows, updatedRows, viewMode]);

  React.useEffect(() => {
    if (resetDetails) {
      fetchNewParcelDescriptions({});
      setUpdatedRows([]);
    }
  }, [resetDetails, saveSiteDetailsRequestStatus]);

  React.useEffect(() => {
    // Update local state with redux state.
    setDbRows(reduxState.data);
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
          columns={getParcelDescriptionsTableColumns(viewMode)}
          data={mergedRows}
          totalResults={totalResults}
          handleSelectPage={handleSelectPage}
          handleChangeResultsPerPage={handleChangeResultsPerPage}
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
          handleTableSortChange={handleTableSortChange}
          viewMode={viewMode}
          tableChangeHandler={handleTableChange}
        />
      </div>
    </div>
  );
};

export default ParcelDescriptions;
