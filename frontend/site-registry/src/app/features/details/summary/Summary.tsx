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
import { getUser } from '../../../helpers/utility';
import { useAuth } from 'react-oidc-context';
import { setupSiteSummaryForSaving } from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';

import { useParams } from 'react-router-dom';
import SummaryInfo from './SummaryInfo';

const Summary = () => {
  const auth = useAuth();

  const user = getUser();
  const addCartItemStatus = useSelector(addCartItemRequestStatus);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCartItems(user?.profile.sub ? user.profile.sub : ''));
  }, [addCartItemStatus]);
  const { id } = useParams();

  // useEffect(() => {
  //   console.log("Calling From Summary")
  //   if (id)
  //     dispatch(
  //       fetchSitesDetails({ siteId: id ?? '', showPending: showPending }),
  //     );
  // }, [id]);

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
  const details = useSelector(selectSiteDetails);
  const [editSiteDetailsObject, setEditSiteDetailsObject] = useState(details);
  const resetDetails = useSelector(resetSiteDetails);
  useEffect(() => {
    console.log('Change in resetDetails');
    if (resetDetails) {
      setEditSiteDetailsObject(details);
    }
  }, [resetDetails]);

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
  const initialParcelIds = [
    12123123, 123123, 12312312, 1231231, 23, 123123123123, 123123213, 1123123,
  ];

  const [location, setLocation] = useState([48.46762, -123.25458]);

  useEffect(() => {
    console.log('Change in details');
    let address = document.getElementsByTagName('h3');
    address.length > 0 && address[0] && address[0].remove();
    setEditSiteDetailsObject(details);
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
      console.log(newState);

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

  const data = [
    {
      notation: 1,
      participants: 3,
      associatedSites: 1,
      documents: 1,
      landUses: 5,
      parcelDescription: 10,
    },
  ];

  const activityData = [
    {
      id: 1,
      activity: 'some activity',
      user: 'Midhun',
      timeStamp: '23-04-1989 00:11:11',
    },
  ];

  const columns: TableColumn[] = [
    {
      id: 4,
      displayName: 'Notations',
      active: true,
      graphQLPropertyName: 'notation',
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
    {
      id: 5,
      displayName: 'Participants',
      active: true,
      graphQLPropertyName: 'participants',
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
    {
      id: 1,
      displayName: 'Documents',
      active: true,
      graphQLPropertyName: 'documents',
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
    {
      id: 2,
      displayName: 'Land Uses',
      active: true,
      graphQLPropertyName: 'landUses',
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
    {
      id: 3,
      displayName: 'Associated Sites',
      active: true,
      graphQLPropertyName: 'associatedSites',
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

    {
      id: 6,
      displayName: 'Parcel Description',
      active: true,
      graphQLPropertyName: 'parcelDescription',
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
            userId: loggedInUser.profile.sub,
            siteId: editSiteDetailsObject.id,
            whoCreated: loggedInUser?.profile.given_name ?? '',
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
        location={location}
        edit={edit}
        srMode={srMode}
        handleInputChange={handleInputChange}
      />

      {
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
                      if (e.target) {
                        SetParcelSearchTeam(e.target.value);
                      } else {
                        SetParcelSearchTeam(e);
                      }
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
      }

      {
        <div className="">
          <div className="summary-details-border">
            <span className="summary-details-header">
              Summary of details types
            </span>
          </div>
          <div className="col-12">
            <Table
              label="Search Results"
              isLoading={RequestStatus.success}
              columns={columns}
              data={data}
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

      {false && (
        <div className="summary-details-border">
          <span className="summary-details-header">Activity Log</span>
          <div className="col-12">
            <Table
              label="Search Results"
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
      )}

      {
        <div className="external-purchase-section">
          <div className="external-purchase-info">
            <span>
              In order to view this site’s details, please purchase access using
              the button below.
            </span>
          </div>
          <div className="external-purchase-buttons">
            <button className="d-flex btn-cart align-items-center">
              <ShoppingCartIcon className="btn-icon" />
              <span className="btn-cart-lbl" onClick={() => handleAddToCart()}>
                {' '}
                Add to Cart
              </span>
            </button>
            <button className="d-flex btn-folio align-items-center">
              <FolderPlusIcon className="btn-folio-icon" />
              <span className="btn-folio-lbl"> Add to Folio</span>
              <DropdownIcon className="btn-folio-icon" />
            </button>
          </div>
        </div>
      }
    </div>
  );
};

export default Summary;
