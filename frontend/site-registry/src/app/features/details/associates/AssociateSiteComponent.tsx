import React from 'react';
import Widget from '../../../components/widget/Widget';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import { DropdownItem } from '../../../components/action/IActions';

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
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler =
    approveRejectHandler ??
    ((value) => {
      console.log('Approve/Reject Handler not provided');
    });

  return (
    <React.Fragment>
      <Widget
        currentPage={1}
        changeHandler={handleTableChange}
        handleCheckBoxChange={(event: any) => handleWidgetCheckBox(event)}
        title={'Associated Sites'}
        tableColumns={
          userType === UserType.Internal
            ? viewMode == SiteDetailsMode.EditMode
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
        hideTitle={true}
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
              <button
                id="add-associate-btn"
                className=" d-flex align-items-center associate-btn"
                type="button"
                onClick={handleAddAssociate}
                aria-label={'Add Associated Site'}
              >
                <UserPlus className="btn-user-icon" />
                <span className="associate-btn-lbl">
                  {'Add Associated Site'}
                </span>
              </button>

              <button
                id="delete-associate-btn"
                className={`d-flex align-items-center ${selectedRows.length > 0 ? `associate-btn` : `associate-btn-disable`}`}
                disabled={selectedRows.length <= 0}
                type="button"
                onClick={() => handleRemoveAssociate()}
                aria-label={'Remove Associated Site'}
              >
                <UserMinus
                  className={`${selectedRows.length > 0 ? `btn-user-icon` : `btn-user-icon-disabled`}`}
                />
                <span
                  className={`${selectedRows.length > 0 ? `associate-btn-lbl` : `associate-btn-lbl-disabled`}`}
                >
                  {'Remove Associated Site'}
                </span>
              </button>
            </div>
          )}
        {viewMode === SiteDetailsMode.SRMode &&
          userType === UserType.Internal && (
            <Actions
              label="Set SR Visibility"
              items={srVisibilityAssocConfig}
              onItemClick={handleItemClick}
              customCssToggleBtn={
                false ? `associate-sr-btn` : `associate-sr-btn-disable`
              }
              disable={viewMode === SiteDetailsMode.SRMode}
            />
          )}
      </Widget>
      {/* {showApproveRejectSection &&   <ApproveRejectButtons
        approveRejectHandler={approveRejectHandler}
        />} */}
    </React.Fragment>
  );
};

export default AssociateSiteComponent;
