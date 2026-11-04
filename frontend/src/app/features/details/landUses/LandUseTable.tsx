import React from 'react';
import { RequestStatus } from '../../../helpers/requests/status';
import Widget from '../../../components/widget/Widget';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import { Button } from '../../../components/button/Button';
import { SectionSortControl } from '../../../components/grid/SectionGrid';

interface ILandUseTable {
  approveRejectHandler?: (value: boolean) => void;
  onTableChange: (event: any) => void;
  tableColumns: any[] | undefined;
  dataWithTextSearchApplied: any[] | undefined;
  editModeEnabled: boolean;
  tableLoading: RequestStatus | undefined;
  viewMode: SiteDetailsMode;
  sortControl?: SectionSortControl;
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
  sortControl,
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
      hideWidgetCheckbox={true}
      sortControl={sortControl}
    >
      {editModeEnabled && (
        <div className="d-flex gap-2 flex-wrap ">
          <Button variant="secondary" onClick={handleAddLandUse}>
            <UserPlus />
            Add Land Use
          </Button>

          <Button
            variant="secondary"
            onClick={handleRemoveLandUse}
            disabled={selectedRowIds.size <= 0}
          >
            <UserMinus />
            Remove Land Use
          </Button>
        </div>
      )}
    </Widget>
  );
};

export default LandUseTable;
