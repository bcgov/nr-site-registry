import React from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
import Form from '../../../components/form/Form';
import Widget from '../../../components/widget/Widget';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { UserType } from '../../../helpers/requests/userType';
import { TableColumn } from '../../../components/table/TableColumn';
import { RequestStatus } from '../../../helpers/requests/status';
import { DropdownItem } from '../../../components/action/IActions';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';

interface INotationProps {
  index: number;
  notation: {
    [key: string]: any;
  };
  handleNotationFormRowFirstChild: (metaData: any) => any;
  viewMode: SiteDetailsMode;
  handleInputChange: (
    id: number,
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => void;
  userType: string;
  handleNotationFormRowExternal: (metaData?: any) => any;
  handleChangeNotationFormRow: (metaData?: any) => any;
  handleNotationFormRowsInternal: (metaData?: any) => any;
  handleTableChange: (id: any, event: any) => void;
  handleWidgetCheckBox: (event: any) => void;
  internalTableColumn: TableColumn[];
  externalTableColumn: TableColumn[];
  loading: RequestStatus;
  handleTableSort: (row: any, ascDir: any, id: any) => void;
  handleAddParticipant: (id: any) => void;
  isAnyParticipantSelected: (id: any) => boolean;
  handleRemoveParticipant: (
    currNotation: any,
    particIsDelete?: boolean,
  ) => void;
  srVisibilityConfig: DropdownItem[];
  handleItemClick: (value: string) => void;
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
}

const Notation: React.FC<INotationProps> = ({
  index,
  notation,
  handleNotationFormRowFirstChild,
  viewMode,
  handleInputChange,
  userType,
  handleNotationFormRowExternal,
  handleChangeNotationFormRow,
  handleNotationFormRowsInternal,
  handleTableChange,
  handleWidgetCheckBox,
  internalTableColumn,
  externalTableColumn,
  loading,
  handleTableSort,
  handleAddParticipant,
  isAnyParticipantSelected,
  handleRemoveParticipant,
  srVisibilityConfig,
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
    <PanelWithUpDown
      firstChild={
        <div className="w-100" key={index}>
          <Form
            formRows={handleNotationFormRowFirstChild(notation)}
            formData={notation}
            editMode={viewMode === SiteDetailsMode.EditMode}
            srMode={viewMode === SiteDetailsMode.SRMode}
            handleInputChange={(graphQLPropertyName, value) =>
              handleInputChange(notation.id, graphQLPropertyName, value)
            }
            aria-label="Sort Notation Form"
          />
          {userType === UserType.Internal && (
            <span className="sr-time-stamp">{notation.srTimeStamp}</span>
          )}
        </div>
      }
      secondChild={
        <div className="w-100">
          <Form
            formRows={
              userType === UserType.External
                ? handleNotationFormRowExternal(notation)
                : viewMode === SiteDetailsMode.EditMode
                  ? handleChangeNotationFormRow(notation)
                  : viewMode === SiteDetailsMode.SRMode
                    ? handleNotationFormRowExternal(notation)
                    : handleNotationFormRowsInternal(notation)
            }
            formData={notation}
            editMode={viewMode === SiteDetailsMode.EditMode}
            srMode={viewMode === SiteDetailsMode.SRMode}
            handleInputChange={(graphQLPropertyName, value) =>
              handleInputChange(notation.id, graphQLPropertyName, value)
            }
            aria-label="Sort Notation Form"
          />
          <Widget
            changeHandler={(event) => handleTableChange(notation.id, event)}
            handleCheckBoxChange={(event) => handleWidgetCheckBox(event)}
            title={'Notation Participants'}
            currentPage={1}
            tableColumns={
              userType === UserType.Internal
                ? internalTableColumn
                : externalTableColumn
            }
            tableData={notation.notationParticipant}
            tableIsLoading={
              notation.notationParticipant.length > 0
                ? loading
                : RequestStatus.idle
            }
            allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
            aria-label="Notation Widget"
            hideTable={false}
            hideTitle={false}
            editMode={
              viewMode === SiteDetailsMode.EditMode &&
              userType === UserType.Internal
            }
            srMode={
              viewMode === SiteDetailsMode.SRMode &&
              userType === UserType.Internal
            }
            primaryKeycolumnName="guid"
            sortHandler={(row, ascDir) => {
              handleTableSort(row, ascDir, notation.id);
            }}
          >
            {viewMode === SiteDetailsMode.EditMode &&
              userType === UserType.Internal && (
                <div className="d-flex gap-2 flex-wrap " key={notation.id}>
                  <button
                    id="add-participant-btn"
                    className=" d-flex align-items-center notation-btn"
                    type="button"
                    onClick={() => handleAddParticipant(notation.id)}
                    aria-label={'Add Participant'}
                  >
                    <UserPlus className="btn-user-icon" />
                    <span className="notation-btn-lbl">
                      {'Add Participant'}
                    </span>
                  </button>

                  <button
                    id="delete-participant-btn"
                    className={`d-flex align-items-center ${isAnyParticipantSelected(notation.id) ? `notation-btn` : `notation-btn-disable`}`}
                    disabled={!isAnyParticipantSelected(notation.id)}
                    type="button"
                    onClick={() => handleRemoveParticipant(notation)}
                    aria-label={'Remove Participant'}
                  >
                    <UserMinus
                      className={`${isAnyParticipantSelected(notation.id) ? `btn-user-icon` : `btn-user-icon-disabled`}`}
                    />
                    <span
                      className={`${isAnyParticipantSelected(notation.id) ? `notation-btn-lbl` : `notation-btn-lbl-disabled`}`}
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
                  items={srVisibilityConfig}
                  onItemClick={handleItemClick}
                  customCssToggleBtn={
                    false ? `notation-sr-btn` : `notation-sr-btn-disable`
                  }
                  disable={viewMode === SiteDetailsMode.SRMode}
                />
              )}
          </Widget>
          {userType === UserType.Internal && (
            <p className="sr-time-stamp">{notation.srTimeStamp}</p>
          )}
          {showApproveRejectSection && (
            <ApproveRejectButtons approveRejectHandler={approveRejectHandler} />
          )}
        </div>
      }
    />
  );
};

export default Notation;
