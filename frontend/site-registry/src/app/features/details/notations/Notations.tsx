import React, { useCallback, useEffect, useState } from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
import Form from '../../../components/form/Form';
import './Notations.css';
import Widget from '../../../components/widget/Widget';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserType } from '../../../helpers/requests/userType';
import { AppDispatch } from '../../../Store';
import { useDispatch, useSelector } from 'react-redux';
import {
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
  resetSiteDetails,
  selectSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import {
  flattenFormRows,
  getAxiosInstance,
  getUser,
  resultCache,
  UpdateDisplayTypeParams,
  updateTableColumn,
} from '../../../helpers/utility';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { CheckBoxInput } from '../../../components/input-controls/InputControls';
import {
  FormFieldType,
  IFormField,
} from '../../../components/input-controls/IFormField';
import Actions from '../../../components/action/Actions';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import {
  ministryContactDrpdown,
  notationClassDrpdown,
  notationParticipantRoleDrpdown,
  notationTypeDrpdown,
} from '../dropdowns/DropdownSlice';
import {
  fetchNotationParticipants,
  notationParticipants,
  updateSiteNotation,
} from './NotationSlice';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { v4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import { graphQLPeopleOrgsCd } from '../../site/graphql/Dropdowns';
import GetNotationConfig from './NotationsConfig';
import infoIcon from '../../../images/info-icon.png';
import {
  getSiteNoatations,
  saveRequestStatus,
  setupNotationDataForSaving,
} from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { IComponentProps } from '../navigation/NavigationPillsConfig';
import Notation from './Notation';
import { currentSiteId } from '../SaveSiteDetailsSlice';

const Notations: React.FC<IComponentProps> = ({ showPending = false }) => {
  const {
    notationColumnInternal,
    notationFormRowsInternal,
    notationFormRowExternal,
    notationFormRowsFirstChild,
    notationColumnExternal,
    notationFormRowEditMode,
    srVisibilityConfig,
    notationFormRowsFirstChildIsRequired,
  } = GetNotationConfig();

  const { siteNotation: notations, status } = useSelector(notationParticipants);
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const notationType = useSelector(notationTypeDrpdown);
  const notationParticipantRole = useSelector(notationParticipantRoleDrpdown);
  const notationClass = useSelector(notationClassDrpdown);
  const ministryContact = useSelector(ministryContactDrpdown);
  const loggedInUser = getUser();
  const resetDetails = useSelector(resetSiteDetails);
  const { id: siteId } = useParams();
  const trackNotation = useSelector(getSiteNoatations);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);

  const [userType, setUserType] = useState('');
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [formData, setFormData] =
    useState<{ [key: string]: any | [Date, Date] }[]>(notations);
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);

  // NEED TO ADD COLUMN FOR THIS IN DATABASE
  const [srTimeStamp, setSRTimeStamp] = useState(
    'Sent to SR on June 2nd, 2013',
  );

  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDelete, setIsDelete] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [updatedNotationFormRowEditMode, setUpdatedNotationFormRowEditMode] =
    useState<IFormField[][]>([]);
  const [selectedRows, setSelectedRows] = useState<
    { id: any; participantId: any }[]
  >([]);
  const [currentNotation, setCurrentNotation] = useState({});
  const [ministryContactOptions, setMinistryContactOptions] = useState([]);
  const [internalTableColumn, setInternalTableColumn] = useState(
    notationColumnInternal,
  );
  const [externalTableColumn, setExternalTableCoulmn] = useState(
    notationColumnExternal,
  );
  const [searchSiteParticipant, setSearchSiteParticipant] = useState('');
  const [options, setOptions] = useState<{ key: any; value: any }[]>([]);

  // Function to fetch notation participant
  const fetchNotationParticipant = useCallback(async (searchParam: string) => {
    if (searchParam.trim()) {
      try {
        // Check cache first
        if (resultCache[searchParam]) {
          return resultCache[searchParam];
        }

        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLPeopleOrgsCd()),
          variables: { searchParam },
        });

        // Store result in cache if successful
        if (response?.data?.data?.getPeopleOrgsCd?.success) {
          resultCache[searchParam] = response.data.data.getPeopleOrgsCd.data;
          return response.data.data.getPeopleOrgsCd;
        }
      } catch (error) {
        console.error('Error fetching notation participant:', error);
        return [];
      }
    }
    return [];
  }, []);

  // Handle search action
  const handleSearch = useCallback(
    (value: any) => {
      setSearchSiteParticipant(value.trim());
      setInternalTableColumn((prev) =>
        updateTableColumn(prev, {
          indexToUpdate: prev.findIndex(
            (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
          ),
          updates: {
            isLoading: RequestStatus.loading,
            filteredOptions: [],
            handleSearch,
            customInfoMessage: <></>,
          },
        }),
      );
    },
    [options],
  );

  // Update form data when notations change
  useEffect(() => {
    if (status === RequestStatus.success && notations) {
      const psnOrgs = notations.flatMap((item: any) =>
        Array.isArray(item.notationParticipant)
          ? item.notationParticipant.map((participant: any) => ({
              key: participant.psnorgId,
              value: participant.displayName,
            }))
          : [],
      );

      const uniquePsnOrgs: any = Array.from(
        new Map(psnOrgs.map((item: any) => [item.key, item])).values(),
      );
      setOptions(uniquePsnOrgs);

      setInternalTableColumn((prev) =>
        updateTableColumn(prev, {
          indexToUpdate: prev.findIndex(
            (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
          ),
          updates: {
            isLoading: RequestStatus.success,
            options: uniquePsnOrgs,
            filteredOptions: [],
            handleSearch,
            customInfoMessage: <></>,
          },
        }),
      );
      setExternalTableCoulmn((prev) =>
        updateTableColumn(prev, {
          indexToUpdate: prev.findIndex(
            (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
          ),
          updates: {
            isLoading: RequestStatus.success,
            options: uniquePsnOrgs,
            filteredOptions: [],
            handleSearch,
            customInfoMessage: <></>,
          },
        }),
      );
      setFormData(notations);
    }
  }, [notations, status]);

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
    dispatch(setupNotationDataForSaving(notations));
  }, [mode]);

  // Search participant effect with debounce
  useEffect(() => {
    if (searchSiteParticipant) {
      const timeoutId = setTimeout(async () => {
        const res = await fetchNotationParticipant(searchSiteParticipant);
        const indexToUpdate = internalTableColumn.findIndex(
          (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
        );
        const infoMsg = !res.success ? (
          <div className="px-2">
            <img
              src={infoIcon}
              alt="info"
              aria-hidden="true"
              role="img"
              aria-label="User image"
            />
            <span
              aria-label={'info-message'}
              className="text-wrap px-2 custom-not-found"
            >
              No results found.
            </span>
          </div>
        ) : (
          <></>
        );

        setInternalTableColumn((prev) =>
          updateTableColumn(prev, {
            indexToUpdate,
            updates: {
              isLoading: RequestStatus.success,
              options,
              filteredOptions:
                res.data ?? resultCache[searchSiteParticipant] ?? [],
              customInfoMessage: infoMsg,
              handleSearch,
            },
          }),
        );
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchSiteParticipant, options]);

  // Update ministry contact options
  useEffect(() => {
    if (notationParticipantRole) {
      setMinistryContactOptions(ministryContact.data);
      const indexToUpdate = internalTableColumn.findIndex(
        (item) => item.displayType?.graphQLPropertyName === 'eprCode',
      );

      const updateParams = {
        indexToUpdate,
        updates: {
          options: notationParticipantRole.data || [],
        },
      };

      setInternalTableColumn((prev) => updateTableColumn(prev, updateParams));
      setExternalTableCoulmn((prev) => updateTableColumn(prev, updateParams));
    }
  }, [notationParticipantRole, ministryContact.data]);

  // THIS MAY CHANGE IN FUTURE. NEED TO DISCUSS AS API NEEDS TO BE CALLED AGAIN
  // IF SAVED OR CANCEL BUTTON ON TOP IS CLICKED
  useEffect(() => {
    if (resetDetails) {
      dispatch(
        fetchNotationParticipants({
          siteId: siteId ?? '',
          showPending: showPending,
        }),
      );
    }
  }, [resetDetails, saveSiteDetailsRequestStatus]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    const filteredData = notations.filter((notation: any) => {
      // Check if any property of the notation object contains the searchTerm
      return deepSearch(notation, searchTerm.toLowerCase().trim());
    });
    setFormData(filteredData);
  };

  const deepSearch = (obj: any, searchTerm: string): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object') {
        if (deepSearch(value, searchTerm)) {
          return true;
        }
      }
      const stringValue =
        typeof value === 'string'
          ? value.toLowerCase()
          : String(value).toLowerCase();

      if (
        key === 'completionDate' ||
        key === 'requirementDueDate' ||
        key === 'requirementReceivedDate'
      ) {
        const date = new Date(value);
        const formattedDate = date
          .toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          .toLowerCase();
        const ordinalSuffixPattern = /\b(\d+)(st|nd|rd|th)\b/g;
        searchTerm = searchTerm.replace(ordinalSuffixPattern, '$1');
        if (formattedDate.includes(searchTerm)) {
          return true;
        }
      }

      if (stringValue.includes(searchTerm)) {
        return true;
      }
      if (stringValue.includes(searchTerm)) {
        return true;
      }
    }
    return false;
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFormData(notations);
  };

  const handleInputChange = (
    id: number,
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    if (viewMode === SiteDetailsMode.SRMode) {
      console.log({ [graphQLPropertyName]: value, id });
    } else {
      const updateNotations = (notations: any) => {
        return notations.map((notation: any) => {
          if (notation.id === id) {
            let updatedNotation = {
              ...notation,
              [graphQLPropertyName]: value,
              apiAction: notation?.apiAction ?? UserActionEnum.updated,
              srAction: SRApprovalStatusEnum.Pending,
            };

            if (graphQLPropertyName === 'eclsCode') {
              setIsUpdated(true);
              const updatedRow = [...notationFormRowEditMode].map((items) => {
                return items.map((row) => ({
                  ...row,
                  options: notationType.data.find(
                    (item: any) => item.metaData === value,
                  ).dropdownDto,
                }));
              });
              setUpdatedNotationFormRowEditMode(updatedRow);
              updatedNotation['etypCode'] = '';
            }

            return updatedNotation;
          }
          return notation;
        });
      };

      // Update both formData and trackNotation in one go
      const updatedNotation = updateNotations(formData);
      const updatedTrackNotation = updateNotations(trackNotation);

      setFormData(updatedNotation);
      dispatch(updateSiteNotation(updatedNotation));
      dispatch(setupNotationDataForSaving(updatedTrackNotation));

      const flattedArr = flattenFormRows(notationFormRowsInternal);
      const currLabel =
        flattedArr &&
        flattedArr.find(
          (row) => row.graphQLPropertyName === graphQLPropertyName,
        );
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'Notations: ' + currLabel?.label,
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    }
  };

  const handleWidgetCheckBox = (event: any) => {
    alert(event);
  };

  const handleParentChekBoxChange = (id: any, value: any) => {
    alert(`${value}, ${id}`);
  };

  const handleRemoveParticipant = (
    currNotation: any,
    particIsDelete = false,
  ) => {
    if (particIsDelete) {
      const updateNotations = (notations: any) => {
        return notations.map((notation: any) => {
          if (notation.id === currNotation.id) {
            const updatedNotationParticipant = notation.notationParticipant.map(
              (participant: any) => {
                if (
                  selectedRows.some(
                    (row) =>
                      row.id === notation.id &&
                      row.participantId === participant.eventParticId,
                  )
                ) {
                  return {
                    ...participant,
                    apiAction: UserActionEnum.deleted, // Mark as deleted
                    srAction: SRApprovalStatusEnum.Pending,
                  };
                }
                return participant;
              },
            );

            return {
              ...notation,
              notationParticipant: updatedNotationParticipant,
            };
          }
          return notation;
        });
      };

      // Update both formData and trackNotation
      const updatedPartics = updateNotations(formData);
      const updatedTrackNotatn = updateNotations(trackNotation);

      // Filter out participants based on selectedRows for formData
      const filteredPartics = updatedPartics.map((notation: any) => ({
        ...notation,
        notationParticipant: notation.notationParticipant.filter(
          (participant: any) =>
            !selectedRows.some(
              (row) =>
                row.id === notation.id &&
                row.participantId === participant.eventParticId,
            ),
        ),
      }));

      setFormData(filteredPartics);
      dispatch(updateSiteNotation(filteredPartics));
      dispatch(setupNotationDataForSaving(updatedTrackNotatn));

      const tracker = new ChangeTracker(
        IChangeType.Deleted,
        'Notation Participant Delete',
      );
      dispatch(trackChanges(tracker.toPlainObject()));

      const updateSelectedRows = selectedRows.filter(
        (row) => row.id !== currNotation.id,
      );
      setSelectedRows(updateSelectedRows);
      setCurrentNotation({});
      setIsDelete(false);
    } else {
      setCurrentNotation(currNotation);
      setIsDelete(true);
    }
  };

  const handleTableChange = (id: any, event: any) => {
    if (
      event.property.includes('select_all') ||
      event.property.includes('select_row')
    ) {
      let rows = event.property === 'select_row' ? [event.row] : event.value;
      let isTrue =
        event.property === 'select_row' ? event.value : event.selected;
      if (isTrue) {
        setSelectedRows((prevSelectedRows) => [
          ...prevSelectedRows,
          ...rows.map((row: any) => ({
            id,
            participantId: row.eventParticId,
          })),
        ]);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter(
            (selectedRow) =>
              !rows.some(
                (row: any) =>
                  selectedRow.participantId === row.eventParticId &&
                  selectedRow.id === id,
              ),
          ),
        );
      }
    } else {
      const updateParticipants = (
        notations: any,
        id: any,
        event: any,
        updateParams = false,
      ) => {
        return notations.map((notation: any) => {
          if (notation.id === id) {
            const updatedNotationParticipant = notation.notationParticipant.map(
              (participant: any) => {
                if (participant.eventParticId === event.row.eventParticId) {
                  const isPsnorgId =
                    typeof event.value === 'object' &&
                    event.value !== null &&
                    event.property === 'psnorgId';

                  const updatedParticipant = isPsnorgId
                    ? {
                        ...participant,
                        [event.property]: event.value.key,
                        ['displayName']: event.value.value,
                        apiAction:
                          participant?.apiAction ?? UserActionEnum.updated,
                        srAction: SRApprovalStatusEnum.Pending,
                      }
                    : {
                        ...participant,
                        [event.property]: event.value,
                        apiAction:
                          participant?.apiAction ?? UserActionEnum.updated,
                        srAction: SRApprovalStatusEnum.Pending,
                      };

                  if (isPsnorgId && updateParams) {
                    const params: UpdateDisplayTypeParams = {
                      indexToUpdate: notationColumnInternal.findIndex(
                        (item) =>
                          item.displayType?.graphQLPropertyName === 'psnorgId',
                      ),
                      updates: {
                        isLoading: RequestStatus.success,
                        options,
                        filteredOptions:
                          resultCache[searchSiteParticipant] ?? [],
                        handleSearch,
                        customInfoMessage: <></>,
                      },
                    };
                    setInternalTableColumn(
                      updateTableColumn(internalTableColumn, params),
                    );
                  }

                  return updatedParticipant;
                }
                return participant;
              },
            );

            return {
              ...notation,
              notationParticipant: updatedNotationParticipant,
            };
          }
          return notation;
        });
      };

      // Update formData with parameters
      const updateNotationParticipant = updateParticipants(
        formData,
        id,
        event,
        true,
      );
      setFormData(updateNotationParticipant);
      dispatch(updateSiteNotation(updateNotationParticipant));
      // Update trackNotation without parameters
      const trackNotatn = updateParticipants(trackNotation, id, event, false);
      dispatch(setupNotationDataForSaving(trackNotatn));

      const currLabel =
        notationColumnInternal &&
        notationColumnInternal.find(
          (row) => row.graphQLPropertyName === event.property,
        );
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'Notation Participant: ' + currLabel?.displayName,
      );
    }
  };

  const handleSortChange = (
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    setSortByValue((prevData) => ({
      ...prevData,
      [graphQLPropertyName]: value,
    }));
    sortItems(value, formData);
  };

  const sortItems = (sortBy: any, data: any) => {
    let sorted = [...data];
    switch (sortBy) {
      case 'newToOld':
        sorted.sort(
          (a, b) =>
            new Date(b.requirementReceivedDate).getTime() -
            new Date(a.requirementReceivedDate).getTime(),
        ); // Sorting by date from new to old
        break;
      case 'oldTonew':
        sorted.sort(
          (a, b) =>
            new Date(a.requirementReceivedDate).getTime() -
            new Date(b.requirementReceivedDate).getTime(),
        ); // Sorting by date from new to old
        break;
      // Add more cases for additional sorting options
      default:
        break;
    }
    setFormData(sorted);
  };

  const handleOnAddNotation = () => {
    const newNotation = {
      id: v4(), // Generate a unique ID for the new notation
      siteId: siteId,
      etypCode: '', // Default values for other properties
      requirementReceivedDate: new Date(),
      completionDate: new Date(),
      eclsCode: '',
      requirementDueDate: new Date(),
      requiredAction: '',
      note: '',
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
      notationParticipant: [
        {
          displayName: '',
          eprCode: '',
          psnorgId: '',
          eventId: '',
          eventParticId: v4(),
          apiAction: UserActionEnum.added,
          srAction: SRApprovalStatusEnum.Pending,
        },
      ],
    };

    // Add the new notation to formData
    setFormData((prevData) => [newNotation, ...prevData]);
    dispatch(updateSiteNotation([newNotation, ...formData]));
    dispatch(setupNotationDataForSaving([newNotation, ...trackNotation]));
    const tracker = new ChangeTracker(IChangeType.Added, 'New Notation Added');
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const handleAddParticipant = (id: any) => {
    const newParticipant = {
      displayName: '',
      eventId: '',
      eprCode: '',
      psnorgId: '',
      eventParticId: v4(),
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
    };

    const updateNotations = (notations: any, id: any) => {
      return notations.map((notation: any) => {
        if (notation.id === id) {
          const updatedNotationParticipant = [
            newParticipant,
            ...notation.notationParticipant.map((participant: any) =>
              participant.apiAction === UserActionEnum.deleted
                ? { ...participant } // Ensure deleted participants are kept
                : participant,
            ),
          ];
          return {
            ...notation,
            notationParticipant: updatedNotationParticipant,
          };
        }
        return notation;
      });
    };

    // Update both formData and trackNotation in one call
    const updatedParticipants = updateNotations(formData, id);
    const updatedTrackParticipants = updateNotations(trackNotation, id);

    setFormData(updatedParticipants);
    dispatch(updateSiteNotation(updatedParticipants));
    dispatch(setupNotationDataForSaving(updatedTrackParticipants));
    const tracker = new ChangeTracker(
      IChangeType.Added,
      'Notation Participant Added',
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const isAnyParticipantSelected = (id: any) => {
    return selectedRows.some((row) => row.id === id);
  };

  const handleTableSort = (row: any, ascDir: any, id: any) => {
    let property = row['graphQLPropertyName'];
    setFormData((prevData) => {
      return prevData.map((tempNotation) => {
        if (id === tempNotation.id) {
          // Filter out selected rows from notationParticipant array
          let updatedNotationParticipant = [
            ...tempNotation.notationParticipant,
          ];
          updatedNotationParticipant.sort(function (a: any, b: any) {
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
          });
          return {
            ...tempNotation,
            notationParticipant: updatedNotationParticipant,
          };
        }
        return tempNotation;
      });
    });
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

  const updateOptionsBasedOnMetaData = (
    rows: IFormField[][],
    metaData: any,
    fallbackMetaDataKey: string,
  ) => {
    return rows.map((items) =>
      items.map((row) => {
        if (row.graphQLPropertyName === 'etypCode') {
          const metaKey = metaData ? metaData[fallbackMetaDataKey] : null;
          const dropdownDto = notationType.data.find(
            (item: any) => item.metaData === metaKey,
          )?.dropdownDto;
          return {
            ...row,
            options: dropdownDto || row.options, // Fallback to existing options if dropdownDto is not found
          };
        }
        if (row.graphQLPropertyName === 'eclsCode') {
          return {
            ...row,
            options: notationClass.data || [],
          };
        }
        if (row.graphQLPropertyName === 'psnorgId') {
          return {
            ...row,
            options: ministryContactOptions || [],
          };
        }
        return row;
      }),
    );
  };

  const handleChangeNotationFormRow = (metaData?: any) => {
    if (isUpdated) {
      setIsUpdated(false);
      return updatedNotationFormRowEditMode;
    } else {
      return updateOptionsBasedOnMetaData(
        notationFormRowEditMode,
        metaData,
        'eclsCode',
      );
    }
  };

  const handleNotationFormRowFirstChild = (metaData?: any) => {
    if (metaData && metaData.requiredDate) {
      return updateOptionsBasedOnMetaData(
        notationFormRowsFirstChildIsRequired,
        metaData,
        'eclsCode',
      );
    } else {
      return updateOptionsBasedOnMetaData(
        notationFormRowsFirstChild,
        metaData,
        'eclsCode',
      );
    }
  };

  const handleNotationFormRowExternal = (metaData?: any) => {
    return updateOptionsBasedOnMetaData(
      notationFormRowExternal,
      metaData,
      'eclsCode',
    );
  };

  const handleNotationFormRowsInternal = (metaData?: any) => {
    return updateOptionsBasedOnMetaData(
      notationFormRowsInternal,
      metaData,
      'eclsCode',
    );
  };

  return (
    <div className="px-2">
      {!showPending && (
        <div
          className="row pe-2"
          id="notations-component"
          data-testid="notations-component"
        >
          {userType === UserType.Internal &&
            (viewMode === SiteDetailsMode.EditMode ||
              viewMode === SiteDetailsMode.SRMode) && (
              <div className="col-lg-6 col-md-12 py-4">
                <button
                  className={`d-flex align-items-center ${viewMode === SiteDetailsMode.EditMode ? `btn-add-notation` : `btn-add-notation-disable`} `}
                  disabled={viewMode === SiteDetailsMode.SRMode}
                  onClick={handleOnAddNotation}
                  aria-label="Add Notation"
                >
                  <Plus className="btn-notation-icon" />
                  <span>Add Notation</span>
                </button>
              </div>
            )}
          <div
            className={`${userType === UserType.Internal && (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode) ? `col-lg-6 col-md-12` : `col-lg-12`}`}
          >
            <div className="row justify-content-between p-0">
              <div
                className={`mb-3 ${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode ? `col` : `col-lg-8 col-md-12`) : `col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12`}`}
              >
                <SearchInput
                  label={'Search'}
                  searchTerm={searchTerm}
                  clearSearch={clearSearch}
                  handleSearchChange={handleSearchChange}
                />
              </div>
              <div
                className={`${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode ? `col` : `col-lg-4 col-md-12`) : `col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12`}`}
              >
                <Sort
                  formData={sortByValue}
                  editMode={true}
                  handleSortChange={handleSortChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        data-testid="notation-rows"
        className={`col-lg-12 overflow-auto p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`}
        style={{ maxHeight: '800px' }}
      >
        {formData &&
          formData.map((notation, index) => (
            <div key={index}>
              {!showPending &&
                viewMode === SiteDetailsMode.SRMode &&
                userType === UserType.Internal && (
                  <CheckBoxInput
                    type={FormFieldType.Checkbox}
                    label={''}
                    isLabel={false}
                    onChange={(value) =>
                      handleParentChekBoxChange(notation.id, value)
                    }
                    srMode={viewMode === SiteDetailsMode.SRMode}
                  />
                )}
              <Notation
                index={index}
                notation={notation}
                handleNotationFormRowFirstChild={
                  handleNotationFormRowFirstChild
                }
                viewMode={viewMode}
                handleInputChange={handleInputChange}
                userType={userType}
                handleNotationFormRowExternal={handleNotationFormRowExternal}
                handleChangeNotationFormRow={handleChangeNotationFormRow}
                handleNotationFormRowsInternal={handleNotationFormRowsInternal}
                handleTableChange={handleTableChange}
                handleWidgetCheckBox={handleWidgetCheckBox}
                internalTableColumn={internalTableColumn}
                externalTableColumn={externalTableColumn}
                loading={loading}
                handleTableSort={handleTableSort}
                handleAddParticipant={handleAddParticipant}
                isAnyParticipantSelected={isAnyParticipantSelected}
                handleRemoveParticipant={handleRemoveParticipant}
                srVisibilityConfig={srVisibilityConfig}
                handleItemClick={handleItemClick}
              />
            </div>
          ))}
      </div>
      {isDelete && (
        <ModalDialog
          key={v4()}
          label={`Are you sure to ${isDelete ? 'delete' : 'replace'} notation participant ?`}
          closeHandler={(response) => {
            if (response) {
              if (isDelete) {
                handleRemoveParticipant(currentNotation, response);
              }
            }
            setCurrentNotation({});
            setIsDelete(false);
          }}
        />
      )}
    </div>
  );
};

export default Notations;
