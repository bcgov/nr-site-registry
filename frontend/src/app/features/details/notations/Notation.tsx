import React from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
import Form from '../../../components/form/Form';
import Widget from '../../../components/widget/Widget';
import {
  UserMinus,
  UserPlus,
  Minus,
  Plus,
} from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { UserType } from '../../../helpers/requests/userType';
import { TableColumn } from '../../../components/table/TableColumn';
import { RequestStatus } from '../../../helpers/requests/status';
import { DropdownItem } from '../../../components/action/IActions';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';
import { Button } from '../../../components/button/Button';
import { formatDate, parseDate } from '../../../helpers/utility';
import { UserActionEnum } from '../../../common/userActionEnum';

interface INotationProps {
  index?: number;
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
  handleDeleteNotation: (notationId: string) => void;
  handleRestoreNotation: (notationId: string) => void;
  srVisibilityConfig: DropdownItem[];
  handleItemClick: (value: string) => void;
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
  isArchived?: boolean;
}

const Notation: React.FC<INotationProps> = ({
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
  handleDeleteNotation,
  handleRestoreNotation,
  srVisibilityConfig,
  handleItemClick,
  approveRejectHandler,
  showApproveRejectSection,
  isArchived = false,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler = approveRejectHandler ?? (() => {});

  const calculateLatestTimestamp = (
    event: any,
    eventParticsForEvent: any,
    dateFormatSR: (date: Date) => string,
  ) => {
    // Try to get a valid event timestamp
    const eventDate =
      parseDate(event?.whenUpdated) || parseDate(event?.whenCreated);

    // Default to now if no valid date found
    let latestTimestamp = eventDate || parseDate(new Date()) || new Date();

    eventParticsForEvent?.forEach((partic: any) => {
      const particDate =
        parseDate(partic?.whenUpdated) || parseDate(partic?.whenCreated);
      if (particDate && particDate > latestTimestamp) {
        latestTimestamp = particDate;
      }
    });

    return dateFormatSR(latestTimestamp);
  };

  const srTimeStamp =
    'Sent to SR on ' +
    calculateLatestTimestamp(
      notation,
      notation.notationParticipant,
      formatDate,
    );

  return (
    <PanelWithUpDown
      firstChild={
        <div className="w-100" key={notation?.id}>
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
          {userType === UserType.Internal && srTimeStamp && (
            <span className="sr-time-stamp">{srTimeStamp}</span>
          )}
        </div>
      }
      secondChild={
        <div className="w-100" key={notation?.id}>
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
            isRequired={true}
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
              notation.notationParticipant?.length > 0
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
            srMode={viewMode === SiteDetailsMode.SRMode}
            hideWidgetCheckbox={true}
            primaryKeycolumnName="eventParticId"
            sortHandler={(row, ascDir) => {
              handleTableSort(row, ascDir, notation.id);
            }}
          >
            {viewMode === SiteDetailsMode.EditMode &&
              userType === UserType.Internal && (
                <div className="d-flex gap-2 flex-wrap " key={notation.id}>
                  <Button
                    variant="secondary"
                    onClick={() => handleAddParticipant(notation.id)}
                  >
                    <UserPlus />
                    Add Participant
                  </Button>

                  <Button
                    variant="secondary"
                    disabled={!isAnyParticipantSelected(notation.id)}
                    onClick={() => handleRemoveParticipant(notation)}
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
                  items={srVisibilityConfig}
                  onItemClick={handleItemClick}
                  customCssToggleBtn={
                    false ? `notation-sr-btn` : `notation-sr-btn-disable`
                  }
                  disable={viewMode === SiteDetailsMode.SRMode}
                />
              )}
          </Widget>
          {viewMode === SiteDetailsMode.EditMode &&
            userType === UserType.Internal &&
            !isArchived && (
              <div>
                <Button onClick={() => handleDeleteNotation(notation.id)}>
                  <Minus />
                  Archive Notation
                </Button>
              </div>
            )}
          {viewMode === SiteDetailsMode.EditMode &&
            userType === UserType.Internal &&
            isArchived && (
              <div>
                <Button onClick={() => handleRestoreNotation(notation.id)}>
                  <Plus />
                  Restore Notation
                </Button>
              </div>
            )}
          {userType === UserType.Internal && srTimeStamp && (
            <p className="sr-time-stamp">{srTimeStamp}</p>
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
