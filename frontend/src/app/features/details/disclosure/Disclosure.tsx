import { useEffect, useState } from 'react';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import {
  getFieldLabel,
  ChangeContext,
} from '../../../helpers/fieldLabelMapper';
import './Disclosure.css';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import {
  getUser,
  isUserOfType,
  serializeDate,
  sortArray,
  UserRoleType,
} from '../../../helpers/utility';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import {
  fetchSiteDisclosure,
  siteDisclosure,
  updateSiteDisclosure,
} from './DisclosureSlice';
import { useParams } from 'react-router-dom';
import { IComponentProps } from '../navigation/NavigationPillsConfig';
import DisclosureComponent from './DisclosureComponent';
import {
  getSiteDisclosure,
  saveRequestStatus,
  setupSiteDisclosureDataForSaving,
} from '../SaveSiteDetailsSlice';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { UserActionEnum } from '../../../common/userActionEnum';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { v4 } from 'uuid';
import { schedule2ReferenceCdDrpdown } from '../dropdowns/DropdownSlice';
import { siteDisclosureConfig } from './DisclosureConfig';
import { Button } from '../../../components/button/Button';
import { Plus } from '../../../components/common/icon';

const Disclosure: React.FC<IComponentProps> = ({ showPending = false }) => {
  const schedule2Ref = useSelector(schedule2ReferenceCdDrpdown);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const {
    disclosureStatementConfig,
    disclosureStatementConfigEditMode,
    disclosureScheduleInternalConfig,
    disclosureScheduleExternalConfig,
    disclosureCommentsConfig,
    srVisibilityConfig,
  } = siteDisclosureConfig(schedule2Ref?.data || [], viewMode);
  const { siteDisclosure: disclosureData, status } = useSelector(siteDisclosure);
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const trackSiteDisclosure = useSelector(getSiteDisclosure);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const loggedInUser = getUser();
  const { id: siteId } = useParams();
  const [formData, setFormData] = useState<
  { [key: string]: any | [Date, Date] }[]
  >(disclosureData || []);
  const [selectedRows, setSelectedRows] = useState<
    { disclosureId: any; scheduleId: any }[]
  >([]);
  const [userType, setUserType] = useState<UserType>(UserType.External);

  const [isDelete, setIsDelete] = useState(false);
  const [currentDisclosure, setCurrenDisclosure] = useState({});

  useEffect(() => {
    if (
      isUserOfType(UserRoleType.CLIENT) ||
      isUserOfType(UserRoleType.PUBLIC)
    ) {
      setUserType(UserType.External);
    } else if (isUserOfType(UserRoleType.INTERNAL)) {
      setUserType(UserType.Internal);
    }
  }, [loggedInUser]);

  // Handle view mode changes
  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    if (status === RequestStatus.success && disclosureData) {
      const updatedFormData = disclosureData?.map((disclosure: any) => {
        return {
          ...disclosure,
          siteProfileSchedule2Refs:
            disclosure?.siteProfileSchedule2Refs?.map((item: any) => {
              return {
                ...item,
                description: schedule2Ref?.data?.find(
                  (ref: any) => ref.key === item.schedule2ReferenceCode,
                )?.metaData,
              };
            }) ?? [],
        };
      });

      setFormData(updatedFormData);
    }

  }, [disclosureData, status, schedule2Ref]);

  useEffect(() => {
    if (
      resetDetails ||
      saveSiteDetailsRequestStatus === RequestStatus.success
    ) {
      dispatch(
        fetchSiteDisclosure({ siteId: siteId ?? '', showPending: showPending }),
      );
    }
  }, [resetDetails, saveSiteDetailsRequestStatus, dispatch, siteId, showPending]);

  const handleInputChange = (
    id: number,
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    let updatedDisclosure: any = null;
    updatedDisclosure = (disclosures: any) => {
      return disclosures.map((disclosure: any) => {
        if (disclosure.id === id) {
            const isChecked = viewMode === SiteDetailsMode.SRMode && graphQLPropertyName === 'srCheckbox';
            return {
              ...disclosure,
              [graphQLPropertyName]: value,
              apiAction: disclosure?.apiAction ?? UserActionEnum.updated,
              srAction: isChecked ? value === 'checked' ? SRApprovalStatusEnum.Public : SRApprovalStatusEnum.Private : SRApprovalStatusEnum.Pending
            }
          }
          return disclosure;
        })
      }

    const updatedFormData = updatedDisclosure(formData);
    const updatedTrackDisclosure = updatedDisclosure(
      trackSiteDisclosure ?? formData,
    );

    setFormData(updatedFormData);
    dispatch(updateSiteDisclosure(updatedFormData?.map((item: any) => serializeDate(item))));
    dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

    if (
      viewMode === SiteDetailsMode.SRMode &&
      graphQLPropertyName === 'srCheckbox'
    ) {
      if (updatedFormData?.apiAction !== UserActionEnum.added) {
        const tracker = new ChangeTracker(
          IChangeType.Modified,
          getFieldLabel('srValue'),
          ChangeContext.DISCLOSURE,
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      }
    } else {
      if (updatedFormData?.apiAction !== UserActionEnum.added) {
        const tracker = new ChangeTracker(
          IChangeType.Modified,
          getFieldLabel(graphQLPropertyName),
          ChangeContext.DISCLOSURE,
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      } else if (updatedFormData?.apiAction === UserActionEnum.added) {
        const tracker = new ChangeTracker(
          IChangeType.Added,
          getFieldLabel(graphQLPropertyName),
          ChangeContext.DISCLOSURE,
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      }
    }
  };

  /// not working yet as the actual source of table data is unknown.
  const handleTableChange = (disclosureId: any, event: any) => {
    if (
      event.property.includes('select_all') ||
      event.property.includes('select_row')
    ) {
      let rows = event.property === 'select_row' ? [event.row] : event.value;
      let isTrue =
        event.property === 'select_row' ? event.value : event.selected;
      // Update selectedRows state based on checkbox selection
      if (isTrue) {
        setSelectedRows((prevSelectedRows) => [
          ...prevSelectedRows,
          ...rows.map((row: any) => ({
            disclosureId,
            scheduleId: row.id,
          })),
        ]);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter(
            (selectedRow) =>
              !rows.some(
                (row: any) =>
                  selectedRow.disclosureId === disclosureId &&
                  selectedRow.scheduleId === row.id,
              ),
          ),
        );
      }
    } else {
      // this need to be tracked and also change once get actual source of data.
      const updateReferences = (disclosures: any) => {
        return disclosures.map((disclosure: any) => {
          if (disclosure.id === disclosureId) {

          const updatedDisclosureSchedule =
            disclosure?.siteProfileSchedule2Refs?.map((schedule: any) => {
              if (schedule.id === event.row.id) {
                const isSRApproved =
                  viewMode === SiteDetailsMode.SRMode &&
                  event.property === 'srValue';
                return {
                  ...schedule,
                  [event.property]: event.value,
                  description: schedule2Ref?.data?.find(
                    (ref: any) => ref.key === event.value,
                  )?.metaData,
                  apiAction: schedule?.apiAction ?? UserActionEnum.updated,
                  srAction: isSRApproved
                    ? event.value
                      ? SRApprovalStatusEnum.Public
                      : SRApprovalStatusEnum.Private
                    : SRApprovalStatusEnum.Pending,
                };
              }
              return schedule;
            });

            // Return the updated disclosure object with the modified disclosureSchedule array
            return {
              ...disclosure,
              siteProfileSchedule2Refs: updatedDisclosureSchedule,
            };
          }
          return disclosure;
        });
      };

      // Update both formData and trackParticipant
      const updatedFormData = updateReferences(formData);
      setFormData(updatedFormData);
      dispatch(updateSiteDisclosure(updatedFormData));

      const updatedTrackDisclosure = updateReferences(
        trackSiteDisclosure ?? formData,
      );
      dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

      if (event.row?.apiAction !== UserActionEnum.added) {
        const tracker = new ChangeTracker(
          IChangeType.Modified,
          getFieldLabel(event.property),
          ChangeContext.DISCLOSURE_SCHEDULE,
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      }
    }
  };

  const handleTableSort = (row: any, ascDir: any, disclosureId: any) => {
    let property = row['graphQLPropertyName'];
    setFormData((prevData) => {
      return prevData.map((tempDisclosure) => {
        if (disclosureId === tempDisclosure.id) {
          // Filter out selected rows from disclosureParticipant array
          let updatedSchedule2Refs = [
            ...tempDisclosure.siteProfileSchedule2Refs,
          ];
          // Call the common sort function to sort the updatedParticipant array
          updatedSchedule2Refs = sortArray(
            updatedSchedule2Refs,
            property,
            ascDir,
          );

          return {
            ...tempDisclosure,
            siteProfileSchedule2Refs: updatedSchedule2Refs,
          };
        }
        return tempDisclosure;
      });
    });
  };

  // this need to be tracked and also change once get actual source of data.
  const handleAddDisclosureSchedule = (disclosureId: any) => {
    const newDisclosureSchedule = {
      id: v4(),
      schedule2ReferenceCode: '',
      description: '',
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
    };

    const updateDisclosure = (disclosures: any) => {
      return disclosures.map((disclosure: any) => {
        if (disclosure.id === disclosureId) {
          return {
            ...disclosure,
            siteProfileSchedule2Refs: [
              newDisclosureSchedule,
              ...(disclosure.siteProfileSchedule2Refs ?? []),
            ],
          };
        }
        return disclosure;
      });
    };

    const updatedFormData = updateDisclosure(formData);

    const updatedTrackDisclosure = updateDisclosure(
      trackSiteDisclosure ?? formData,
    );

    setFormData(updatedFormData);
    dispatch(updateSiteDisclosure(updatedFormData));

    dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

    const tracker = new ChangeTracker(
      IChangeType.Added,
      getFieldLabel('schedule2ReferenceCode'),
      ChangeContext.DISCLOSURE_SCHEDULE,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  // this need to be tracked and also change once get actual source of data.
  const handleRemoveDisclosureSchedule = (
    currDisclosure: any,
    referenceIsDeleted: boolean = false,
  ) => {
    if (referenceIsDeleted) {
      const updateReferences = (disclosures: any) => {
        return disclosures.map((disclosure: any) => {
          if(disclosure.id === currDisclosure.id) {
            const updatedDisclosureSchedule =
              disclosure?.siteProfileSchedule2Refs?.map((schedule: any) => {
                if (
                  selectedRows.some(
                    (row: any) =>
                      row.disclosureId === disclosure.id &&
                      row.scheduleId === schedule?.id,
                  )
                ) {
                  // Modify the schedule as needed (marking as deleted and updating approval status)
                  const apiAction =
                    schedule?.apiAction === UserActionEnum.added
                      ? UserActionEnum.default
                      : UserActionEnum.deleted;
                  return {
                    ...schedule,
                    apiAction: apiAction,
                    srAction: SRApprovalStatusEnum.Pending,
                  };
                }
                return schedule; // Return the unchanged schedule if conditions aren't met
              });

            // Return the updated disclosure object with the modified disclosureSchedule array
            return {
              ...disclosure,
              siteProfileSchedule2Refs: updatedDisclosureSchedule,
            };
          }
          return disclosure;
        });
      };
      // Update both formData and trackParticipant
      const updatedFormData = updateReferences(formData);
      const updatedTrackDisclosure = updateReferences(
        trackSiteDisclosure ?? formData,
      );

      // Filter out participants based on selectedRows for formData
      const filteredDisclosure = updatedFormData?.map((disclosure: any) => {
          return {
            ...disclosure,
            siteProfileSchedule2Refs: disclosure?.siteProfileSchedule2Refs?.filter((schedule: any) =>
              !selectedRows.some(
                (row: any) =>
                  row.disclosureId === disclosure.id &&
                  row.scheduleId === schedule?.id,
              ),
            ),
          };        
      });
  
      setFormData(filteredDisclosure);
      dispatch(updateSiteDisclosure(filteredDisclosure));

      dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

      // Clear selectedRows state
      const updateSelectedRows = selectedRows.filter(
        (row) => row.disclosureId !== currDisclosure.id,
      );
      setSelectedRows(updateSelectedRows);
      setCurrenDisclosure({});
      setIsDelete(false);
      const tracker = new ChangeTracker(
        IChangeType.Deleted,
        getFieldLabel('schedule2ReferenceCode'),
        ChangeContext.DISCLOSURE_SCHEDULE,
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    } else {
      setCurrenDisclosure(currDisclosure);
      setIsDelete(true);
    }
  };

  const isAnyDisclosureScheduleSelected = (disclosureId: any) => {
    return selectedRows.some((row) => row.disclosureId === disclosureId);
  };

  const handleWidgetCheckBox = (event: any) => {
    // alert(event);
  };

  const handleItemClick = (value: string) => {
    switch (value) {
      case SRVisibility.ShowSR:
        alert('show');
        break;
      case SRVisibility.HideSR:
        alert('hide');
        break;
      default:
        break;
    }
  };

  const handleOnAddDisclosure = () => {
    const newDisclosure = {
      id: v4(),
      siteId: siteId,
      dateCompleted: null,
      rwmDateDecision: null,
      localAuthDateRecd: null,
      siteRegDateEntered: null,
      siteRegDateRecd: null,
      govDocumentsComment: '',
      siteDisclosureComment: '',
      plannedActivityComment: '',
      siteProfileSchedule2Refs: [],
      srAction: SRApprovalStatusEnum.Pending,
      apiAction: UserActionEnum.added,
    };
    setFormData([newDisclosure, ...formData]);
  };

  return (
    <div>
        {!showPending && (
        <div
          className="row pe-2"
          id="disclosures-component"
          data-testid="disclosures-component"
        >
          {userType === UserType.Internal &&
            (viewMode === SiteDetailsMode.EditMode ||
              viewMode === SiteDetailsMode.SRMode) && (
              <div className="col-lg-6 col-md-12 py-4">
                <Button
                  disabled={viewMode === SiteDetailsMode.SRMode}
                  onClick={handleOnAddDisclosure}
                >
                  <Plus />
                  Add Disclosure
                </Button>
              </div>
            )}
        </div>
      )}
      {
        formData && 
          formData?.map((disclosure: any) => (
            <div key={`active-${disclosure.id}`}>
              <DisclosureComponent
                viewMode={viewMode}
                userType={userType}
                handleWidgetCheckBox={handleWidgetCheckBox}
                formData={disclosure}
                disclosureStatementConfig={
                  viewMode === SiteDetailsMode.EditMode
                    ? disclosureStatementConfigEditMode
                    : disclosureStatementConfig
                }
                handleInputChange={handleInputChange}
                handleTableChange={handleTableChange}
                disclosureScheduleInternalConfig={disclosureScheduleInternalConfig}
                disclosureScheduleExternalConfig={disclosureScheduleExternalConfig}
                loading={RequestStatus.loading}
                handleTableSort={handleTableSort}
                handleAddDisclosureSchedule={handleAddDisclosureSchedule}
                isAnyDisclosureScheduleSelected={isAnyDisclosureScheduleSelected}
                handleRemoveDisclosureSchedule={handleRemoveDisclosureSchedule}
                srVisibilityConfig={srVisibilityConfig}
                handleItemClick={handleItemClick}
                disclosureCommentsConfig={disclosureCommentsConfig}
              />
            </div>
          ))
      }
      {isDelete && (
        <ModalDialog
          key={v4()}
          label={`Are you sure you want to delete schedule 2 reference?`}
          closeHandler={(response) => {
            if (response) {
              if (isDelete) {
                handleRemoveDisclosureSchedule(currentDisclosure, response);
              }
            }
            setCurrenDisclosure({});
            setIsDelete(false);
          }}
        />
      )}
    </div>
  );
};

export default Disclosure;
