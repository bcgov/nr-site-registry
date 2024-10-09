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

// const disclosureData = {
//         disclosureId:1,
//         siteId:1,
//         dateReceived:new Date('2013-05-31'),
//         dateComplete:new Date('2013-05-31'),
//         localAuthorityReceived:new Date('2013-05-31'),
//         dateRegistrar:new Date('2013-05-31'),
//         dateEntered:new Date('2013-05-31'),
//         disclosureSchedule:[
//             {
//                 scheduleId:1,
//                 reference:'F1',
//                 discription:'PETROLEUM OR NATURAL GAS DRILLING',
//                 sr:true
//             },
//             {
//                 scheduleId:2,
//                 reference:'F2',
//                 discription:'PETROLEUM OR NATURAL GAS PRODUCTION FACILITIES',
//                 sr:false,
//             },
//         ],
//         summary: 'PLANNED ACTIVITIES INCLUDE MEETING THE OBLIGATIONS OF THE ENVIRONMENTAL MANAGEMENT ACT AND CONTAMINATED SITES REGULATION TO OBTAIN A CERTIFICATE OF RESTORATION FOR THE PROPERTY. THE END LAND USE OF THE PROPERTY IS WILDLANDS - REVERTED.',
//         statement:`SITE DISCLOSURE WAS COMPLETED AND SUMMARIZED USING AVAILABLE SITE INFORMATION OBTAINED VIA A FILE REVIEW OF WELLSITE DOCUMENTS OBTAINED FROM ENERPLUS CORPORATION'S CALGARY OFFICE. ADDITIONAL SITE BACKGROUND INFORMATION OBTAINED FROM USING A REVIEW OF AVAILABLE HISTORICAL AERIAL PHOTOGRAPHS AND A SEARCH OF ON-LINE DATABASES MAINTAINED AND/OR DEVELOPED BY REGULATORY AGENCIES (OIL AND GAS COMMISSION AND MINISTRY OF THE ENVIRONMENT).`,
//         governmentOrder:'NONE.',
//         srTimeStamp: `Sent to SR on ${formatDate(new Date())}`,
// };

const Disclosure: React.FC<IComponentProps> = ({ showPending = false }) => {
  const [formData, setFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>({});
  const [selectedRows, setSelectedRows] = useState<
    { disclosureId: any; scheduleId: any }[]
  >([]);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
  const [srTimeStamp, setSRTimeStamp] = useState(
    'Sent to SR on June 2nd, 2013',
  );
  const [searchInternalContact, setSearchInternalContact] = useState('');
  const [options, setOptions] = useState<{ key: any; value: any }[]>([]);
  const [internalRow, setInternalRow] = useState(disclosureStatementConfig);

  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const trackSiteDisclosure = useSelector(getSiteDisclosure);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const { siteDisclosure: disclosureData, status } =
    useSelector(siteDisclosure);
  const loggedInUser = getUser();
  const { id: siteId } = useParams();

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
    dispatch(setupSiteDisclosureDataForSaving(disclosureData));
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
      const updatedTrackDisclosure = updatedDisclosure(trackSiteDisclosure);
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
    const isExist = formData.disclosureSchedule.some(
      (item: any) => item.scheduleId === event.row.scheduleId,
    );
    if (isExist && event.property.includes('select_row')) {
      // Update selectedRows state based on checkbox selection
      if (event.value) {
        setSelectedRows((prevSelectedRows) => [
          ...prevSelectedRows,
          { disclosureId, scheduleId: event.row.scheduleId },
        ]);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter(
            (row) =>
              !(
                row.disclosureId === disclosureId &&
                row.scheduleId === event.row.scheduleId
              ),
          ),
        );
      }
    } else {
      setFormData((prevData) => {
        if (prevData.disclosureId === disclosureId) {
          const updatedDisclosureSchedule = prevData.disclosureSchedule.map(
            (schedule: any) => {
              if (schedule.scheduleId === event.row.scheduleId) {
                return { ...schedule, [event.property]: event.value };
              }
              return schedule;
            },
          );
          return { ...prevData, disclosureSchedule: updatedDisclosureSchedule };
        }
      });
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

  const handleAddDisclosureSchedule = (disclosureId: any) => {
    const newDisclosureSchedule = {
      scheduleId: Date.now(),
      reference: '',
      discription: '',
      sr: false,
    };

    setFormData((prevFormData) => {
      if (prevFormData.disclosureId === disclosureId) {
        // Create a new array with the updated notation object
        return {
          ...prevFormData,
          disclosureSchedule: [
            ...prevFormData.disclosureSchedule,
            newDisclosureSchedule,
          ],
        };
      }
    });
    const tracker = new ChangeTracker(
      IChangeType.Added,
      'Site Dosclosure Schedule',
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const handleRemoveDisclosureSchedule = (disclosureId: any) => {
    // Remove selected rows from formData state
    setFormData((prevData) => {
      if (prevData.disclosureId === disclosureId) {
        // Filter out selected rows from notationParticipant array
        const updatedDisclosureSchedule = prevData.disclosureSchedule.filter(
          (schedule: any) =>
            !selectedRows.some(
              (row) =>
                row.disclosureId === disclosureId &&
                row.scheduleId === schedule.scheduleId,
            ),
        );
        return { ...prevData, disclosureSchedule: updatedDisclosureSchedule };
      }
    });
    const tracker = new ChangeTracker(
      IChangeType.Deleted,
      'Site Disclosure Schedule',
    );
    dispatch(trackChanges(tracker.toPlainObject()));
    // Clear selectedRows state

    const updateSelectedRows = selectedRows.filter(
      (row) => row.disclosureId !== disclosureId,
    );
    setSelectedRows(updateSelectedRows);
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
      srTimeStamp={srTimeStamp}
    />
  );
};

export default Disclosure;
