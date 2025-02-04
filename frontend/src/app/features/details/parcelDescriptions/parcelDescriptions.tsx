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
  getAddDeleteParcelDescriptionTableColumns,
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
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { Button } from '../../../components/button/Button';
import { UserMinus, UserPlus } from '../../../components/common/icon';

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
  const [selectedRows, setSelectedRows] = React.useState<
    IParcelDescriptionDto[]
  >([]);
  const [addedRows, setAddedRows] = React.useState<IParcelDescriptionSaveDto[]>(
    [],
  );
  const [deletedRows, setDeletedRows] = React.useState<
    IParcelDescriptionSaveDto[]
  >([]);

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
    setAddedRows(newAddedRows);
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Added,
          `Parcel Descriptions: Added New Parcel Description(s)`,
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
    setAddedRows(newAddedRows);
    // TODO: There needs to be a way to remove the change tracker entry.
  };

  const handleDeletedRowRemoval = (event: ParcelDescriptionsChangeEvent) => {
    const newDeletedRows = deletedRows.filter((deletedRow) => {
      if (event.row !== undefined) {
        return deletedRow.id !== event.row.id;
      }
      return true;
    });
    setDeletedRows(newDeletedRows);
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
      dateNoted: '',
      landDescription: '',
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
      userAction: '',
      srValue: false,
    };
    setAddedRows([...addedRows, newRow]);
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
    setDeletedRows(newDeletedRows);
    newDeletedRows.forEach((deletedRow) => {
      dispatch(
        trackChanges(
          new ChangeTracker(
            IChangeType.Deleted,
            `Parcel Descriptions: ${deletedRow.id}`,
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
            const newDate = event.value as Date;
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

  const addRemoveButtons = () => {
    if (viewMode === SiteDetailsMode.EditMode) {
      return (
        <div className="row">
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => handleAddRow()}>
              <UserPlus />
              Add Parcel Description
            </Button>
            <Button
              variant="secondary"
              disabled={selectedRows.length === 0}
              onClick={() => handleDeleteRows()}
            >
              <UserMinus />
              Remove Parcel Description
            </Button>
          </div>
        </div>
      );
    }
  };

  const addedParcelDescriptions = () => {
    if (addedRows.length > 0 && viewMode === SiteDetailsMode.EditMode) {
      return (
        <div
          id="parcel-descriptions-component-added"
          data-testid="parcel-descriptions-component-added"
        >
          <div className="row">
            <h3>Parcel Descriptions to Create</h3>
            <hr />
          </div>
          <div className="row">
            <ParcelDescriptionTable
              showPageOptions={false}
              requestStatus={requestStatus}
              columns={getAddDeleteParcelDescriptionTableColumns()}
              data={addedRows}
              totalResults={addedRows.length}
              handleSelectPage={() => {}}
              handleChangeResultsPerPage={() => {}}
              currentPage={1}
              resultsPerPage={addedRows.length}
              handleTableSortChange={() => {}}
              viewMode={viewMode}
              tableChangeHandler={handleAddTableChange}
              deleteHandler={handleAddedRowRemoval}
              allowRowsSelect={false}
            />
          </div>
        </div>
      );
    }
  };

  const deletedParcelDescriptions = () => {
    if (deletedRows.length > 0 && viewMode === SiteDetailsMode.EditMode) {
      return (
        <div
          id="parcel-descriptions-component-deleted"
          data-testid="parcel-descriptions-component-deleted"
        >
          <div className="row">
            <h3>Parcel Descriptions to Delete</h3>
            <hr />
          </div>
          <div className="row">
            <ParcelDescriptionTable
              showPageOptions={false}
              requestStatus={requestStatus}
              columns={getAddDeleteParcelDescriptionTableColumns()}
              data={deletedRows}
              totalResults={deletedRows.length}
              handleSelectPage={() => {}}
              handleChangeResultsPerPage={() => {}}
              currentPage={1}
              resultsPerPage={deletedRows.length}
              handleTableSortChange={() => {}}
              viewMode={SiteDetailsMode.ViewOnlyMode}
              tableChangeHandler={() => {}}
              deleteHandler={handleDeletedRowRemoval}
              allowRowsSelect={false}
            />
          </div>
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
        <div className="row">
          <h2>Parcel Description</h2>
          <hr />
        </div>
        {addRemoveButtons()}
        <div
          id="parcel-descriptions-component-existing-table"
          data-testid="parcel-descriptions-component-existing-table"
          className="row py-3"
        >
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
            tableChangeHandler={handleEditTableChange}
            deleteHandler={() => {}}
            allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
          />
        </div>
        {addedParcelDescriptions()}
        {deletedParcelDescriptions()}
      </div>
    </div>
  );
};

export default ParcelDescriptions;
