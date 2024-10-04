import { ReactNode, useCallback, useEffect, useState } from 'react';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import {
  getAxiosInstance,
  getUser,
  UpdateDisplayTypeParams,
  updateTableColumn,
} from '../../../helpers/utility';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { associatedSites, fetchAssociatedSites } from './AssociateSlice';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { RequestStatus } from '../../../helpers/requests/status';
import './Associate.css';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import Widget from '../../../components/widget/Widget';
import Actions from '../../../components/action/Actions';
import {
  SpinnerIcon,
  UserMinus,
  UserPlus,
} from '../../../components/common/icon';
import { v4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import { graphqlSearchSiteIdsQuery } from '../../site/graphql/Associate';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { GetAssociateConfig } from './AssociateConfig';
import infoIcon from '../../../images/info-icon.png';
import { saveRequestStatus } from '../SaveSiteDetailsSlice';
import { IComponentProps } from '../navigation/NavigationPillsConfig';
import AssociateSiteComponent from './AssociateSiteComponent';

const Associate: React.FC<IComponentProps> = ({ showPending = false }) => {
  const {
    associateColumnExternal,
    associateColumnInternal,
    associateColumnInternalSRandViewMode,
    srVisibilityAssocConfig,
  } = GetAssociateConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<
    { [key: string]: any | [Date, Date] }[]
  >([]);
  const [updateForm, setUpdateForm] =
    useState<{ [key: string]: any | [Date, Date] }[]>(formData);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [selectedRows, setSelectedRows] = useState<
    { siteId: String; siteIdAssociatedWith: string; guid: string }[]
  >([]);
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
  const [searchParam, setSearchParam] = useState('');
  const [internalRow, setInternalRow] = useState(associateColumnInternal);
  const [isDelete, setIsDelete] = useState(false);
  const [isRecordExist, setIsRecordExist] = useState<{ [key: string]: any }>(
    {},
  );
  const [isInfoMsg, setIsInfoMsg] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState('');

  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const sitesAssociated = useSelector(associatedSites);
  const resetDetails = useSelector(resetSiteDetails);
  const loggedInUser = getUser();
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);

  useEffect(() => {
    const userType = loggedInUser?.profile.preferred_username?.includes('bceid')
      ? UserType.External
      : loggedInUser?.profile.preferred_username?.includes('idir')
        ? UserType.Internal
        : UserType.External;
    setUserType(userType);
  }, [loggedInUser]);

  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  useEffect(() => {
    if (resetDetails) {
      setFormData(sitesAssociated);
      // need some updated array on click of save button on top
      setUpdateForm(sitesAssociated);
    }
  }, [resetDetails]);

  useEffect(() => {
    if (sitesAssociated && sitesAssociated.length > 0) {
      setFormData(sitesAssociated);
      // need some updated array on click of save button on top
      setUpdateForm(sitesAssociated);
    } else {
      setLoading(RequestStatus.loading);
    }
  }, [sitesAssociated]);

  useEffect(() => {
    if (id) {
      dispatch(fetchAssociatedSites({ siteId: id ?? '', showPending: false }))
        .then(() => {
          setLoading(RequestStatus.success); // Set loading state to false after all API calls are resolved
        })
        .catch((error) => {
          setLoading(RequestStatus.failed);
          console.error('Error fetching data:', error);
        });
    }
  }, [id]);
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFormData(sitesAssociated);
    // need some updated array on click of save button on top
    setUpdateForm(sitesAssociated);
  }, [sitesAssociated]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = event.target.value;
      setSearchTerm(searchTerm);
      const filteredData = sitesAssociated.filter((associate: any) =>
        deepSearch(associate, searchTerm.toLowerCase().trim()),
      );
      setFormData(filteredData);
    },
    [sitesAssociated],
  );

  const deepSearch = (obj: any, searchTerm: string): boolean => {
    for (const key in obj) {
      if (key !== 'guid') {
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

        if (key === 'effectiveDate') {
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
    }

    return false;
  };

  const handleSortChange = useCallback(
    (graphQLPropertyName: any, value: string | [Date, Date]) => {
      setSortByValue((prevData) => ({
        ...prevData,
        [graphQLPropertyName]: value,
      }));
      sortItems(value, formData);
    },
    [formData],
  );

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

  const handleWidgetCheckBox = (event: any) => {
    alert(event);
  };

  const fetchSiteIds = async (searchParam: string) => {
    try {
      if (
        searchParam !== null &&
        searchParam !== undefined &&
        searchParam !== ''
      ) {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphqlSearchSiteIdsQuery()),
          variables: {
            searchParam: searchParam,
          },
        });
        return response.data.data.searchSiteIds;
      } else {
        throw new Error('Invalid searchParam');
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (Object.keys(isRecordExist).length > 0) {
      setFormData((prev) =>
        prev.map((associate) =>
          associate.guid === currentRecordId
            ? { ...associate, siteIdAssociatedWith: '' }
            : associate,
        ),
      );
      setIsRecordExist({});
      setCurrentRecordId('');
      setIsInfoMsg(false);
    }
  }, [isInfoMsg]);

  useEffect(() => {
    if (searchParam) {
      const indexToUpdate = associateColumnInternal.findIndex(
        (item) =>
          item.displayType?.graphQLPropertyName === 'siteIdAssociatedWith',
      );
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetchSiteIds(searchParam);
          let result = [];
          let infoMsg = <></>;
          let params = {
            indexToUpdate,
            updates: {
              isLoading: RequestStatus.success,
              options: [],
              customInfoMessage: infoMsg,
            },
          };

          if (!response?.success) {
            infoMsg = (
              <div className="text-wrap ">
                <img
                  src={infoIcon}
                  alt="info"
                  aria-hidden="true"
                  role="img"
                  aria-label="User image"
                />
                <span
                  aria-label={'info-message'}
                  className="px-2 custom-not-found"
                >
                  No results found.
                </span>
              </div>
            );
            params = {
              ...params,
              updates: {
                ...params.updates,
                isLoading: RequestStatus.idle,
                customInfoMessage: infoMsg,
              },
            };
          } else {
            const siteIds = formData.map((obj) => obj.siteIdAssociatedWith);
            if (response.data.length === 0) {
              infoMsg = (
                <div>
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
              setIsInfoMsg(false);
            } else if (Object.keys(isRecordExist).length > 0) {
              result = response.data.filter(
                (item: any) => !siteIds.includes(item.value.toString()),
              );
              infoMsg = (
                <div className="py-2">
                  <img
                    src={infoIcon}
                    alt="info"
                    aria-hidden="true"
                    role="img"
                    aria-label="User image"
                  />
                  <span
                    aria-label={'info-message'}
                    className="text-wrap p-2 custom-not-found"
                  >
                    Site ID: {isRecordExist.siteIdAssociatedWith} is already
                    selected.
                  </span>
                </div>
              );
              setIsInfoMsg(true);
            } else {
              result = response.data;
              infoMsg = <></>;
              setIsInfoMsg(false);
            }
            params = {
              ...params,
              updates: {
                ...params.updates,
                options: result,
                customInfoMessage: infoMsg,
              },
            };
          }

          setInternalRow(updateTableColumn(associateColumnInternal, params));
        } catch {
          throw new Error('Invalid searchParam');
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchParam]);

  useEffect(() => {
    // Parameters for the update
    let params: UpdateDisplayTypeParams = {
      indexToUpdate: associateColumnInternal.findIndex(
        (item) =>
          item.displayType?.graphQLPropertyName === 'siteIdAssociatedWith',
      ),
      updates: {
        isLoading: RequestStatus.loading,
        options: [],
        customInfoMessage: <></>,
      },
    };
    setInternalRow(updateTableColumn(internalRow, params));
  }, [saveSiteDetailsRequestStatus]);

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
            siteId: row.siteId,
            siteIdAssociatedWith: row.siteIdAssociatedWith,
            guid: row.guid,
          })),
        ]);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter(
            (selectedRow) =>
              !rows.some(
                (row: any) =>
                  selectedRow.siteId === row.siteId &&
                  selectedRow.siteIdAssociatedWith ===
                    row.siteIdAssociatedWith &&
                  selectedRow.guid === row.guid,
              ),
          ),
        );
      }
    } else {
      if (event.property === 'siteIdAssociatedWith') {
        // Parameters for the update
        let params: UpdateDisplayTypeParams = {
          indexToUpdate: associateColumnInternal.findIndex(
            (item) =>
              item.displayType?.graphQLPropertyName === 'siteIdAssociatedWith',
          ),
          updates: {
            isLoading: RequestStatus.loading,
            options: [],
            customInfoMessage: <></>,
          },
        };
        setInternalRow(updateTableColumn(internalRow, params));
        const recordExist = updateForm.find(
          (associate: any) =>
            associate.siteId === event.row.siteId &&
            associate.siteIdAssociatedWith === event.value.trim() &&
            associate.siteIdAssociatedWith !== '',
        );
        if (recordExist !== undefined) {
          setIsRecordExist(recordExist);
          setCurrentRecordId(event.row.guid);
          let infoMsg = (
            <div className="py-2">
              <img
                src={infoIcon}
                alt="info"
                aria-hidden="true"
                role="img"
                aria-label="User image"
              />
              <span
                aria-label={'info-message'}
                className="text-wrap p-2 custom-not-found"
              >
                Site ID: {event.value.trim()} is already selected.
              </span>
            </div>
          );
          params = {
            ...params,
            updates: {
              ...params.updates,
              isLoading: RequestStatus.success,
              customInfoMessage: infoMsg,
            },
          };
          setInternalRow(updateTableColumn(associateColumnInternal, params));
        } else {
          // need some updated array on click of save button on top
          // setUpdateForm(formData);
          setIsRecordExist({});
          setCurrentRecordId('');
        }
        setSearchParam(event.value.trim());
      }
      const updatedAssociatedSites = formData.map((associate) =>
        associate.guid === event.row.guid
          ? { ...associate, [event.property]: event.value }
          : associate,
      );
      setFormData(updatedAssociatedSites);
      // dispatch(updateAssociatedSites(updatedAssociatedSites));

      if (selectedRows.some((row) => row.guid === event.row.guid)) {
        setSelectedRows((prev) =>
          prev.map((row) =>
            row.guid === event.row.guid
              ? { ...row, [event.property]: event.value }
              : row,
          ),
        );
      }
    }
    const currLabel = associateColumnInternal.find(
      (row) => row.graphQLPropertyName === event.property,
    );
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Modified,
          'Associated Sites: ' + currLabel?.displayName,
        ).toPlainObject(),
      ),
    );
  };

  const handleTableSort = (row: any, ascDir: any) => {
    let property = row['graphQLPropertyName'];
    setFormData((prevData) => {
      let updatedAssociatedSites = [...prevData];
      updatedAssociatedSites.sort(function (a: any, b: any) {
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
      return [...updatedAssociatedSites];
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

  const handleRemoveAssociate = (assocIsDelete: boolean = false) => {
    if (assocIsDelete) {
      setFormData((prevData) =>
        prevData.filter(
          (assoc) =>
            !selectedRows.some(
              (row) =>
                row.siteId === assoc.siteId &&
                row.siteIdAssociatedWith === assoc.siteIdAssociatedWith &&
                row.guid === assoc.guid,
            ),
        ),
      );
      dispatch(
        trackChanges(
          new ChangeTracker(
            IChangeType.Deleted,
            'Associated Site',
          ).toPlainObject(),
        ),
      );
      setSelectedRows([]);
      setIsDelete(false);
    } else {
      setIsDelete(true);
    }
  };

  const handleAddAssociate = () => {
    const newAssoc = {
      guid: v4(),
      siteId: id,
      siteIdAssociatedWith: '',
      effectiveDate: '',
      note: '',
      sr: true,
    };
    setFormData((prevData) => [newAssoc, ...prevData]);
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Added,
          'New Associated Site',
        ).toPlainObject(),
      ),
    );
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
      id="associate-component"
      data-testid="associate-component"
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
        <div>
          <AssociateSiteComponent
            handleTableChange={handleTableChange}
            handleWidgetCheckBox={handleWidgetCheckBox}
            userType={userType}
            viewMode={viewMode}
            internalRow={internalRow}
            associateColumnInternalSRandViewMode={
              associateColumnInternalSRandViewMode
            }
            associateColumnExternal={associateColumnExternal}
            formData={formData}
            loading={loading}
            handleTableSort={handleTableSort}
            handleAddAssociate={handleAddAssociate}
            selectedRows={selectedRows}
            handleRemoveAssociate={handleRemoveAssociate}
            srVisibilityAssocConfig={srVisibilityAssocConfig}
            handleItemClick={handleItemClick}
          />
        </div>
      </div>
      {isDelete && (
        <ModalDialog
          key={v4()}
          label={`Are you sure to ${isDelete ? 'delete' : 'replace'} associated site ?`}
          closeHandler={(response) => {
            if (response) {
              if (isDelete) {
                handleRemoveAssociate(response);
              }
            }
            setIsDelete(false);
          }}
        />
      )}
    </div>
  );
};

export default Associate;
