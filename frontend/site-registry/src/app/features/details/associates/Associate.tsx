import { ReactNode, useEffect, useState } from 'react';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import { getAxiosInstance, getUser } from '../../../helpers/utility';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { associatedSites, updateAssociatedSites } from './AssociateSlice';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { RequestStatus } from '../../../helpers/requests/status';
import './Associate.css';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import Widget from '../../../components/widget/Widget';
import Actions from '../../../components/action/Actions';
import { UserMinus, UserPlus } from '../../../components/common/icon';
import { v4 } from 'uuid';
import { useParams } from 'react-router-dom';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import { graphqlSearchSiteIdsQuery } from '../../site/graphql/Associate';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { GetAssociateConfig } from './AssociateConfig';
import infoIcon from '../../../images/info-icon.png';

const Associate = () => {
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
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [selectedRows, setSelectedRows] = useState<
    { siteId: String; siteIdAssociatedWith: string; guid: string }[]
  >([]);
  const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
  const [isListloading, setisListLoading] = useState<RequestStatus>(
    RequestStatus.loading,
  );
  const [searchParam, setSearchParam] = useState('');
  const [internalRow, setInternalRow] = useState(associateColumnInternal);
  const [isDelete, setIsDelete] = useState(false);

  // const { associateColumnInternal, srVisibilityAssocConfig} = GetConfig();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const mode = useSelector(siteDetailsMode);
  const sitesAssociated = useSelector(associatedSites);
  const resetDetails = useSelector(resetSiteDetails);
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
      setFormData(sitesAssociated);
    }
  }, [resetDetails]);

  useEffect(() => {
    setFormData(sitesAssociated);
  }, [id]);

  const clearSearch = () => {
    setSearchTerm('');
    setFormData(sitesAssociated);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    const filteredData =
      sitesAssociated &&
      sitesAssociated.filter((associate: any) => {
        return deepSearch(associate, searchTerm.toLowerCase().trim());
      });
    setFormData(filteredData);
  };

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
        throw new Error('Invalid searchParam'); // Handle invalid input
      }
    } catch (error) {
      throw error;
    }
  };

  const [isRecordExist, setIsRecordExist] = useState<{ [key: string]: any }>(
    {},
  );
  const [isInfoMsg, setIsInfoMsg] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState('');

  useEffect(() => {
    if (Object.keys(isRecordExist).length > 0) {
      setFormData((prev) =>
        prev.map((associate) => {
          if (associate.guid === currentRecordId) {
            return { ...associate, ['siteIdAssociatedWith']: '' };
          }
          return associate;
        }),
      );
      setIsRecordExist({});
      setCurrentRecordId('');
      setIsInfoMsg(false);
    }
  }, [isInfoMsg]);

  useEffect(() => {
    let infoMsg: ReactNode = <></>;
    if (
      searchParam !== null &&
      searchParam !== undefined &&
      searchParam !== ''
    ) {
      const getData = setTimeout(async () => {
        try {
          const response = await fetchSiteIds(searchParam);
          if (response && response?.success) {
            const siteIds = formData.map((obj) => obj.siteIdAssociatedWith);
            let result: [];
            // response.data.filter((item: any) => !siteIds.includes(item.value.toString()));

            if (response && response.data.length === 0) {
              result = [];
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
                    Site ID: {isRecordExist.siteIdAssociatedWith} is alreday
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
            const updatedInternlRows =
              associateColumnInternal &&
              associateColumnInternal.map((item) => {
                if (
                  item.displayType?.graphQLPropertyName ===
                  'siteIdAssociatedWith'
                ) {
                  return {
                    ...item,
                    displayType: {
                      ...item.displayType,
                      options: result ?? response.data, // Fallback to existing options if dropdownDto is not found
                      customInfoMessage: infoMsg,
                    },
                  };
                }
                return item;
              });
            setInternalRow(updatedInternlRows);
            setisListLoading(RequestStatus.success);
          } else {
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
            const updatedInternlRows =
              associateColumnInternal &&
              associateColumnInternal.map((item) => {
                if (
                  item.displayType?.graphQLPropertyName ===
                  'siteIdAssociatedWith'
                ) {
                  return {
                    ...item,
                    displayType: {
                      ...item.displayType,
                      options: [], // Fallback to existing options if dropdownDto is not found
                      customInfoMessage: infoMsg,
                    },
                  };
                }
                return item;
              });
            setInternalRow(updatedInternlRows);
            setisListLoading(RequestStatus.success);
          }
        } catch (error) {
          throw new Error('Invalid searchParam'); // Handle invalid input
        }
      }, 2000);
      return () => clearTimeout(getData);
    }
  }, [searchParam]);

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
    }
    // const isExist = formData.some(
    //   (associate: any) =>
    //     associate.siteId === event.row.siteId &&
    //     associate.siteIdAssociatedWith === event.row.siteIdAssociatedWith,
    // );
    // if (isExist && event.property.includes('select_row')) {
    //   // Update selectedRows state based on checkbox selection
    //   if (event.value) {
    //     setSelectedRows((prevSelectedRows) => [
    //       ...prevSelectedRows,
    //       {
    //         siteId: event.row.siteId,
    //         siteIdAssociatedWith: event.row.siteIdAssociatedWith,
    //         guid: event.row.guid,
    //       },
    //     ]);
    //   } else {
    //     setSelectedRows((prevSelectedRows) =>
    //       prevSelectedRows.filter(
    //         (row) =>
    //           !(
    //             row.siteId === event.row.siteId &&
    //             row.siteIdAssociatedWith === event.row.siteIdAssociatedWith &&
    //             row.guid === event.row.guid
    //           ),
    //       ),
    //     );
    //   }
    // }
    else {
      if (event.property === 'siteIdAssociatedWith') {
        const recordExist = formData.find(
          (associate: any) =>
            associate.siteId === event.row.siteId &&
            associate.siteIdAssociatedWith === event.value.trim(),
        );
        if (recordExist !== undefined) {
          setIsRecordExist(recordExist);
          setCurrentRecordId(event.row.guid);
        } else {
          setIsRecordExist({});
          setCurrentRecordId('');
        }
        setisListLoading(RequestStatus.loading);
        setSearchParam(event.value.trim());
      }
      const updatedAssociatedSites = formData.map((associate) => {
        if (associate.guid === event.row.guid) {
          return { ...associate, [event.property]: event.value };
        }
        return associate;
      });
      setFormData(updatedAssociatedSites);
      // dispatch(updateAssociatedSites(updatedAssociatedSites));
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
      associateColumnInternal &&
      associateColumnInternal.find(
        (row: any) => row.graphQLPropertyName === event.property,
      );
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Associated Sites: ' + currLabel?.displayName,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  // need to do this tomorrow??
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
      setFormData((prevData) => {
        return prevData.filter(
          (assoc) =>
            !selectedRows.some(
              (row) =>
                row.siteId === assoc.siteId &&
                row.siteIdAssociatedWith === assoc.siteIdAssociatedWith &&
                row.guid === assoc.guid,
            ),
        );
      });
      const tracker = new ChangeTracker(IChangeType.Deleted, 'Associated Site');
      dispatch(trackChanges(tracker.toPlainObject()));
      // Clear selectedRows state
      setSelectedRows([]);
      setIsDelete(false);
    } else {
      setIsDelete(true);
    }
  };

  const handleAddAssociate = () => {
    const newAssocs = {
      guid: v4(),
      siteId: id,
      siteIdAssociatedWith: '',
      effectiveDate: '',
      note: '',
      sr: true,
    };
    setFormData((prevData) => [newAssocs, ...prevData]);
    const tracker = new ChangeTracker(IChangeType.Added, 'New Associated Site');
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const closeSearch = (event: any) => {
    handleTableChange({ ...event, value: '' });
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
            onClickLeftIcon={closeSearch}
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
            isListLoading={isListloading}
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
            primaryKeycolumnName="guid"
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
