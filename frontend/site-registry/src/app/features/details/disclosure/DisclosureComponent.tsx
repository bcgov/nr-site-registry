import React from 'react';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import Widget from '../../../components/widget/Widget';
import { UserType } from '../../../helpers/requests/userType';
import Form from '../../../components/form/Form';
import { IFormField } from '../../../components/input-controls/IFormField';
import { RequestStatus } from '../../../helpers/requests/status';
import { Minus, Plus } from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import { DropdownItem } from '../../../components/action/IActions';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';

interface IDisclosureComponent {
  viewMode: SiteDetailsMode;
  userType: UserType;
  handleWidgetCheckBox: (event: any) => void;
  formData: {
    [key: string]: any;
  };
  disclosureStatementConfig: IFormField[][];
  handleInputChange: (id: any, name: any, value: string | [Date, Date]) => void;
  handleTableChange: (id: any, event: any) => void;
  disclosureScheduleInternalConfig: any;
  disclosureScheduleExternalConfig: any;
  loading: RequestStatus;
  handleTableSort: (row: any, direction: any, id: any) => any;
  handleAddDisclosureSchedule: (event: any) => void;
  isAnyDisclosureScheduleSelected: (event: any) => boolean;
  handleRemoveDisclosureSchedule: (event: any) => void;
  srVisibilityConfig: DropdownItem[];
  handleItemClick: (event: any) => void;
  disclosureCommentsConfig: IFormField[][];
  approveRejectHandler?: (value: boolean) => void;
  showApproveRejectSection?: boolean;
  srTimeStamp?: string;
}

const DisclosureComponent: React.FC<IDisclosureComponent> = ({
  viewMode,
  userType,
  handleWidgetCheckBox,
  formData,
  disclosureStatementConfig,
  handleInputChange,
  handleTableChange,
  disclosureScheduleInternalConfig,
  disclosureScheduleExternalConfig,
  loading,
  handleTableSort,
  handleAddDisclosureSchedule,
  isAnyDisclosureScheduleSelected,
  handleRemoveDisclosureSchedule,
  srVisibilityConfig,
  handleItemClick,
  disclosureCommentsConfig,
  approveRejectHandler,
  showApproveRejectSection,
  srTimeStamp,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler =
    approveRejectHandler ??
    ((value) => {
      console.log('Approve/Reject Handler not provided');
    });

  return (
    <div
      className="row"
      id="disclosure-component"
      data-testid="disclosure-component"
    >
      <div
        className={`mb-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-5' : 'px-3'}`}
      >
        <Widget
          title={'Site Disclosure Statement (Sec. III and IV)'}
          hideTable={true}
          hideTitle={false}
          editMode={
            viewMode === SiteDetailsMode.EditMode &&
            userType === UserType.Internal
          }
          srMode={
            viewMode === SiteDetailsMode.SRMode &&
            userType === UserType.Internal
          }
          handleCheckBoxChange={(event) => handleWidgetCheckBox(event)}
          customLabelCss="custom-disclosure-widget-lbl"
          aria-label="Disclosure Widget"
        >
          <div
            className={`mt-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-4' : ''}`}
          >
            {formData && (
              <Form
                formRows={disclosureStatementConfig}
                formData={formData}
                editMode={viewMode === SiteDetailsMode.EditMode}
                srMode={viewMode === SiteDetailsMode.SRMode}
                handleInputChange={(graphQLPropertyName, value) =>
                  handleInputChange(
                    formData.disclosureId,
                    graphQLPropertyName,
                    value,
                  )
                }
                aria-label="Site Disclosure Statement"
              />
            )}
          </div>
        </Widget>
      </div>
      {/*  Not working yet as the actual source of table data is unknown.*/}
      <div
        className={`mb-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-5' : 'px-3'}`}
      >
        <div
          className={`mt-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-4' : 'p-0'}`}
        >
          {formData && (
            <Widget
              changeHandler={(event) =>
                handleTableChange(formData.disclosureId, event)
              }
              handleCheckBoxChange={(event) => handleWidgetCheckBox(event)}
              title={
                'III Commercial and Industrial Purposes or Activities on Site'
              }
              tableColumns={
                userType === UserType.Internal
                  ? disclosureScheduleInternalConfig
                  : disclosureScheduleExternalConfig
              }
              tableData={formData.disclosureSchedule ?? []}
              tableIsLoading={
                formData.disclosureSchedule &&
                formData.disclosureSchedule.length > 0
                  ? loading
                  : RequestStatus.idle
              }
              allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
              aria-label="Site Disclosure Schedule"
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
              primaryKeycolumnName="scheduleId"
              sortHandler={(row, ascDir) => {
                handleTableSort(row, ascDir, formData.disclosureId);
              }}
            >
              {viewMode === SiteDetailsMode.EditMode &&
                userType === UserType.Internal && (
                  <div className="d-flex gap-2" key={formData.disclosureId}>
                    <button
                      id="add-schedule-btn"
                      className=" d-flex align-items-center disclosure-add-btn"
                      type="button"
                      onClick={() =>
                        handleAddDisclosureSchedule(formData.disclosureId)
                      }
                      aria-label={'Add'}
                    >
                      <Plus className="btn-user-icon" />
                      <span className="disclosure-btn-lbl">{'Add'}</span>
                    </button>

                    <button
                      id="delete-schedule-btn"
                      className={`d-flex align-items-center ${isAnyDisclosureScheduleSelected(formData.disclosureId) ? `disclosure-add-btn` : `disclosure-btn-disable`}`}
                      disabled={
                        !isAnyDisclosureScheduleSelected(formData.disclosureId)
                      }
                      type="button"
                      onClick={() =>
                        handleRemoveDisclosureSchedule(formData.disclosureId)
                      }
                      aria-label={'Remove Disclosure Schedule'}
                    >
                      <Minus
                        className={`${isAnyDisclosureScheduleSelected(formData.disclosureId) ? `btn-user-icon` : `btn-user-icon-disabled`}`}
                      />
                      <span
                        className={`${isAnyDisclosureScheduleSelected(formData.disclosureId) ? `disclosure-btn-lbl` : `disclosure-btn-lbl-disabled`}`}
                      >
                        {'Remove'}
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
                      true ? `disclosure-sr-btn` : `disclosure-sr-btn-disable`
                    }
                    disable={viewMode !== SiteDetailsMode.SRMode}
                  />
                )}
            </Widget>
          )}
        </div>
      </div>
      <div
        className={`mb-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-5' : 'px-3'}`}
      >
        <div
          className={`mt-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-4' : 'p-0'}`}
        >
          {formData && (
            <Widget
              title={'IV Additional Comments and Explanations'}
              hideTable={true}
              hideTitle={false}
              editMode={
                viewMode === SiteDetailsMode.EditMode &&
                userType === UserType.Internal
              }
              srMode={
                viewMode === SiteDetailsMode.SRMode &&
                userType === UserType.Internal
              }
              handleCheckBoxChange={(event) => handleWidgetCheckBox(event)}
              aria-label="Disclosure Widget"
            >
              <div className="mt-3">
                {formData && (
                  <Form
                    formRows={disclosureCommentsConfig}
                    formData={formData}
                    editMode={viewMode === SiteDetailsMode.EditMode}
                    srMode={viewMode === SiteDetailsMode.SRMode}
                    handleInputChange={(graphQLPropertyName, value) =>
                      handleInputChange(
                        formData.disclosureId,
                        graphQLPropertyName,
                        value,
                      )
                    }
                    aria-label="Site Disclosure Statement"
                  />
                )}
              </div>
            </Widget>
          )}
        </div>
      </div>
      {userType === UserType.Internal && (
        <p className="sr-time-stamp">
          {formData.srTimeStamp ?? srTimeStamp + ' Hard Code Value'}
        </p>
      )}
      {showApproveRejectSection && (
        <ApproveRejectButtons approveRejectHandler={approveRejectHandler} />
      )}
    </div>
  );
};

export default DisclosureComponent;
