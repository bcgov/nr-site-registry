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
  resultCache,
  UpdateDisplayTypeParams,
  updateTableColumn,
} from '../../../helpers/utility';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import {
  associatedSites,
  fetchAssociatedSites,
  updateAssociatedSites,
} from './AssociateSlice';
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
import {
  getSiteAssociated,
  saveRequestStatus,
  setupSiteAssociationDataForSaving,
} from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';

const Associate = () => {
  const {
    associateColumnExternal,
    associateColumnInternal,
    associateColumnInternalSRandViewMode,
    srVisibilityAssocConfig,
  } = GetAssociateConfig();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const { siteAssociate: sitesAssociated, status } =
    useSelector(associatedSites);
  const resetDetails = useSelector(resetSiteDetails);
  const loggedInUser = getUser();
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const trackAssociatedSite = useSelector(getSiteAssociated);

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<
    { [key: string]: any | [Date, Date] }[]
  >([]);
  const [existingSiteIds, setExistingSiteIds] = useState<
    { key: any; value: any }[]
  >([]);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [selectedRows, setSelectedRows] = useState<
    { siteId: String; siteIdAssociatedWith: string; id: string }[]
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
    dispatch(setupSiteAssociationDataForSaving(sitesAssociated));
  }, [mode]);

  // THIS MAY CHANGE IN FUTURE. NEED TO DISCUSS AS API NEEDS TO BE CALLED AGAIN
  // IF SAVED OR CANCEL BUTTON ON TOP IS CLICKED
  useEffect(() => {
    if (resetDetails) {
      dispatch(fetchAssociatedSites(id ?? ''));
      setExistingSiteIds([]);
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
      setInternalRow((prev) => updateTableColumn(prev, params));
    }
  }, [resetDetails, saveSiteDetailsRequestStatus]);

  const fetchSiteIds = useCallback(async (searchParam: string) => {
    if (searchParam.trim()) {
      try {
        // Check cache first
        if (resultCache[searchParam]) {
          return resultCache[searchParam];
        }
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphqlSearchSiteIdsQuery()),
          variables: { searchParam },
        });

        // Store result in cache if successful
        if (response?.data?.data?.searchSiteIds?.success) {
          resultCache[searchParam] = response.data.data.searchSiteIds;
          return response.data.data.searchSiteIds;
        }
      } catch (error) {
        console.error('Error fetching site ids:', error);
        return [];
      }
    }
    return [];
  }, []);

  useEffect(() => {
    if (status === RequestStatus.success && sitesAssociated) {
      const uniqueSiteIdAssociatedWith: any = Array.from(
        new Map(
          sitesAssociated.map((item: any) => [
            item.siteIdAssociatedWith,
            {
              key: item.siteIdAssociatedWith,
              value: item.siteIdAssociatedWith,
            },
          ]),
        ).values(),
      );
      setExistingSiteIds(uniqueSiteIdAssociatedWith);
      setFormData(sitesAssociated);
    } else {
      setLoading(RequestStatus.loading);
    }
  }, [sitesAssociated, status]);

  useEffect(() => {
    if (Object.keys(isRecordExist).length > 0) {
      const updatedAssocs = formData.map((associate) =>
        associate.id === currentRecordId
          ? { ...associate, siteIdAssociatedWith: '' }
          : associate,
      );
      setFormData(updatedAssocs);
      dispatch(updateAssociatedSites(updatedAssocs));
      setIsRecordExist({});
      setCurrentRecordId('');
      setIsInfoMsg(false);
    }
  }, [isInfoMsg]);

  const createInfoMessage = (msg: string) => (
    <div className="text-wrap">
      <img
        src={infoIcon}
        alt="info"
        aria-hidden="true"
        role="img"
        aria-label="User image"
      />
      <span aria-label={'info-message'} className="px-2 custom-not-found">
        {msg}
      </span>
    </div>
  );

  useEffect(() => {
    if (!searchParam) return;

    const timeoutId = setTimeout(async () => {
      try {
        const indexToUpdate = associateColumnInternal.findIndex(
          (item) =>
            item.displayType?.graphQLPropertyName === 'siteIdAssociatedWith',
        );
        const response = await fetchSiteIds(searchParam);
        let result: any = [];
        let infoMsg = <></>;

        if (!response?.success || response.data.length === 0) {
          infoMsg = createInfoMessage('No results found.');
          setIsInfoMsg(false);
          if (!response?.success) {
            setInternalRow((prev) =>
              updateTableColumn(prev, {
                indexToUpdate,
                updates: {
                  isLoading: RequestStatus.idle,
                  options: [],
                  customInfoMessage: infoMsg,
                },
              }),
            );
            return;
          }
        } else {
          const siteIds = new Set(
            formData.map((obj) => obj.siteIdAssociatedWith),
          );
          result = response.data.filter(
            (item: any) => !siteIds.has(item.value.toString()),
          );

          if (Object.keys(isRecordExist).length > 0) {
            infoMsg = createInfoMessage(
              `Site ID: ${isRecordExist.value} is already selected.`,
            );
            setIsInfoMsg(true);
          } else {
            setIsInfoMsg(false);
            result = response.data;
          }
        }

        setInternalRow((prev) =>
          updateTableColumn(prev, {
            indexToUpdate,
            updates: {
              isLoading: RequestStatus.success,
              options: result,
              customInfoMessage: infoMsg,
            },
          }),
        );
      } catch (error) {
        console.error('Error fetching site IDs:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchParam]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFormData(sitesAssociated);
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
      if (key !== 'id') {
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
            id: row.id,
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
                  selectedRow.id === row.id,
              ),
          ),
        );
      }
    } else {
      const updateAssocSites = (siteAssociated: any, event: any) => {
        return siteAssociated.map((assoc: any) => {
          if (assoc.id === event.row.id) {
            const isSiteAssoc = event.property === 'siteIdAssociatedWith';
            const recordExist = isSiteAssoc
              ? existingSiteIds.find(
                  (associate: any) => associate.value === event.value.trim(),
                )
              : undefined;
            let params: UpdateDisplayTypeParams = {
              indexToUpdate: associateColumnInternal.findIndex(
                (item) =>
                  item.displayType?.graphQLPropertyName ===
                  'siteIdAssociatedWith',
              ),
              updates: {
                isLoading: RequestStatus.loading,
                options: [],
                customInfoMessage: <></>,
              },
            };
            if (isSiteAssoc) {
              setInternalRow((prev) => updateTableColumn(prev, params));
              setExistingSiteIds((prev) => [
                ...prev,
                { key: event.value, value: event.value },
              ]);
              setSearchParam(event.value.trim());
            }
            if (recordExist !== undefined) {
              setIsRecordExist(recordExist);
              setCurrentRecordId(event.row.guid);
            } else {
              setIsRecordExist({});
              setCurrentRecordId('');
            }
            return {
              ...assoc,
              [event.property]: event.value,
              apiAction: assoc?.apiAction ?? UserActionEnum.updated,
              srAction: SRApprovalStatusEnum.Pending,
            };
          }
          return assoc;
        });
      };

      // Update both formData and trackAssociatedSites
      const updatedAssocs = updateAssocSites(formData, event);
      const updatedTrackAssocSite = updateAssocSites(
        trackAssociatedSite,
        event,
      );
      setFormData(updatedAssocs);
      dispatch(updateAssociatedSites(updatedAssocs));
      dispatch(setupSiteAssociationDataForSaving(updatedTrackAssocSite));
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
    }
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
      // Remove selected rows from formData state
      const updateAssocites = (siteAssociated: any) => {
        return siteAssociated.map((assoc: any) => {
          if (
            selectedRows.some(
              (row) =>
                row.siteId === assoc.siteId &&
                row.siteIdAssociatedWith === assoc.siteIdAssociatedWith &&
                row.id === assoc.id,
            )
          ) {
            return {
              ...assoc,
              apiAction: UserActionEnum.deleted, // Mark as deleted
              srAction: SRApprovalStatusEnum.Pending,
            };
          }
          return assoc;
        });
      };

      // Update both formData and trackAssociatedSites
      const updatedAssocs = updateAssocites(formData);
      const updatedTrackAssocSite = updateAssocites(trackAssociatedSite);

      // Filter out assocs based on selectedRows for formData
      const filteredPartics = updatedAssocs.filter(
        (assoc: any) =>
          !selectedRows.some(
            (row) =>
              row.siteId === assoc.siteId &&
              row.siteIdAssociatedWith === assoc.siteIdAssociatedWith &&
              row.id === assoc.id,
          ),
      );
      setFormData(filteredPartics);
      dispatch(updateAssociatedSites(filteredPartics));
      dispatch(setupSiteAssociationDataForSaving(updatedTrackAssocSite));
      const tracker = new ChangeTracker(IChangeType.Deleted, 'Associated Site');
      dispatch(trackChanges(tracker.toPlainObject()));
      setSelectedRows([]);
      setIsDelete(false);
    } else {
      setIsDelete(true);
    }
  };

  const handleAddAssociate = () => {
    const newAssoc = {
      id: v4(),
      siteId: id,
      siteIdAssociatedWith: '',
      effectiveDate: '',
      note: '',
      apiAction: UserActionEnum.added,
      srAction: SRApprovalStatusEnum.Pending,
    };
    setFormData((prevData) => [newAssoc, ...prevData]);
    dispatch(updateAssociatedSites([newAssoc, ...formData]));
    dispatch(
      setupSiteAssociationDataForSaving([newAssoc, ...trackAssociatedSite]),
    );
    dispatch(
      trackChanges(
        new ChangeTracker(
          IChangeType.Added,
          'New Associated Site',
        ).toPlainObject(),
      ),
    );
  };

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
          <Widget
            currentPage={1}
            changeHandler={handleTableChange}
            handleCheckBoxChange={(event: any) => handleWidgetCheckBox(event)}
            title={'Associated Sites'}
            tableColumns={
              userType === UserType.Internal
                ? viewMode == SiteDetailsMode.EditMode
                  ? internalRow
                  : associateColumnInternalSRandViewMode
                : associateColumnExternal
            }
            tableData={formData ?? []}
            tableIsLoading={
              formData && formData.length < 0 ? loading : RequestStatus.idle
            }
            allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
            aria-label="Associated Sites Widget"
            customLabelCss="custom-associate-widget-lbl"
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
            primaryKeycolumnName="id"
            sortHandler={(row: any, ascDir: any) => {
              handleTableSort(row, ascDir);
            }}
          >
            {viewMode === SiteDetailsMode.EditMode &&
              userType === UserType.Internal && (
                <div className="d-flex gap-2 flex-wrap ">
                  <button
                    id="add-associate-btn"
                    className=" d-flex align-items-center associate-btn"
                    type="button"
                    onClick={handleAddAssociate}
                    aria-label={'Add Associated Site'}
                  >
                    <UserPlus className="btn-user-icon" />
                    <span className="associate-btn-lbl">
                      {'Add Associated Site'}
                    </span>
                  </button>

                  <button
                    id="delete-associate-btn"
                    className={`d-flex align-items-center ${selectedRows.length > 0 ? `associate-btn` : `associate-btn-disable`}`}
                    disabled={selectedRows.length <= 0}
                    type="button"
                    onClick={() => handleRemoveAssociate()}
                    aria-label={'Remove Associated Site'}
                  >
                    <UserMinus
                      className={`${selectedRows.length > 0 ? `btn-user-icon` : `btn-user-icon-disabled`}`}
                    />
                    <span
                      className={`${selectedRows.length > 0 ? `associate-btn-lbl` : `associate-btn-lbl-disabled`}`}
                    >
                      {'Remove Associated Site'}
                    </span>
                  </button>
                </div>
              )}
            {viewMode === SiteDetailsMode.SRMode &&
              userType === UserType.Internal && (
                <Actions
                  label="Set SR Visibility"
                  items={srVisibilityAssocConfig}
                  onItemClick={handleItemClick}
                  customCssToggleBtn={
                    false ? `associate-sr-btn` : `associate-sr-btn-disable`
                  }
                  disable={viewMode === SiteDetailsMode.SRMode}
                />
              )}
          </Widget>
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
