import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  fetchParcelDescriptions,
  parcelDescriptions,
  resetAllDataForSite,
  updateAddedRows,
  updateCurrentPage,
  updateDeletedRows,
  updateMergedRows,
  updateResultsPerPage,
  updateSearchParam,
  updateSortBy,
  updateSortByDir,
  updateSortByInputValue,
  updateUpdatedRows,
} from './parcelDescriptionsSlice';
import { useParcelListQuery } from '../sectionListQuery';
import { GridSort } from '../../../components/grid/Grid';
import {
  gridSortDirection,
  nextSortDirection,
} from '../../../helpers/pagedList';
import { SortByDirection } from '../../../../graphql/generated';
import {
  getAddDeleteParcelDescriptionTableColumns,
  getParcelDescriptionsTableColumns,
  parcelColumnIdForSort,
  parcelSortFieldForColumn,
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
  getFieldLabel,
  ChangeContext,
} from '../../../helpers/fieldLabelMapper';
import {
  saveRequestStatus,
  setupParcelDescriptionsDataForSaving,
} from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { Button } from '../../../components/button/Button';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import './ParcelDescription.css';
import { UserType } from '../../../helpers/requests/userType';
import { getUser, isUserOfType, UserRoleType } from '../../../helpers/utility';

type ParcelDescriptionsChangeEvent = {
  property:
    | 'descriptionType'
    | 'idPinNumber'
    | 'dateNoted'
    | 'select_all'
    | 'select_row'
    | 'deleteIcon'
    | 'srValue';
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
  const {
    page: urlPage,
    pageSize: urlPageSize,
    sortBy: urlSortBy,
    sortByDir: urlSortByDir,
    search: urlSearch,
    setQuery,
  } = useParcelListQuery();
  const reduxState = useSelector(parcelDescriptions);
  const viewMode: SiteDetailsMode = useSelector(siteDetailsMode);
  const saveSiteDetailsRequestStatus: RequestStatus =
    useSelector(saveRequestStatus);
  const resetDetails = useSelector(resetSiteDetails);

  const { id } = useParams();
  const siteId = Number(id);
  if (!!id?.trim() && reduxState.siteId !== siteId) {
    // The redux cache has data from another site. Re-initialize everything.
    dispatch(resetAllDataForSite(siteId));
    const fetchParams: IFetchParcelDescriptionsParams = {
      siteId: siteId,
      page: urlPage,
      pageSize: urlPageSize,
      searchParam: urlSearch,
      sortBy: urlSortBy,
      sortByDir: urlSortByDir,
      showPending: false, // Unused in this component.
    };
    dispatch(updateCurrentPage(urlPage));
    dispatch(updateResultsPerPage(urlPageSize));
    dispatch(updateSortBy(urlSortBy));
    dispatch(updateSortByDir(urlSortByDir));
    dispatch(updateSearchParam(urlSearch));
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
  const [searchParam, setSearchParam] = React.useState<string>(urlSearch);
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
  >(reduxState.updatedRows);
  const [mergedRows, setMergedRows] = React.useState<IParcelDescriptionDto[]>(
    reduxState.mergedRows,
  );
  const [selectedRows, setSelectedRows] = React.useState<
    IParcelDescriptionDto[]
  >([]);
  const [addedRows, setAddedRows] = React.useState<IParcelDescriptionSaveDto[]>(
    reduxState.addedRows,
  );
  const [deletedRows, setDeletedRows] = React.useState<
    IParcelDescriptionSaveDto[]
  >(reduxState.deletedRows);

  const loggedInUser = getUser();
  const [userType, setUserType] = useState<UserType>(UserType.External);
  useEffect(() => {
    if (
      isUserOfType(UserRoleType.CLIENT) ||
      isUserOfType(UserRoleType.PUBLIC)
    ) {
      setUserType(UserType.External);
    } else if (isUserOfType(UserRoleType.INTERNAL)) {
      setUserType(UserType.Internal);
    }
  }, [loggedInUser]);

  const handleSelectPage = (newPage: number) => {
    if (newPage !== urlPage) {
      setQuery({ page: newPage });
      dispatch(updateCurrentPage(newPage));
      fetchNewParcelDescriptions({ newPage: newPage });
    }
  };

  const handleChangeResultsPerPage = (newResultsPerPage: number) => {
    if (newResultsPerPage !== urlPageSize) {
      setQuery({ pageSize: newResultsPerPage, page: 1 });
      dispatch(updateResultsPerPage(newResultsPerPage));
      dispatch(updateCurrentPage(1));
      fetchNewParcelDescriptions({
        newPage: 1,
        newPageSize: newResultsPerPage,
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParam = event.target.value;
    if (newSearchParam !== urlSearch) {
      setSearchParam(newSearchParam);
      setQuery({ search: newSearchParam || undefined }, 'replaceIn');
      dispatch(updateSearchParam(newSearchParam));
      fetchNewParcelDescriptions({ newSearchParam: newSearchParam });
    }
  };

  const handleSearchClear = () => {
    if (urlSearch !== '') {
      setSearchParam('');
      setQuery({ search: undefined }, 'replaceIn');
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
      setQuery({
        sortBy: newSortBy,
        sortByDir: newSortByDir,
        page: 1,
      });
      dispatch(updateSortBy(newSortBy));
      dispatch(updateSortByDir(newSortByDir));
      dispatch(updateCurrentPage(1));
      dispatch(
        updateSortByInputValue({
          ...sortByInputValue,
          [graphQLPropertyName]: newSortByInputValue,
        }),
      );
      fetchNewParcelDescriptions({
        newSortBy: newSortBy,
        newSortByDir: newSortByDir,
        newPage: 1,
      });
    }
  };

  const handleColumnSort = (columnId: string) => {
    const newSortBy = parcelSortFieldForColumn(columnId);
    if (!newSortBy) {
      return;
    }
    const newSortByDir = nextSortDirection(
      urlSortBy,
      urlSortByDir === SortByDirection.Desc
        ? SortByDirection.Desc
        : SortByDirection.Asc,
      newSortBy,
    );
    setQuery({ sortBy: newSortBy, sortByDir: newSortByDir, page: 1 });
    dispatch(updateSortBy(newSortBy));
    dispatch(updateSortByDir(newSortByDir));
    dispatch(updateCurrentPage(1));
    fetchNewParcelDescriptions({
      newSortBy,
      newSortByDir,
      newPage: 1,
    });
  };

  const parcelSortColumnId = parcelColumnIdForSort(urlSortBy);
  const parcelGridSort: GridSort | null = parcelSortColumnId
    ? {
        id: parcelSortColumnId,
        direction: gridSortDirection(
          urlSortByDir === SortByDirection.Desc
            ? SortByDirection.Desc
            : SortByDirection.Asc,
        ),
      }
    : null;

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
            srAction: SRApprovalStatusEnum.Pending,
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

    dispatch(updateUpdatedRows(newUpdatedRows));
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Modified,
          getFieldLabel('parcelDescription'),
          ChangeContext.PARCEL_DESCRIPTIONS,
        ).toPlainObject(),
      ),
    );
  };

  const handleAddedRowUpdate = (newRow: IParcelDescriptionDto) => {
    const newAddedRows: IParcelDescriptionSaveDto[] = addedRows.map(
      (originalRow) => {
        if (newRow.id === originalRow.id) {
          return {
            ...newRow,
            apiAction: UserActionEnum.added,
            srAction: SRApprovalStatusEnum.Pending,
          } as IParcelDescriptionSaveDto;
        } else {
          return originalRow;
        }
      },
    );
    dispatch(updateAddedRows(newAddedRows));
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Added,
          getFieldLabel('parcelDescription'),
          ChangeContext.PARCEL_DESCRIPTIONS,
        ).toPlainObject(),
      ),
    );
  };

  const handleAddedRowRemoval = (event: ParcelDescriptionsChangeEvent) => {
    const newAddedRows = addedRows.filter((addedRow) => {
      if (event.row !== undefined) {
        return addedRow.id !== event.row.id;
      }
      return true;
    });
    dispatch(updateAddedRows(newAddedRows));
    // TODO: There needs to be a way to remove the change tracker entry.
  };

  const handleDeletedRowRemoval = (event: ParcelDescriptionsChangeEvent) => {
    const newDeletedRows = deletedRows.filter((deletedRow) => {
      if (event.row !== undefined) {
        return deletedRow.id !== event.row.id;
      }
      return true;
    });
    dispatch(updateDeletedRows(newDeletedRows));
    // TODO: There needs to be a way to remove the change tracker entry.
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

  const handleSelectAll = (
    newRows: IParcelDescriptionDto[],
    selected: boolean,
  ) => {
    // Select All only selects all for the current page.
    const rowIds = selectedRows.map((row) => {
      return row.id;
    });

    let newSelectedRows: IParcelDescriptionDto[];
    if (selected) {
      // Filter out any existing rows and then re-add them. This addresses an
      // edge case where a user selects all, deselects one, then selects all
      // again, resulting in there being duplicate selected rows.
      newSelectedRows = selectedRows
        .filter((row) => {
          return !rowIds.includes(row.id);
        })
        .concat(newRows);
    } else {
      newSelectedRows = selectedRows.filter((row) => {
        return !rowIds.includes(row.id);
      });
    }

    setSelectedRows(newSelectedRows);
  };

  const handleSelectRow = (
    newRow: IParcelDescriptionDto,
    selected: boolean,
  ) => {
    let newSelectedRows: IParcelDescriptionDto[];

    if (selected) {
      newSelectedRows = selectedRows.concat([newRow]);
    } else {
      newSelectedRows = selectedRows.filter((row) => {
        return row.id !== newRow.id;
      });
    }

    setSelectedRows(newSelectedRows);
  };

  const handleAddRow = () => {
    // We need to assign an id to the new row in order to handle merging updates
    // to the row and handling deletions. This id is temporary until it is saved
    // to the database and will always be negative.
    let nextId: Number;
    if (addedRows.length > 0) {
      nextId = Math.min(...addedRows.map((row) => Number(row.id))) - 1;
    } else {
      nextId = -1;
    }
    const newRow: IParcelDescriptionSaveDto = {
      id: nextId.toString(),
      descriptionType: ParcelDescriptionType.ParcelID,
      idPinNumber: '',
      dateNoted: new Date(),
      landDescription: '',
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
      userAction: '',
      srValue: false,
    };
    dispatch(updateAddedRows([...addedRows, newRow]));
  };

  const handleDeleteRows = () => {
    const newDeletedRows: IParcelDescriptionSaveDto[] = deletedRows.concat(
      selectedRows.map((row) => {
        return {
          ...row,
          apiAction: UserActionEnum.deleted,
        } as IParcelDescriptionSaveDto;
      }),
    );
    dispatch(updateDeletedRows(newDeletedRows));
    newDeletedRows.forEach((deletedRow) => {
      dispatch(
        trackChanges(
          new ChangeTracker(
            IChangeType.Deleted,
            getFieldLabel('parcelDescription'),
            ChangeContext.PARCEL_DESCRIPTIONS,
          ).toPlainObject(),
        ),
      );
    });
  };

  const handleEditTableChange = (event: ParcelDescriptionsChangeEvent) => {
    handleTableChange(event, false);
  };

  const handleAddTableChange = (event: ParcelDescriptionsChangeEvent) => {
    handleTableChange(event, true);
  };

  const handleTableChange = (
    event: ParcelDescriptionsChangeEvent,
    added: boolean,
  ) => {
    if (event.property === 'select_all' && event.selected !== undefined) {
      // When selecting all, the event's value will be an array of rows, and the
      // "selected" boolean property will be present. Row is missing.
      handleSelectAll(event.value as IParcelDescriptionDto[], event.selected);
      return;
    }
    if (event.row !== undefined) {
      let newRow: IParcelDescriptionDto;
      switch (event.property) {
        case 'select_row':
          handleSelectRow(event.row, event.value as boolean);
          break;
        case 'descriptionType':
          // There is an edge case where the user enters a 9 digit idPinNumber
          // then changes the description type to Crown Land File Number, which
          // only allows an input length of 7. Truncate the value.
          const value = event.value as ParcelDescriptionType;
          let cleanedIdPinNumber = event.row.idPinNumber;
          if (
            value === ParcelDescriptionType.CrownLandFileNumber &&
            event.row.idPinNumber?.length > 7
          ) {
            cleanedIdPinNumber = event.row.idPinNumber.slice(0, 7);
          }
          newRow = {
            ...event.row,
            idPinNumber: cleanedIdPinNumber,
            descriptionType: value,
          };
          added ? handleAddedRowUpdate(newRow) : handleRowUpdate(newRow);
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
            added ? handleAddedRowUpdate(newRow) : handleRowUpdate(newRow);
          }
          break;
        case 'dateNoted':
          let newDateString: string;
          if (event.value === null) {
            // This happens when clearing the date widget.
            newDateString = '';
          } else {
            const newDate = new Date(event.value as Date);
            newDateString = newDate.toISOString();
          }
          newRow = {
            ...event.row,
            dateNoted: newDateString,
          };
          added ? handleAddedRowUpdate(newRow) : handleRowUpdate(newRow);
          break;
        case 'srValue':
          let updatedNewRow = null;
          if (event.value === 'true' || event.value === true) {
            updatedNewRow = {
              ...event.row,
              srValue: true,
              srAction: SRApprovalStatusEnum.Public,
            };
          } else {
            updatedNewRow = {
              ...event.row,
              srValue: false,
              srAction: SRApprovalStatusEnum.Private,
            };
          }

          handleRowUpdate(updatedNewRow);
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

  useEffect(() => {
    if (!id?.trim() || reduxState.siteId !== siteId) {
      return;
    }
    if (
      reduxState.currentPage === urlPage &&
      reduxState.resultsPerPage === urlPageSize &&
      reduxState.sortBy === urlSortBy &&
      reduxState.sortByDir === urlSortByDir
    ) {
      return;
    }
    dispatch(updateCurrentPage(urlPage));
    dispatch(updateResultsPerPage(urlPageSize));
    dispatch(updateSortBy(urlSortBy));
    dispatch(updateSortByDir(urlSortByDir));
    fetchNewParcelDescriptions({
      newPage: urlPage,
      newPageSize: urlPageSize,
      newSortBy: urlSortBy,
      newSortByDir: urlSortByDir,
    });
  }, [
    urlPage,
    urlPageSize,
    urlSortBy,
    urlSortByDir,
    siteId,
    id,
    reduxState.siteId,
    reduxState.currentPage,
    reduxState.resultsPerPage,
    reduxState.sortBy,
    reduxState.sortByDir,
  ]);

  React.useEffect(() => {
    dispatch(
      setupParcelDescriptionsDataForSaving([
        ...updatedRows,
        ...addedRows,
        ...deletedRows,
      ]),
    );
  }, [updatedRows, addedRows, deletedRows]);

  React.useEffect(() => {
    if (
      viewMode === SiteDetailsMode.EditMode ||
      viewMode === SiteDetailsMode.SRMode
    ) {
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
      dispatch(updateMergedRows(newMergedRows));
    } else {
      dispatch(updateMergedRows(dbRows));
    }
  }, [dbRows, updatedRows, viewMode]);

  React.useEffect(() => {
    if (resetDetails) {
      fetchNewParcelDescriptions({});
      dispatch(updateUpdatedRows([]));
    }
  }, [resetDetails, saveSiteDetailsRequestStatus]);

  React.useEffect(() => {
    setSearchParam(urlSearch);
  }, [urlSearch]);

  React.useEffect(() => {
    if (!id?.trim() || reduxState.siteId !== siteId) {
      return;
    }
    if (reduxState.searchParam === urlSearch) {
      return;
    }
    dispatch(updateSearchParam(urlSearch));
    fetchNewParcelDescriptions({ newSearchParam: urlSearch });
  }, [urlSearch, id, siteId, reduxState.siteId, reduxState.searchParam]);

  React.useEffect(() => {
    // Update local state with redux state.
    setDbRows(reduxState.data);
    setCurrentPage(reduxState.currentPage);
    setRequestStatus(reduxState.requestStatus);
    setResultsPerPage(reduxState.resultsPerPage);
    setSortBy(reduxState.sortBy);
    setSortByDir(reduxState.sortByDir);
    setSortByInputValue(reduxState.sortByInputValue);
    setTotalResults(reduxState.totalResults);
    setUpdatedRows(reduxState.updatedRows);
    setMergedRows(reduxState.mergedRows);
    setAddedRows(reduxState.addedRows);
    setDeletedRows(reduxState.deletedRows);
  }, [reduxState]);

  const addedParcelDescriptions = () => {
    if (addedRows.length > 0 && viewMode === SiteDetailsMode.EditMode) {
      return (
        <div
          className="row"
          id="parcel-descriptions-component-added"
          data-testid="parcel-descriptions-component-added"
        >
          <ParcelDescriptionTable
            title="Create Parcel Descriptions"
            showPageOptions={false}
            requestStatus={requestStatus}
            columns={getAddDeleteParcelDescriptionTableColumns()}
            data={addedRows}
            totalResults={addedRows.length}
            handleSelectPage={() => {}}
            handleChangeResultsPerPage={() => {}}
            currentPage={1}
            resultsPerPage={addedRows.length}
            viewMode={viewMode}
            tableChangeHandler={handleAddTableChange}
            deleteHandler={handleAddedRowRemoval}
            allowRowsSelect={false}
            showAddRemoveButtons={false}
          />
        </div>
      );
    }
  };

  const deletedParcelDescriptions = () => {
    if (deletedRows.length > 0 && viewMode === SiteDetailsMode.EditMode) {
      return (
        <div
          className="row"
          id="parcel-descriptions-component-deleted"
          data-testid="parcel-descriptions-component-deleted"
        >
          <ParcelDescriptionTable
            title="Deleted Parcel Descriptions"
            showPageOptions={false}
            requestStatus={requestStatus}
            columns={getAddDeleteParcelDescriptionTableColumns()}
            data={deletedRows}
            totalResults={deletedRows.length}
            handleSelectPage={() => {}}
            handleChangeResultsPerPage={() => {}}
            currentPage={1}
            resultsPerPage={deletedRows.length}
            viewMode={SiteDetailsMode.ViewOnlyMode}
            tableChangeHandler={() => {}}
            deleteHandler={handleDeletedRowRemoval}
            allowRowsSelect={false}
            showAddRemoveButtons={false}
          />
        </div>
      );
    }
  };

  return (
    <div
      id="parcel-descriptions-component"
      data-testid="parcel-descriptions-component"
    >
      <div id="parcel-descriptions-component-existing">
        <div id="parcel-descriptions-component-search-controls" className="row">
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
        <div
          id="parcel-descriptions-component-existing-table"
          data-testid="parcel-descriptions-component-existing-table"
          className="row py-3"
        >
          <ParcelDescriptionTable
            title="Parcel Descriptions"
            showPageOptions={true}
            requestStatus={requestStatus}
            columns={getParcelDescriptionsTableColumns(viewMode, userType)}
            data={mergedRows}
            totalResults={totalResults}
            handleSelectPage={handleSelectPage}
            handleChangeResultsPerPage={handleChangeResultsPerPage}
            currentPage={currentPage}
            resultsPerPage={resultsPerPage}
            sortControl={{
              manual: true,
              sort: parcelGridSort,
              onSortChange: handleColumnSort,
            }}
            viewMode={viewMode}
            tableChangeHandler={handleEditTableChange}
            deleteHandler={() => {}}
            allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
            selectedRows={selectedRows}
            handleAddRow={handleAddRow}
            handleDeleteRows={handleDeleteRows}
            showAddRemoveButtons={true}
          />
        </div>
        {addedParcelDescriptions()}
        {deletedParcelDescriptions()}
      </div>
    </div>
  );
};

export default ParcelDescriptions;
