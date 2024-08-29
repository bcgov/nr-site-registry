import React, { useEffect, useState } from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
import Form from '../../../components/form/Form';
import GetNotationConfig from './NotationsConfig';
import './Notations.css';
import Widget from '../../../components/widget/Widget';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserType } from '../../../helpers/requests/userType';
import { AppDispatch } from '../../../Store';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, UserMinus, UserPlus } from '../../../components/common/icon';
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
import { flattenFormRows, getUser } from '../../../helpers/utility';
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
import { notationTypeDrpdown } from '../dropdowns/DropdownSlice';
import { notationParticipants, updateSiteNotation } from './NotationSlice';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { v4 } from 'uuid';
import { setupNotationDataForSaving } from "../SaveSiteDetailsSlice";

const Notations = () => {
    const {
      notationColumnInternal, 
      notationFormRowsInternal, 
      notationFormRowExternal, 
      notationFormRowsFirstChild, 
      notationColumnExternal, 
      notationFormRowEditMode, 
      srVisibilityConfig,
      notationFormRowsFirstChildIsRequired 
    } = GetNotationConfig();
    const notations = useSelector(notationParticipants);
    const dispatch = useDispatch<AppDispatch>();
    const mode = useSelector(siteDetailsMode);
    const notationType = useSelector(notationTypeDrpdown);
    const [userType, setUserType] = useState<UserType>(UserType.External);
    const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
    const [formData, setFormData] =  useState<{ [key: string]: any | [Date, Date] }[]>(notations);
    const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
    const [srTimeStamp, setSRTimeStamp] = useState('Sent to SR on June 2nd, 2013');
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

  const loggedInUser = getUser();
  const resetDetails = useSelector(resetSiteDetails);

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
    setFormData(notations);
  }, []);

  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    if (resetDetails) {
      setFormData(notations);
    }
  }, [resetDetails]);

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
      const updatedNotation = formData.map((notation) => {
        if (notation.id === id) {
          if (graphQLPropertyName === 'eclsCode') {
            setIsUpdated(true);
            const updatedRow = [...notationFormRowEditMode].map((items) => {
              return items.map((row) => ({
                ...row,
                options: notationType.data.find(
                  (items: any) => items.metaData === value,
                ).dropdownDto,
              }));
            });
            setUpdatedNotationFormRowEditMode(updatedRow);
            return {
              ...notation,
              [graphQLPropertyName]: value,
              ['etypCode']: '',
            };
          }
          return { ...notation, [graphQLPropertyName]: value };
        }
        return notation;
      });
      setFormData(updatedNotation);
      // dispatch(updateSiteNotation(updatedNotation))
    }

    const flattedArr = flattenFormRows(notationFormRowsInternal);
    const currLabel =
      flattedArr &&
      flattedArr.find((row) => row.graphQLPropertyName === graphQLPropertyName);
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Notations: ' + currLabel?.label,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const handleWidgetCheckBox = (event: any) => {
    alert(event);
  };
  const handleParentChekBoxChange = (id: any, value: any) => {
    alert(`${value}, ${id}`);
  };

  const handleRemoveParticipant = (
    currNotation: any,
    particIsDelete: boolean = false,
  ) => {
    if (particIsDelete) {
      // Remove selected rows from formData state
      setFormData((prevData) => {
        return prevData.map((notation) => {
          if (notation.id === currNotation.id) {
            // Filter out selected rows from notationParticipant array
            const updatedNotationParticipant =
              notation.notationParticipant.filter(
                (participant: any) =>
                  !selectedRows.some(
                    (row) =>
                      row.id === notation.id &&
                      row.participantId === participant.guid,
                  ),
              );
            return {
              ...notation,
              notationParticipant: updatedNotationParticipant,
            };
          }
          return notation;
        });
      });
      const tracker = new ChangeTracker(
        IChangeType.Deleted,
        'Notation Participant Delete',
      );
      dispatch(trackChanges(tracker.toPlainObject()));
      // Clear selectedRows state

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
        // setSelectedRows(prevSelectedRows => [...prevSelectedRows, { id, participantId: event.row.guid }]);
        setSelectedRows((prevSelectedRows) => [
          ...prevSelectedRows,
          ...rows.map((row: any) => ({
            id,
            participantId: row.guid,
          })),
        ]);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter(
            (selectedRow) =>
              !rows.some(
                (row: any) =>
                  selectedRow.participantId === row.guid &&
                  selectedRow.id === id,
              ),
          ),
        );
      }
    } else {
      const updateNotationParticipant = formData.map((notation) => {
        if (notation.id === id) {
          const updatedNotationParticipant = notation.notationParticipant.map(
            (participant: any) => {
              if (participant.guid === event.row.guid) {
                return { ...participant, [event.property]: event.value };
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

      const currLabel =
        notationColumnInternal &&
        notationColumnInternal.find(
          (row) => row.graphQLPropertyName === event.property,
        );
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'Notation Participant: ' + currLabel?.displayName,
      );
      setFormData(updateNotationParticipant);
      // dispatch(updateSiteNotation(updateNotationParticipant))
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
      id: formData.length + 1, // Generate a unique ID for the new notation
      etypCode: '', // Default values for other properties
      requirementReceivedDate: new Date(),
      completionDate: new Date(),
      eclsCode: '',
      requirementDueDate: new Date(),
      ministryContact: '',
      requiredAction: '',
      note: '',
      notationParticipant: [
        {
          displayName: '',
          eprCode: '',
          psnorgId: '',
          guid: '',
        },
      ],
    };

    // Add the new notation to formData
    setFormData((prevData) => [newNotation, ...prevData]);
    const tracker = new ChangeTracker(IChangeType.Added, 'New Notation Added');
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const handleAddParticipant = (id: any) => {
    const newParticipant = {
      displayName: '',
      eprCode: '',
      psnorgId: '',
      guid: v4(),
    };

    setFormData((prevFormData) => {
      return prevFormData.map((notation) => {
        if (notation.id === id) {
          // Create a new array with the updated notation object
          return {
            ...notation,
            notationParticipant: [
              newParticipant,
              ...notation.notationParticipant,
            ],
          };
        }
        return notation;
      });
    });
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
      <div
        data-testid="notation-rows"
        className={`col-lg-12 overflow-auto p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`}
        style={{ maxHeight: '800px' }}
      >
        {formData &&
          formData.map((notation, index) => (
            <div key={index}>
              {viewMode === SiteDetailsMode.SRMode &&
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
              <PanelWithUpDown
                firstChild={
                  <div className="w-100" key={index}>
                    <Form
                      formRows={handleNotationFormRowFirstChild(notation)}
                      formData={notation}
                      editMode={viewMode === SiteDetailsMode.EditMode}
                      srMode={viewMode === SiteDetailsMode.SRMode}
                      handleInputChange={(graphQLPropertyName, value) =>
                        handleInputChange(
                          notation.id,
                          graphQLPropertyName,
                          value,
                        )
                      }
                      aria-label="Sort Notation Form"
                    />
                    {userType === UserType.Internal && (
                      <span className="sr-time-stamp">
                        {notation.srTimeStamp}
                      </span>
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
                        handleInputChange(
                          notation.id,
                          graphQLPropertyName,
                          value,
                        )
                      }
                      aria-label="Sort Notation Form"
                    />
                    <Widget
                      changeHandler={(event) =>
                        handleTableChange(notation.id, event)
                      }
                      handleCheckBoxChange={(event) =>
                        handleWidgetCheckBox(event)
                      }
                      title={'Notation Participants'}
                      currentPage={1}
                      tableColumns={
                        userType === UserType.Internal
                          ? notationColumnInternal
                          : notationColumnExternal
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
                          <div
                            className="d-flex gap-2 flex-wrap "
                            key={notation.id}
                          >
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
                              false
                                ? `notation-sr-btn`
                                : `notation-sr-btn-disable`
                            }
                            disable={viewMode === SiteDetailsMode.SRMode}
                          />
                        )}
                    </Widget>
                    {userType === UserType.Internal && (
                      <p className="sr-time-stamp">{notation.srTimeStamp}</p>
                    )}
                  </div>
                }
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
