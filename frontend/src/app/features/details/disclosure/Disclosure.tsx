import { useCallback, useEffect, useState } from 'react';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import {
  disclosureCommentsConfig,
  disclosureScheduleExternalConfig,
  disclosureScheduleInternalConfig,
  disclosureStatementConfig,
  srVisibilityConfig,
} from './DisclosureConfig';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import './Disclosure.css';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import {
  flattenFormRows,
  getAxiosInstance,
  getUser,
  resultCache,
  serializeDate,
  updateFields,
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
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphQLPeopleOrgsCd } from '../../site/graphql/Dropdowns';
import { print } from 'graphql';
import {
  getSiteDisclosure,
  saveRequestStatus,
  setupSiteDisclosureDataForSaving,
} from '../SaveSiteDetailsSlice';
import infoIcon from '../../../images/info-icon.png';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { UserActionEnum } from '../../../common/userActionEnum';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { v4 } from 'uuid';

const Disclosure: React.FC<IComponentProps> = ({ showPending = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const trackSiteDisclosure = useSelector(getSiteDisclosure);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const { siteDisclosure: disclosureData, status } =
    useSelector(siteDisclosure);
  const loggedInUser = getUser();
  const { id: siteId } = useParams();

  const [formData, setFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>(disclosureData);
  const [selectedRows, setSelectedRows] = useState<
    { disclosureId: any; scheduleId: any }[]
  >([]);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);

  // NEED TO ADD COLUMN FOR THIS IN DATABASE
  const [srTimeStamp, setSRTimeStamp] = useState(
    'Sent to SR on June 2nd, 2013 NOT FROM DB ',
  );

  const [searchInternalContact, setSearchInternalContact] = useState('');
  const [options, setOptions] = useState<{ key: any; value: any }[]>([]);
  const [internalRow, setInternalRow] = useState(disclosureStatementConfig);
  const [isDelete, setIsDelete] = useState(false);
  const [currentDisclosure, setCurrenDisclosure] = useState({});

  // Function to fetch internal contact
  // Commenting the below method because I am not sure which dropdown type
  // we are going to use if it will be dropdown with search then uncomment the code otherwise delete it.

  //  const fetchInternalContact = useCallback(async (searchParam: string) => {
  //   if (searchParam.trim()) {
  //     try {
  //       // Check cache first
  //       if (resultCache[searchParam]) {
  //         return resultCache[searchParam];
  //       }

  //       const response = await getAxiosInstance().post(GRAPHQL, {
  //         query: print(graphQLPeopleOrgsCd()),
  //         variables: { searchParam,  entityType:'EMP' },
  //       });

  //       // Store result in cache if successful
  //       if (response?.data?.data?.getPeopleOrgsCd?.success) {
  //         resultCache[searchParam] = response.data.data.getPeopleOrgsCd.data;
  //         return response.data.data.getPeopleOrgsCd;
  //       }
  //     } catch (error) {
  //       console.error('Error fetching notation participant:', error);
  //       return [];
  //     }
  //   }
  //   return [];
  // }, []);

  // Handle search action
  // Commenting the below method because I am not sure which dropdown type
  // we are going to use if it will be dropdown with search then uncomment the code otherwise delete it.

  // const handleSearch = useCallback(
  //   (value: any) => {
  //     setSearchInternalContact(value.trim());
  //     setInternalRow((prev) =>
  //       updateFields(prev, {
  //         indexToUpdate: prev.findIndex((row) =>
  //           row.some((field) => field.graphQLPropertyName === 'psnorgId'),
  //         ),
  //         updates: {
  //           isLoading: RequestStatus.loading,
  //           filteredOptions: [],
  //           handleSearch,
  //           customInfoMessage: <></>,
  //         },
  //       }),
  //     );
  //   },
  //   [options],
  // );

  // Handle user type based on username

  useEffect(() => {
    if (loggedInUser?.profile.preferred_username?.includes('bceid')) {
      setUserType(UserType.External);
    } else if (loggedInUser?.profile.preferred_username?.includes('idir')) {
      setUserType(UserType.Internal);
    } else {
      setUserType(UserType.External);
    }
  }, [loggedInUser]);

  // Handle view mode changes
  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  // Search internal contact effect with debounce
  // Commenting the below method because I am not sure which dropdown type
  // we are going to use if it will be dropdown with search then uncomment the code otherwise delete it.

  // useEffect(() => {
  //   if (searchInternalContact) {
  //     const timeoutId = setTimeout(async () => {
  //       const res = await fetchInternalContact(searchInternalContact);
  //       const indexToUpdate = internalRow.findIndex((row) =>
  //         row.some((field) => field.graphQLPropertyName === 'psnorgId'),
  //       );
  //       const infoMsg = !res.success ? (
  //         <div className="px-2">
  //           <img
  //             src={infoIcon}
  //             alt="info"
  //             aria-hidden="true"
  //             role="img"
  //             aria-label="User image"
  //           />
  //           <span
  //             aria-label={'info-message'}
  //             className="text-wrap px-2 custom-not-found"
  //           >
  //             No results found.
  //           </span>
  //         </div>
  //       ) : (
  //         <></>
  //       );

  //       setInternalRow((prev) =>
  //         updateFields(prev, {
  //           indexToUpdate,
  //           updates: {
  //             isLoading: RequestStatus.success,
  //             options,
  //             filteredOptions: res.data ?? resultCache[searchInternalContact] ?? [],
  //             customInfoMessage: infoMsg,
  //             handleSearch,
  //           },
  //         }),
  //       );
  //     }, 300);

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [searchInternalContact, options]);

  // Update form data when notations change

  useEffect(() => {
    if (status === RequestStatus.success && disclosureData) {
      // Commenting the below method because I am not sure which dropdown type
      // we are going to use if it will be dropdown with search then uncomment the code otherwise delete it.

      // const uniquePsnOrgs: any = Array.from(
      //   new Map(
      //     [disclosureData].map((item: any) => [
      //       item.psnorgId,
      //       { key: item.psnorgId, value: item.displayName },
      //     ]),
      //   ).values(),
      // );
      // setOptions(uniquePsnOrgs);
      // setInternalRow((prev) =>
      //   updateFields(prev, {
      //     indexToUpdate: prev.findIndex((row) =>
      //       row.some((field) => field.graphQLPropertyName === 'psnorgId'),
      //     ),
      //     updates: {
      //       isLoading: RequestStatus.loading,
      //       options: uniquePsnOrgs,
      //       filteredOptions: [],
      //       handleSearch,
      //       customInfoMessage: <></>,
      //     },
      //   }),
      // );

      setFormData(disclosureData);
    }

    // Commenting the below method because I am not sure which dropdown type
    // we are going to use if it will be dropdown with search then uncomment the code otherwise delete it.

    // else
    // {
    //   setInternalRow((prev) =>
    //     updateFields(prev, {
    //       indexToUpdate: prev.findIndex((row) =>
    //         row.some((field) => field.graphQLPropertyName === 'psnorgId'),
    //       ),
    //       updates: {
    //         isLoading: RequestStatus.loading,
    //         options: [],
    //         filteredOptions: [],
    //         handleSearch,
    //         customInfoMessage: <></>,
    //       },
    //     }),
    //   );
    // }
  }, [disclosureData, status]);

  // THIS MAY CHANGE IN FUTURE. NEED TO DISCUSS AS API NEEDS TO BE CALLED AGAIN
  // IF SAVED OR CANCEL BUTTON ON TOP IS CLICKED
  useEffect(() => {
    if (resetDetails) {
      dispatch(
        fetchSiteDisclosure({ siteId: siteId ?? '', showPending: showPending }),
      );
    }
  }, [resetDetails, saveSiteDetailsRequestStatus]);

  const handleInputChange = (
    id: number,
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    if (viewMode === SiteDetailsMode.SRMode) {
      console.log({ [graphQLPropertyName]: value, id });
    } else {
      const updatedDisclosure = (disclosure: any) => {
        return {
          ...disclosure,
          [graphQLPropertyName]: value,
          id: disclosure.id ?? '',
          siteId: disclosure.siteId ?? siteId,
          apiAction:
            disclosure.id === '' || disclosure.id === undefined
              ? UserActionEnum.added
              : UserActionEnum.updated,
          srAction: SRApprovalStatusEnum.Pending,
        };
      };
      const updatedFormData = updatedDisclosure(formData);
      const updatedTrackDisclosure = updatedDisclosure(
        trackSiteDisclosure ?? formData,
      );
      setFormData(updatedFormData);
      dispatch(updateSiteDisclosure(serializeDate(updatedFormData)));
      dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));
    }
    const flattedArr = flattenFormRows([
      ...disclosureStatementConfig,
      ...disclosureCommentsConfig,
    ]);
    const currLabel =
      flattedArr &&
      flattedArr.find((row) => row.graphQLPropertyName === graphQLPropertyName);
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Site Disclosure: ' + currLabel?.label,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
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
      const updateReferences = (disclosure: any) => {
        const updatedDisclosureSchedule = disclosure.disclosureSchedule.map(
          (schedule: any) => {
            if (schedule.id === event.row.id) {
              return {
                ...schedule,
                [event.property]: event.value,
                // Need to find from array of schedule 2 reference key value pair as it is not editable
                // this property will show on description on change of schedule 2 reference dropdown value
                discription: 'Dummy Data -> PETROLEUM OR NATURAL GAS DRILLING',
                apiAction: schedule?.apiAction ?? UserActionEnum.updated,
                srAction: SRApprovalStatusEnum.Pending,
              };
            }
            return schedule;
          },
        );

        // Return the updated disclosure object with the modified disclosureSchedule array
        return {
          ...disclosure,
          disclosureSchedule: updatedDisclosureSchedule,
        };
      };

      // Update both formData and trackParticipant
      const updatedFormData = updateReferences(formData);

      //need to uncomment it once get the actual source of data
      // const updatedTrackDisclosure = updateRefernces(trackSiteDisclosure ?? formData);

      setFormData(updatedFormData);
      dispatch(updateSiteDisclosure(updatedFormData));

      //need to uncomment it once get the actual source of data
      // dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

      const currLabel =
        disclosureScheduleInternalConfig &&
        disclosureScheduleInternalConfig.find(
          (row) => row.graphQLPropertyName === event.property,
        );
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'Site Disclosure Schedule' + currLabel?.displayName,
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    }
  };

  const handleTableSort = (row: any, ascDir: any, disclosureId: any) => {
    let property = row['graphQLPropertyName'];
    setFormData((prevData) => {
      if (prevData.disclosureId === disclosureId) {
        // Filter out selected rows from notationParticipant array
        const updatedDisclosureSchedule = prevData.disclosureSchedule.sort(
          function (a: any, b: any) {
            if (ascDir)
              return a[property] > b[property]
                ? 1
                : a[property] < b[property]
                  ? -1
                  : 0;
            else
              return b[property] > a[property]
                ? 1
                : b[property] < a[property]
                  ? -1
                  : 0;
          },
        );
        return { ...prevData, notationParticipant: updatedDisclosureSchedule };
      }
    });
  };

  // this need to be tracked and also change once get actual source of data.
  const handleAddDisclosureSchedule = (disclosureId: any) => {
    const newDisclosureSchedule = {
      id: v4(),
      reference: '',
      discription: '',
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
    };

    const updateDisclosure = (disclosure: any) => {
      return {
        ...disclosure,
        disclosureSchedule: [
          newDisclosureSchedule,
          ...disclosure.disclosureSchedule,
        ],
      };
    };

    const updatedFormData = updateDisclosure(formData);

    //need to uncomment it once get the actual source of data
    // const updatedTrackDisclosure = updateDisclosure(trackSiteDisclosure ?? formData);

    setFormData(updatedFormData);
    dispatch(updateSiteDisclosure(updatedFormData));

    //need to uncomment it once get the actual source of data
    // dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

    const tracker = new ChangeTracker(
      IChangeType.Added,
      'Site Dosclosure Schedule',
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  // this need to be tracked and also change once get actual source of data.
  const handleRemoveDisclosureSchedule = (
    disclosure: any,
    referenceIsDeleted: boolean = false,
  ) => {
    if (referenceIsDeleted) {
      const updateReferences = (disclosures: any) => {
        const updatedDisclosureSchedule = disclosures.disclosureSchedule.map(
          (schedule: any) => {
            if (
              selectedRows.some(
                (row: any) =>
                  row.disclosureId === disclosures.id && row.id === schedule.id,
              )
            ) {
              // Modify the schedule as needed (marking as deleted and updating approval status)
              return {
                ...schedule,
                apiAction: UserActionEnum.deleted,
                srAction: SRApprovalStatusEnum.Pending,
              };
            }
            return schedule; // Return the unchanged schedule if conditions aren't met
          },
        );

        // Return the updated disclosure object with the modified disclosureSchedule array
        return {
          ...disclosures,
          disclosureSchedule: updatedDisclosureSchedule,
        };
      };

      // Update both formData and trackParticipant
      const updatedFormData = updateReferences(formData);

      //need to uncomment it once get the actual source of data
      // const updatedTrackDisclosure = updateRefernces(trackSiteDisclosure ?? formData);

      // Filter out participants based on selectedRows for formData
      const filteredDisclosure = {
        ...updatedFormData,
        disclosureSchedule: updatedFormData.disclosureSchedule.filter(
          (schedule: any) =>
            !selectedRows.some(
              (selectedRow) =>
                selectedRow.disclosureId === disclosure.id &&
                selectedRow.scheduleId === schedule.id,
            ),
        ),
      };
      setFormData(filteredDisclosure);
      dispatch(updateSiteDisclosure(filteredDisclosure));

      //need to uncomment it once get the actual source of data
      // dispatch(setupSiteDisclosureDataForSaving(updatedTrackDisclosure));

      // Clear selectedRows state
      const updateSelectedRows = selectedRows.filter(
        (row) => row.disclosureId !== disclosure.id,
      );
      setSelectedRows(updateSelectedRows);
      setCurrenDisclosure({});
      setIsDelete(false);
      const tracker = new ChangeTracker(
        IChangeType.Deleted,
        'Site Disclosure Schedule',
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    } else {
      setCurrenDisclosure(disclosure);
      setIsDelete(true);
    }
  };

  const isAnyDisclosureScheduleSelected = (disclosureId: any) => {
    return selectedRows.some((row) => row.disclosureId === disclosureId);
  };

  const handleWidgetCheckBox = (event: any) => {
    alert(event);
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

  return (
    <>
      <DisclosureComponent
        viewMode={viewMode}
        userType={userType}
        handleWidgetCheckBox={handleWidgetCheckBox}
        formData={formData}
        disclosureStatementConfig={internalRow}
        handleInputChange={handleInputChange}
        handleTableChange={handleTableChange}
        disclosureScheduleInternalConfig={disclosureScheduleInternalConfig}
        disclosureScheduleExternalConfig={disclosureScheduleExternalConfig}
        loading={loading}
        handleTableSort={handleTableSort}
        handleAddDisclosureSchedule={handleAddDisclosureSchedule}
        isAnyDisclosureScheduleSelected={isAnyDisclosureScheduleSelected}
        handleRemoveDisclosureSchedule={handleRemoveDisclosureSchedule}
        srVisibilityConfig={srVisibilityConfig}
        handleItemClick={handleItemClick}
        disclosureCommentsConfig={disclosureCommentsConfig}
      />
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
    </>
  );
};

export default Disclosure;
