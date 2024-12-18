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
import { Button } from '../../../components/button/Button';

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
    particRoleId: string;
  }[];
  handleRemoveParticipant: (particIsDelete?: boolean) => void;
  srVisibilityParcticConfig: DropdownItem[];
  handleItemClick: (value: string) => void;
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
  hideLabelForWidget?: boolean;
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
  hideLabelForWidget,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;
  hideLabelForWidget = hideLabelForWidget ?? false;

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
        hideTitle={hideLabelForWidget}
        editMode={
          viewMode === SiteDetailsMode.EditMode &&
          userType === UserType.Internal
        }
        srMode={false}
        primaryKeycolumnName="particRoleId"
        sortHandler={(row, ascDir) => {
          handleTableSort(row, ascDir);
        }}
      >
        {viewMode === SiteDetailsMode.EditMode &&
          userType === UserType.Internal && (
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={handleAddParticipant}>
                <UserPlus />
                Add Participant
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleRemoveParticipant()}
                disabled={selectedRows.length <= 0}
              >
                <UserMinus />
                Remove Participant
              </Button>
            </div>
          )}
        {viewMode === SiteDetailsMode.SRMode &&
          userType === UserType.Internal && (
            <Actions
              label="Set SR Visibility"
              items={srVisibilityParcticConfig}
              onItemClick={handleItemClick}
              disable={viewMode === SiteDetailsMode.SRMode}
              toggleButtonVariant="secondary"
            />
          )}
      </Widget>
    </div>
  );
};

export default ParticipantTable;
