import { useEffect, useState } from 'react';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import Widget from '../../../components/widget/Widget';
import {
  SpinnerIcon,
  UserMinus,
  UserPlus,
} from '../../../components/common/icon';
import Actions from '../../../components/action/Actions';
import './Participant.css';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import {
  fetchSiteParticipants,
  siteParticipants,
  updateSiteParticipants,
} from './ParticipantSlice';
import { useParams } from 'react-router-dom';
import GetConfig from './ParticipantConfig';
import { v4 } from 'uuid';
import {
  getAxiosInstance,
  getUser,
  UpdateDisplayTypeParams,
  updateTableColumn,
} from '../../../helpers/utility';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import {
  fetchParticipantRoleCd,
  participantNameDrpdown,
  participantRoleDrpdown,
} from '../dropdowns/DropdownSlice';
import infoIcon from '../../../images/info-icon.png';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import { graphQLPeopleOrgsCd } from '../../site/graphql/Dropdowns';

const Participants = () => {
  const {
    participantColumnInternal,
    participantColumnExternal,
    srVisibilityParcticConfig,
  } = GetConfig();
  const [internalRow, setInternalRow] = useState(participantColumnInternal);
  const [externalRow, setExternalRow] = useState(participantColumnExternal);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [formData, setFormData] = useState<
    { [key: string]: any | [Date, Date] }[]
  >([]);
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSiteParticipant, setSearchSiteParticipant] = useState('');
  const [selectedRows, setSelectedRows] = useState<
    { participantId: any; psnorgId: any; prCode: string; guid: string }[]
  >([]);
  const [isDelete, setIsDelete] = useState(false);
  const [options, setOptions] = useState<{ key: any; value: any }[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const resetDetails = useSelector(resetSiteDetails);
  const mode = useSelector(siteDetailsMode);
  const particRoleDropdwn = useSelector(participantRoleDrpdown);
  const { siteParticipants: siteParticipant, status } =
    useSelector(siteParticipants);
  const { id } = useParams();
  const loggedInUser = getUser();

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
  }, []);

  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    if (resetDetails) {
      setFormData(siteParticipant);
    }
  }, [resetDetails]);

  useEffect(() => {
    if (id) {
      Promise.all([
        dispatch(fetchParticipantRoleCd()),
        dispatch(fetchSiteParticipants(id ?? '')),
      ])
        .then(() => {
          setLoading(RequestStatus.success); // Set loading state to false after all API calls are resolved
        })
        .catch((error) => {
          setLoading(RequestStatus.failed);
          console.error('Error fetching data:', error);
        });
    }
  }, [id]);

  const fetchSiteParticipant = async (searchParam: string) => {
    try {
      if (
        searchParam !== null &&
        searchParam !== undefined &&
        searchParam !== ''
      ) {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLPeopleOrgsCd()),
          variables: {
            searchParam: searchParam,
          },
        });
        return response.data.data.getPeopleOrgsCd;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    if (searchSiteParticipant) {
      const timeoutId = setTimeout(async () => {
        try {
          fetchSiteParticipant(searchSiteParticipant).then((res) => {
            const indexToUpdate = participantColumnInternal.findIndex(
              (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
            );
            let infoMsg = <></>;
            if (!res.success) {
              infoMsg = (
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
              );
            }
            let params: UpdateDisplayTypeParams = {
              indexToUpdate: indexToUpdate,
              updates: {
                isLoading: RequestStatus.success,
                options: options,
                filteredOptions: res.data,
                customInfoMessage: infoMsg,
                handleSearch: handleSearch,
              },
            };

            setInternalRow(updateTableColumn(internalRow, params));
          });
        } catch (error) {
          throw new Error('Invalid searchParam');
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchSiteParticipant]);

  useEffect(() => {
    if (status === RequestStatus.success) {
      if (siteParticipant) {
        const psnOrgs = siteParticipant.map((item: any) => ({
          key: item.psnorgId,
          value: item.displayName,
        }));
        setOptions(psnOrgs);
        // Parameters for the update
        let params: UpdateDisplayTypeParams = {
          indexToUpdate: participantColumnInternal.findIndex(
            (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
          ),
          updates: {
            isLoading: RequestStatus.success,
            options: psnOrgs,
            filteredOptions: [],
            handleSearch: handleSearch,
            customInfoMessage: <></>,
          },
        };
        setExternalRow(updateTableColumn(externalRow, params));
        setInternalRow(updateTableColumn(internalRow, params));
      }
      setFormData(siteParticipant);
    }
  }, [siteParticipant, status]);

  useEffect(() => {
    if (particRoleDropdwn) {
      const indexToUpdate = participantColumnInternal.findIndex(
        (item) => item.displayType?.graphQLPropertyName === 'prCode',
      );
      let params: UpdateDisplayTypeParams = {
        indexToUpdate: indexToUpdate,
        updates: {
          options: particRoleDropdwn.data,
        },
      };
      setExternalRow(updateTableColumn(externalRow, params));
      setInternalRow(updateTableColumn(internalRow, params));
    }
  }, [particRoleDropdwn]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    const filteredData = siteParticipant.filter((paticipant: any) => {
      return deepSearch(paticipant, searchTerm.toLowerCase().trim());
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

      if (key === 'effectiveDate' || key === 'endDate') {
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
    }
    return false;
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFormData(siteParticipant);
  };

  const handleWidgetCheckBox = (event: any) => {
    alert(event);
  };

  const handleRemoveParticipant = (particIsDelete: boolean = false) => {
    if (particIsDelete) {
      // Remove selected rows from formData state
      setFormData((prevData) => {
        return prevData.filter(
          (participant) =>
            !selectedRows.some(
              (row) =>
                row.participantId === participant.id &&
                row.psnorgId === participant.psnorgId &&
                row.prCode === participant.prCode &&
                row.guid === participant.guid,
            ),
        );
      });
      const tracker = new ChangeTracker(
        IChangeType.Deleted,
        'Site Participant',
      );
      dispatch(trackChanges(tracker.toPlainObject()));
      // Clear selectedRows state
      setSelectedRows([]);
      setIsDelete(false);
    } else {
      setIsDelete(true);
    }
  };

  const handleSearch = (value: any) => {
    setSearchSiteParticipant(value.trim());
    let params: UpdateDisplayTypeParams = {
      indexToUpdate: participantColumnInternal.findIndex(
        (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
      ),
      updates: {
        isLoading: RequestStatus.loading,
        options: options,
        filteredOptions: [],
        handleSearch: handleSearch,
        customInfoMessage: <></>,
      },
    };
    setInternalRow(updateTableColumn(internalRow, params));
  };
  const handleTableChange = (event: any) => {
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
            participantId: row.id,
            psnorgId: row.psnorgId,
            prCode: row.prCode,
            guid: row.guid,
          })),
        ]);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter(
            (selectedRow) =>
              !rows.some(
                (row: any) =>
                  selectedRow.participantId === row.id &&
                  selectedRow.psnorgId === row.psnorgId &&
                  selectedRow.prCode === row.prCode &&
                  selectedRow.guid === row.guid,
              ),
          ),
        );
      }
    } else {
      const updatedParticipant = formData.map((participant) => {
        if (participant.guid === event.row.guid) {
          if (
            typeof event.value === 'object' &&
            event.value !== null &&
            event.property === 'psnorgId'
          ) {
            // Parameters for the update
            let params: UpdateDisplayTypeParams = {
              indexToUpdate: participantColumnInternal.findIndex(
                (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
              ),
              updates: {
                isLoading: RequestStatus.success,
                options: options,
                filteredOptions: [],
                handleSearch: handleSearch,
                customInfoMessage: <></>,
              },
            };
            setInternalRow(updateTableColumn(internalRow, params));
            return {
              ...participant,
              [event.property]: event.value.key,
              ['displayName']: event.value.value,
            };
          }
          return { ...participant, [event.property]: event.value };
        }
        return participant;
      });
      setFormData(updatedParticipant);
      dispatch(updateSiteParticipants(updatedParticipant));
      const IsExist = selectedRows.some((row) => row.guid === event.row.guid);
      if (IsExist) {
        setSelectedRows((prev: any) => {
          return prev.map((row: any) => {
            if (row.guid === event.row.guid) {
              return { ...row, [event.property]: event.value };
            }
            return row;
          });
        });
      }
    }

    const currLabel =
      participantColumnInternal &&
      participantColumnInternal.find(
        (row) => row.graphQLPropertyName === event.property,
      );
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Site Participant: ' + currLabel?.displayName,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
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
            new Date(b.effectiveDate).getTime() -
            new Date(a.effectiveDate).getTime(),
        ); // Sorting by date from new to old
        break;
      case 'oldTonew':
        sorted.sort(
          (a, b) =>
            new Date(a.effectiveDate).getTime() -
            new Date(b.effectiveDate).getTime(),
        ); // Sorting by date from new to old
        break;
      // Add more cases for additional sorting options
      default:
        break;
    }
    setFormData(sorted);
  };

  const handleAddParticipant = () => {
    const newParticipant = {
      guid: v4(),
      id: '',
      psnorgId: '',
      prCode: '',
      displayName: '',
      effectiveDate: new Date('2024-05-05'),
      endDate: new Date('2024-05-05'),
      note: '',
      sr: true,
    };
    setFormData((prevData) => [newParticipant, ...prevData]);
    const tracker = new ChangeTracker(
      IChangeType.Added,
      'New Site Participant',
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  // need to do this tomorrow??
  const handleTableSort = (row: any, ascDir: any) => {
    let property = row['graphQLPropertyName'];
    setFormData((prevData) => {
      let updatedParticipant = [...prevData];
      updatedParticipant.sort(function (a: any, b: any) {
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
      return [...updatedParticipant];
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

  if (loading === RequestStatus.loading) {
    return (
      <div className="participant-loading-overlay">
        <div className="participant-spinner-container">
          <SpinnerIcon
            data-testid="loading-spinner"
            className="participant-fa-spin"
          />
        </div>
      </div>
    );
  }
  return (
    <div
      className="row"
      id="participant-component"
      data-testid="participant-component"
    >
      <div className="row">
        <div className={`mb-3 col-lg-8`}>
          <SearchInput
            label={'Search'}
            searchTerm={searchTerm}
            clearSearch={clearSearch}
            handleSearchChange={handleSearchChange}
          />
        </div>
        <div className={`col-lg-4`}>
          <Sort
            formData={sortByValue}
            editMode={true}
            handleSortChange={handleSortChange}
          />
        </div>
      </div>
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
            handleTableSort(row, ascDir);
          }}
        >
          {viewMode === SiteDetailsMode.EditMode &&
            userType === UserType.Internal && (
              <div className="d-flex gap-2 flex-wrap ">
                <button
                  id="add-participant-btn"
                  className=" d-flex align-items-center participant-btn"
                  type="button"
                  onClick={handleAddParticipant}
                  aria-label={'Add Participant'}
                >
                  <UserPlus className="btn-user-icon" />
                  <span className="participant-btn-lbl">
                    {'Add Participant'}
                  </span>
                </button>

                <button
                  id="delete-participant-btn"
                  className={`d-flex align-items-center ${selectedRows.length > 0 ? `participant-btn` : `participant-btn-disable`}`}
                  disabled={selectedRows.length <= 0}
                  type="button"
                  onClick={() => {
                    handleRemoveParticipant();
                  }}
                  aria-label={'Remove Participant'}
                >
                  <UserMinus
                    className={`${selectedRows.length > 0 ? `btn-user-icon` : `btn-user-icon-disabled`}`}
                  />
                  <span
                    className={`${selectedRows.length > 0 ? `participant-btn-lbl` : `participant-btn-lbl-disabled`}`}
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
                items={srVisibilityParcticConfig}
                onItemClick={handleItemClick}
                customCssToggleBtn={
                  false ? `participant-sr-btn` : `participant-sr-btn-disable`
                }
                disable={viewMode === SiteDetailsMode.SRMode}
              />
            )}
        </Widget>
      </div>
      {isDelete && (
        <ModalDialog
          key={v4()}
          label={`Are you sure to ${isDelete ? 'delete' : 'replace'} associated site ?`}
          closeHandler={(response) => {
            if (response) {
              if (isDelete) {
                handleRemoveParticipant(response);
              }
            }
            setIsDelete(false);
          }}
        />
      )}
    </div>
  );
};

export default Participants;
