import React from 'react';
import Widget from '../../../components/widget/Widget';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import { DropdownItem } from '../../../components/action/IActions';
import { Button } from '../../../components/button/Button';

interface IAssociateSiteComponent {
  handleTableChange: (event: any) => void;
  handleWidgetCheckBox: (event: any) => void;
  userType: UserType;
  viewMode: SiteDetailsMode;
  internalRow: any;
  associateColumnInternalSRandViewMode: any;
  associateColumnExternal: any;
  formData: any[];
  loading: RequestStatus;
  handleTableSort: (row: any, ascDir: any) => void;
  handleAddAssociate: (event: any) => void;
  selectedRows: any;
  handleRemoveAssociate: () => void;
  srVisibilityAssocConfig: DropdownItem[];
  handleItemClick: (value: string, index?: any) => void;
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
  hideLabelForWidget?: boolean;
}

const AssociateSiteComponent: React.FC<IAssociateSiteComponent> = ({
  handleTableChange,
  handleWidgetCheckBox,
  userType,
  viewMode,
  internalRow,
  associateColumnInternalSRandViewMode,
  associateColumnExternal,
  formData,
  loading,
  handleTableSort,
  handleAddAssociate,
  selectedRows,
  handleRemoveAssociate,
  srVisibilityAssocConfig,
  handleItemClick,
  approveRejectHandler,
  showApproveRejectSection,
  hideLabelForWidget,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler = approveRejectHandler ?? (() => {});
  hideLabelForWidget = hideLabelForWidget ?? false;
  return (
    <React.Fragment>
      <Widget
        currentPage={1}
        changeHandler={handleTableChange}
        handleCheckBoxChange={(event: any) => handleWidgetCheckBox(event)}
        title={'Associated Sites'}
        tableColumns={
          userType === UserType.Internal
            ? viewMode === SiteDetailsMode.EditMode
              ? internalRow
              : associateColumnInternalSRandViewMode
            : associateColumnExternal
        }
        tableData={formData ?? []}
        tableIsLoading={
          formData && formData.length < 0 ? loading : RequestStatus.idle
        }
        allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
        aria-label="Associated Sites Widget"
        customLabelCss="custom-associate-widget-lbl"
        hideTable={false}
        hideTitle={hideLabelForWidget}
        editMode={
          viewMode === SiteDetailsMode.EditMode &&
          userType === UserType.Internal
        }
        srMode={
          viewMode === SiteDetailsMode.SRMode && userType === UserType.Internal
        }
        primaryKeycolumnName="id"
        sortHandler={(row: any, ascDir: any) => {
          handleTableSort(row, ascDir);
        }}
      >
        {viewMode === SiteDetailsMode.EditMode &&
          userType === UserType.Internal && (
            <div className="d-flex gap-2 flex-wrap ">
              <Button variant="secondary" onClick={handleAddAssociate}>
                <UserPlus />
                Add Associated Site
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleRemoveAssociate()}
                disabled={selectedRows.length <= 0}
              >
                <UserMinus />
                Remove Associated Site
              </Button>
            </div>
          )}
        {viewMode === SiteDetailsMode.SRMode &&
          userType === UserType.Internal && (
            <Actions
              label="Set SR Visibility"
              items={srVisibilityAssocConfig}
              onItemClick={handleItemClick}
              disable={viewMode !== SiteDetailsMode.SRMode}
              toggleButtonVariant="secondary"
            />
          )}
      </Widget>
    </React.Fragment>
  );
};

export default AssociateSiteComponent;
