import React from 'react';
import { RequestStatus } from '../../../helpers/requests/status';
import { TableColumn } from '../../../components/table/TableColumn';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import Widget from '../../../components/widget/Widget';
import { Button } from '../../../components/button/Button';
import { UserMinus, UserPlus } from '../../../components/common/icon';

interface IParcelDescriptionTable {
  requestStatus: RequestStatus;
  columns: TableColumn[];
  data: any;
  totalResults: number | undefined;
  handleSelectPage: (event: any) => void;
  handleChangeResultsPerPage: (event: any) => void;
  currentPage: number | undefined;
  resultsPerPage: number | undefined;
  handleTableSortChange: (column: TableColumn, descending: boolean) => void;
  showPageOptions: boolean;
  viewMode: SiteDetailsMode;
  tableChangeHandler: (event: any) => void;
  deleteHandler: (event: any) => void;
  allowRowsSelect: boolean;
  handleAddRow?: () => void;
  handleDeleteRows?: () => void;
  selectedRows?: any[];
  showAddRemoveButtons?: boolean;
  title?: string;
}

const ParcelDescriptionTable: React.FC<IParcelDescriptionTable> = ({
  requestStatus,
  columns,
  data,
  totalResults,
  handleSelectPage,
  handleChangeResultsPerPage,
  currentPage,
  resultsPerPage,
  handleTableSortChange,
  showPageOptions,
  viewMode,
  tableChangeHandler,
  deleteHandler,
  allowRowsSelect,
  handleAddRow,
  handleDeleteRows,
  selectedRows = [],
  showAddRemoveButtons,
  title,
}) => {
  return (
    <Widget
      showPageOptions={showPageOptions}
      title={title ?? 'Parcel Descriptions'}
      customLabelCss="custom-parcelDescriptions-widget-lbl"
      tableIsLoading={requestStatus}
      tableColumns={columns}
      tableData={data}
      totalResults={totalResults}
      selectPage={handleSelectPage}
      changeResultsPerPage={handleChangeResultsPerPage}
      currentPage={currentPage}
      resultsPerPage={resultsPerPage}
      allowRowsSelect={allowRowsSelect}
      changeHandler={tableChangeHandler}
      editMode={viewMode === SiteDetailsMode.EditMode}
      primaryKeycolumnName="id"
      sortHandler={handleTableSortChange}
      deleteHandler={deleteHandler}
      srMode={viewMode === SiteDetailsMode.SRMode}
      hideWidgetCheckbox={true}
    >
      {showAddRemoveButtons && viewMode === SiteDetailsMode.EditMode && (
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={handleAddRow}>
            <UserPlus />
            Add Parcel Description
          </Button>

          <Button
            variant="secondary"
            onClick={handleDeleteRows}
            disabled={selectedRows.length === 0}
          >
            <UserMinus />
            Remove Parcel Description
          </Button>
        </div>
      )}
    </Widget>
  );
};

export default ParcelDescriptionTable;
