import React from 'react';
import Widget from '../../../components/widget/Widget';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { UserType } from '../../../helpers/requests/userType';
import { TableColumn } from '../../../components/table/TableColumn';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import { DropdownItem } from '../../../components/action/IActions';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';

interface IParticipantTableProps {
  handleTableChange: (event: any) => void;
  handleWidgetCheckBox: (event: any) => void;
  internalRow: TableColumn[];
  externalRow: TableColumn[];
  userType: UserType;
  formData: {
    [key: string]: any;
  }[];
  status: RequestStatus;
  viewMode: SiteDetailsMode;
  handleTableSort: (row: any, ascDir: any) => void;
  handleAddParticipant: () => void;
  selectedRows: {
    participantId: any;
    psnorgId: any;
    prCode: string;
    partiRoleId: string;
  }[];
  handleRemoveParticipant: (particIsDelete?: boolean) => void;
  srVisibilityParcticConfig: DropdownItem[];
  handleItemClick: (value: string) => void;
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
}

const ParticipantTable: React.FC<IParticipantTableProps> = ({
  handleTableChange,
  handleWidgetCheckBox,
  internalRow,
  externalRow,
  userType,
  formData,
  status,
  viewMode,
  handleTableSort,
  handleAddParticipant,
  selectedRows,
  handleRemoveParticipant,
  srVisibilityParcticConfig,
  handleItemClick,
  showApproveRejectSection,
  approveRejectHandler,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler =
    approveRejectHandler ??
    ((value) => {
      console.log('Approve/Reject Handler not provided');
    });

  return (
    <div>
      <Widget
        currentPage={1}
        changeHandler={handleTableChange}
        handleCheckBoxChange={(event) => handleWidgetCheckBox(event)}
        title={'Site Participants'}
        tableColumns={
          userType === UserType.Internal ? internalRow : externalRow
        }
        tableData={formData}
        tableIsLoading={status ?? RequestStatus.idle}
        allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
        aria-label="Site Participant Widget"
        customLabelCss="custom-participant-widget-lbl"
        hideTable={false}
        hideTitle={true}
        editMode={
          viewMode === SiteDetailsMode.EditMode &&
          userType === UserType.Internal
        }
        srMode={
          viewMode === SiteDetailsMode.SRMode && userType === UserType.Internal
        }
        primaryKeycolumnName="partiRoleId"
        sortHandler={(row, ascDir) => {
          handleTableSort(row, ascDir);
        }}
      >
        {viewMode === SiteDetailsMode.EditMode &&
          userType === UserType.Internal && (
            <div className="d-flex gap-2 flex-wrap ">
              <button
                id="add-participant-btn"
                className=" d-flex align-items-center participant-btn"
                type="button"
                onClick={handleAddParticipant}
                aria-label={'Add Participant'}
              >
                <UserPlus className="btn-user-icon" />
                <span className="participant-btn-lbl">{'Add Participant'}</span>
              </button>

              <button
                id="delete-participant-btn"
                className={`d-flex align-items-center ${selectedRows.length > 0 ? `participant-btn` : `participant-btn-disable`}`}
                disabled={selectedRows.length <= 0}
                type="button"
                onClick={() => {
                  handleRemoveParticipant();
                }}
                aria-label={'Remove Participant'}
              >
                <UserMinus
                  className={`${selectedRows.length > 0 ? `btn-user-icon` : `btn-user-icon-disabled`}`}
                />
                <span
                  className={`${selectedRows.length > 0 ? `participant-btn-lbl` : `participant-btn-lbl-disabled`}`}
                >
                  {'Remove Participant'}
                </span>
              </button>
            </div>
          )}
        {viewMode === SiteDetailsMode.SRMode &&
          userType === UserType.Internal && (
            <Actions
              label="Set SR Visibility"
              items={srVisibilityParcticConfig}
              onItemClick={handleItemClick}
              customCssToggleBtn={
                false ? `participant-sr-btn` : `participant-sr-btn-disable`
              }
              disable={viewMode === SiteDetailsMode.SRMode}
            />
          )}
      </Widget>
    </div>
  );
};

export default ParticipantTable;
