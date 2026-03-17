import React from 'react';
import { RequestStatus } from '../../../helpers/requests/status';
import Widget from '../../../components/widget/Widget';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { Minus, Plus } from '../../../components/common/icon';
import { Button } from '../../../components/button/Button';

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
      customLabelCss="custom-participant-widget-lbl"
      tableColumns={tableColumns}
      tableData={dataWithTextSearchApplied ?? []}
      allowRowsSelect={editModeEnabled}
      tableIsLoading={tableLoading}
      editMode={editModeEnabled}
      srMode={viewMode === SiteDetailsMode.SRMode}
      primaryKeycolumnName="guid"
      sortHandler={handleTableSort}
      hideWidgetCheckbox={true}
    >
      {editModeEnabled && (
        <div className="d-flex gap-2 flex-wrap ">
          <Button variant="secondary" onClick={handleAddLandUse}>
            <Plus />
            Add Land Use
          </Button>

          <Button
            variant="secondary"
            onClick={handleRemoveLandUse}
            disabled={selectedRowIds.size <= 0}
          >
            <Minus />
            Remove Land Use
          </Button>
        </div>
      )}
    </Widget>
  );
};

export default LandUseTable;
