import React from 'react';
import Table from '../../../components/table/Table';
import { RequestStatus } from '../../../helpers/requests/status';
import { TableColumn } from '../../../components/table/TableColumn';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';
import Widget from '../../../components/widget/Widget';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { Minus, Plus } from '../../../components/common/icon';

interface ILandUseTable {
  approveRejectHandler?: (value: boolean) => void;
  onTableChange: (event: any) => void;
  tableColumns: any[] | undefined;
  dataWithTextSearchApplied: any[] | undefined;
  editModeEnabled: boolean;
  tableLoading: RequestStatus | undefined;
  viewMode: SiteDetailsMode;
  handleTableSort: (row: any, ascDir: boolean) => void;
  selectedRowIds: any;
  handleRemoveLandUse: (event: any) => void;
  handleAddLandUse: (event: any) => void;
}

const LandUseTable: React.FC<ILandUseTable> = ({
  approveRejectHandler,
  onTableChange,
  tableColumns,
  dataWithTextSearchApplied,
  editModeEnabled,
  tableLoading,
  viewMode,
  handleTableSort,
  selectedRowIds,
  handleRemoveLandUse,
  handleAddLandUse,
}) => {
  return (
    <Widget
      currentPage={1}
      changeHandler={onTableChange}
      title={'Suspect Land Uses'}
      tableColumns={tableColumns}
      tableData={dataWithTextSearchApplied}
      allowRowsSelect={editModeEnabled}
      tableIsLoading={tableLoading}
      editMode={editModeEnabled}
      srMode={viewMode === SiteDetailsMode.SRMode}
      primaryKeycolumnName="guid"
      sortHandler={handleTableSort}
    >
      {editModeEnabled && (
        <div className="d-flex gap-2 flex-wrap ">
          <button
            className="d-flex align-items-center land-uses-btn"
            type="button"
            onClick={handleAddLandUse}
            aria-label={'Add Land Use'}
          >
            <Plus />
            <span className="land-uses-lbl">Add Land Use</span>
          </button>

          <button
            className={`d-flex align-items-center land-uses-btn ${selectedRowIds.size <= 0 && 'land-uses-btn-disabled'}`}
            disabled={selectedRowIds.size <= 0}
            type="button"
            onClick={handleRemoveLandUse}
            aria-label={'Remove Land Use'}
          >
            <Minus />
            <span>Remove Land Use</span>
          </button>
        </div>
      )}
    </Widget>
  );
};

export default LandUseTable;
