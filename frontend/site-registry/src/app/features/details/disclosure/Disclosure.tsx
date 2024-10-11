import { useEffect, useState } from 'react';
import Form from '../../../components/form/Form';
import Widget from '../../../components/widget/Widget';
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
import { siteDetailsMode, trackChanges } from '../../site/dto/SiteSlice';
import './Disclosure.css';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  Minus,
  Plus,
  SpinnerIcon,
  UserMinus,
  UserPlus,
} from '../../../components/common/icon';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import {
  flattenFormRows,
  formatDate,
  getUser,
  serializeDate,
} from '../../../helpers/utility';
import Actions from '../../../components/action/Actions';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import {
  fetchSiteDisclosure,
  siteDisclosure,
  updateSiteDisclosure,
} from './DisclosureSlice';
import { useParams } from 'react-router-dom';
import { IComponentProps } from '../navigation/NavigationPillsConfig';
import DisclosureComponent from './DisclosureComponent';

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

  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const { siteDisclosure: disclosureData, status } =
    useSelector(siteDisclosure);
  const loggedInUser = getUser();
  const { id } = useParams();

  useEffect(() => {
    if (loggedInUser?.profile.preferred_username?.indexOf('bceid') !== -1) {
      setUserType(UserType.External);
    } else if (
      loggedInUser?.profile.preferred_username?.indexOf('idir') !== -1
    ) {
      setUserType(UserType.Internal);
    } else {
      // not logged in
      setUserType(UserType.External);
    }
    // setFormData(disclosureData ?? {});
  }, []);

  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    if (id) {
      dispatch(fetchSiteDisclosure({ siteId: id ?? '', showPending: false }))
        .then(() => {
          setLoading(RequestStatus.success); // Set loading state to false after all API calls are resolved
        })
        .catch((error) => {
          setLoading(RequestStatus.failed);
          console.error('Error fetching data:', error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (status === RequestStatus.success) {
      if (disclosureData) {
        setFormData(disclosureData);
      }
    }
  }, [disclosureData, status]);

  const handleInputChange = (
    id: number,
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    if (viewMode === SiteDetailsMode.SRMode) {
      console.log({ [graphQLPropertyName]: value, id });
    } else {
      setFormData((preData) => {
        return { ...preData, [graphQLPropertyName]: value };
      });
      //dispatch the updated site disclosure
      dispatch(
        updateSiteDisclosure(
          serializeDate({
            ...formData,
            [graphQLPropertyName]: value,
          }),
        ),
      );
    }
    const flattedArr = flattenFormRows(disclosureStatementConfig);
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

  if (loading === RequestStatus.loading) {
    return (
      <div className="disclosure-loading-overlay">
        <div className="disclosure-spinner-container">
          <SpinnerIcon
            data-testid="loading-spinner"
            className="disclosure-fa-spin"
          />
        </div>
      </div>
    );
  }

  return (
    <DisclosureComponent
      viewMode={viewMode}
      userType={userType}
      handleWidgetCheckBox={handleWidgetCheckBox}
      formData={formData}
      disclosureStatementConfig={disclosureStatementConfig}
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
  );
};

export default Disclosure;
