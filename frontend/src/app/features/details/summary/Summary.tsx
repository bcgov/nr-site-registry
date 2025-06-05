import React, { useEffect, useState } from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
// @ts-ignore
import Map from '../../../../../node_modules/react-parcelmap-bc/dist/Map';
import SummaryForm from '../SummaryForm';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { AppDispatch } from '../../../Store';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSitesDetails,
  resetSiteDetails,
  selectSiteDetails,
  selectSiteInsights,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import { RequestStatus } from '../../../helpers/requests/status';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { TableColumn } from '../../../components/table/TableColumn';
import { CustomPillButton } from '../../../components/simple/CustomButtons';
import Table from '../../../components/table/Table';
import './Summary.css';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import SearchInput from '../../../components/search/SearchInput';
import {
  DropdownIcon,
  FolderPlusIcon,
  ShoppingCartIcon,
} from '../../../components/common/icon';
import {
  addCartItem,
  addCartItemRequestStatus,
  fetchCartItems,
  resetCartItemAddedStatus,
} from '../../cart/CartSlice';
import { getUser, isUserOfType, UserRoleType } from '../../../helpers/utility';
import { useAuth } from 'react-oidc-context';
import {
  getSiteSummaryEdits,
  setupSiteSummaryForSaving,
  saveRequestStatus,
} from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';

import { useParams } from 'react-router-dom';
import SummaryInfo from './SummaryInfo';
import { hasUserPurchasedSnapshot } from '../snapshot/SnapshotSlice';
import { UserType } from '../../../helpers/requests/userType';
import AddToFolio from '../../folios/AddToFolio';
import { Button } from '../../../components/button/Button';

const Summary = () => {
  const auth = useAuth();

  const isUserPurchasedSite = useSelector(hasUserPurchasedSnapshot);

  const user = getUser();
  const addCartItemStatus = useSelector(addCartItemRequestStatus);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isUserOfType(UserRoleType.CLIENT) && user !== null) {
      dispatch(fetchCartItems());
    }
  }, [addCartItemStatus]);
  const { id } = useParams();

  const [parcelSearchTerm, SetParcelSearchTeam] = useState('');

  setTimeout(() => {
    let address = document.getElementsByTagName('h3');
    address.length > 0 && address[0] && address[0].remove();
  }, 1000);

  setTimeout(() => {
    let address = document.getElementsByTagName('h3');
    address.length > 0 && address[0] && address[0].remove();
  }, 2000);

  setTimeout(() => {
    let address = document.getElementsByTagName('h3');
    address.length > 0 && address[0] && address[0].remove();
  }, 3000);

  const detailsMode = useSelector(siteDetailsMode);
  let details = useSelector(selectSiteDetails);
  const savedEdits = useSelector(getSiteSummaryEdits);
  const insights = useSelector(selectSiteInsights);

  const [editSiteDetailsObject, setEditSiteDetailsObject] = useState(details);

  const resetDetails = useSelector(resetSiteDetails);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);

  useEffect(() => {
    if (savedEdits) {
      setEditSiteDetailsObject(savedEdits);
    }
  }, [savedEdits]);
  useEffect(() => {
    if (resetDetails) {
      setEditSiteDetailsObject(details);
    }
  }, [resetDetails]);

  useEffect(() => {
    if (saveSiteDetailsRequestStatus === RequestStatus.success) {
      setEditSiteDetailsObject(details);
    } else if (savedEdits) {
      setEditSiteDetailsObject(savedEdits);
    } else {
      setEditSiteDetailsObject(details);
    }
  }, [savedEdits, details, saveSiteDetailsRequestStatus]);

  const [edit, setEdit] = useState(false);
  const [srMode, setSRMode] = useState(false);

  useEffect(() => {
    if (detailsMode === SiteDetailsMode.EditMode) {
      setEdit(true);
      setSRMode(false);
    } else if (detailsMode === SiteDetailsMode.SRMode) {
      setSRMode(true);
      setEdit(false);
    } else {
      setEdit(false);
      setSRMode(false);
    }
  }, [detailsMode]);

  // State Initializations
  const initialParcelIds = [0];

  useEffect(() => {
    let address = document.getElementsByTagName('h3');
    address.length > 0 && address[0] && address[0].remove();
  }, [details]);

  const [parcelIds, setParcelIds] = useState(initialParcelIds);

  // Utility Functions
  const getTrackerLabel = (graphQLPropertyName: any) => {
    if (graphQLPropertyName === 'id') return 'Site ID';
    if (graphQLPropertyName.includes('addr')) return 'Address';
    if (graphQLPropertyName.includes('common')) return 'Common Name';
    if (graphQLPropertyName.includes('region')) return 'Region';
    return graphQLPropertyName;
  };

  const handleInputChange = (graphQLPropertyName: any, value: any) => {
    const trackerLabel = getTrackerLabel(graphQLPropertyName);
    if (detailsMode === SiteDetailsMode.SRMode) {
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'Site Location Details SR Mode For ' + trackerLabel,
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    } else {
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'Site Location Details ' + trackerLabel,
      );
      dispatch(trackChanges(tracker.toPlainObject()));

      if (
        graphQLPropertyName === 'latMinutes' ||
        graphQLPropertyName === 'longMinutes' ||
        graphQLPropertyName === 'latDegrees' ||
        graphQLPropertyName === 'longDegrees'
      ) {
        value = parseFloat(value);
      } else {
        // do nothing
      }

      const newState = {
        ...editSiteDetailsObject,
        [graphQLPropertyName]: value,
      };

      dispatch(
        setupSiteSummaryForSaving({
          ...newState,
          userAction: UserActionEnum.updated,
          srAction: SRApprovalStatusEnum.Pending,
        }),
      );

      setEditSiteDetailsObject(newState);
    }
  };

  const handleParcelIdDelete = (pid: any) => {
    const tracker = new ChangeTracker(IChangeType.Deleted, 'Parcel ID ' + pid);
    dispatch(trackChanges(tracker.toPlainObject()));
    setParcelIds(parcelIds.filter((x) => x !== pid));
  };

  const handleAddNewParcelId = (pid: string) => {
    const tracker = new ChangeTracker(IChangeType.Added, 'Parcel ID ' + pid);
    dispatch(trackChanges(tracker.toPlainObject()));
    let parcelIdsLocal = [...parcelIds, parseInt(pid)];
    //parcelIdsLocal.push();
    setParcelIds(parcelIdsLocal);
  };

  const data: any = [];

  const activityData: any = [];

  const columns: TableColumn[] = [
    {
      id: 4,
      displayName: 'Notations',
      active: true,
      graphQLPropertyName: 'eventCount',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'eventCount',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 5,
      displayName: 'Participants',
      active: true,
      graphQLPropertyName: 'eventParticCount',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'eventParticCount',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 1,
      displayName: 'Documents',
      active: true,
      graphQLPropertyName: 'siteDocCount',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'siteDocCount',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 2,
      displayName: 'Land Uses',
      active: true,
      graphQLPropertyName: 'landHistoryCount',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'landHistoryCount',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 3,
      displayName: 'Associated Sites',
      active: true,
      graphQLPropertyName: 'siteAssocCount',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'siteAssocCount',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },

    {
      id: 6,
      displayName: 'Parcel Description',
      active: true,
      graphQLPropertyName: 'siteSubdivCount',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'siteSubdivCount',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
  ];

  const activityColumns: TableColumn[] = [
    {
      id: 1,
      displayName: 'Activity',
      active: true,
      graphQLPropertyName: 'activity',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'activity',
        value: '',

        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 2,
      displayName: 'User',
      active: true,
      graphQLPropertyName: 'user',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'user',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 3,
      displayName: 'Time Stamp',
      active: true,
      graphQLPropertyName: 'timeStamp',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'timeStamp',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
    {
      id: 4,
      displayName: 'SR',
      active: true,
      graphQLPropertyName: 'id',
      displayType: {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'id',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-lbl-text',
        customInputTextCss: 'custom-input-text',
        tableMode: true,
      },
    },
  ];

  const handleAddToCart = () => {
    dispatch(resetCartItemAddedStatus);
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      dispatch(resetCartItemAddedStatus(null));
      dispatch(
        addCartItem([
          {
            siteId: editSiteDetailsObject.id,
            price: 200.11,
          },
        ]),
      ).unwrap();
    }
  };

  return (
    <div className="summary-section-details">
      <SummaryInfo
        siteData={editSiteDetailsObject}
        edit={edit}
        srMode={srMode}
        handleInputChange={handleInputChange}
      />

      {/* {
        <PanelWithUpDown
          label="Parcel ID(s)"
          secondChild={
            !edit ? (
              <div>{parcelIds.join(', ')}</div>
            ) : (
              <div className="parcel-container">
                <div>
                  <SearchInput
                    label={''}
                    searchTerm={parcelSearchTerm}
                    clearSearch={() => {
                      SetParcelSearchTeam('');
                    }}
                    handleSearchChange={(e) => {
                      SetParcelSearchTeam(e.target.value || '');
                    }}
                    options={['1213', '12313', '123132']}
                    optionSelectHandler={(value) => {
                      handleAddNewParcelId(value);
                    }}
                    createNewLabel=" Parcel ID"
                    createNewHandler={handleAddNewParcelId}
                  />
                </div>
                <div className="parcel-edit-div">
                  {parcelIds.map((pid) => (
                    <CustomPillButton
                      key={pid}
                      label={pid}
                      clickHandler={() => handleParcelIdDelete(pid)}
                    />
                  ))}
                </div>
              </div>
            )
          }
        />
      } */}

      {
        <div className="">
          <div className="summary-details-border">
            <span className="summary-details-header">Summary Details</span>
          </div>
          <div className="col-12 overflow-auto w-100">
            <Table
              label="Summary Details"
              isLoading={RequestStatus.success}
              columns={columns}
              data={[insights]}
              totalResults={data.length}
              allowRowsSelect={false}
              showPageOptions={false}
              changeHandler={() => {}}
              editMode={false}
              idColumnName="id"
            />
          </div>
        </div>
      }

      {/* {isUserPurchasedSite && (
        <div className="summary-details-border">
          <span className="summary-details-header">Activity Log</span>
          <div className="col-12">
            <Table
              label="Activity Log"
              isLoading={RequestStatus.success}
              columns={activityColumns}
              data={activityData}
              totalResults={activityData.length}
              allowRowsSelect={false}
              showPageOptions={false}
              changeHandler={() => {}}
              editMode={false}
              idColumnName="id"
            />
          </div>
        </div>
      )} */}

      {isUserOfType(UserRoleType.CLIENT) && !isUserPurchasedSite && (
        <div className="external-purchase-section">
          <div className="external-purchase-info">
            <span>
              In order to view this site’s details, please purchase access using
              the button below.
            </span>
          </div>
          <div className="external-purchase-buttons">
            <Button onClick={handleAddToCart}>
              <ShoppingCartIcon /> Purchase Site Details
            </Button>
            {id && (
              <AddToFolio
                selectedSiteIds={[id]}
                label="Add to Folio"
                popupPlacement="top-start"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
