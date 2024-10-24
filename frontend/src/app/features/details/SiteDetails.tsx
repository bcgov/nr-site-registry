import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import {
  AngleLeft,
  DropdownIcon,
  FolderPlusIcon,
  ShoppingCartIcon,
  SpinnerIcon,
} from '../../components/common/icon';
import {
  fetchSitesDetails,
  selectSiteDetails,
  trackedChanges,
  clearTrackChanges,
  siteDetailsMode,
  updateSiteDetailsMode,
} from '../site/dto/SiteSlice';
import { AppDispatch } from '../../Store';
import NavigationPills from '../../components/navigation/navigationpills/NavigationPills';
import {
  getDropDownNavItems,
  getNavComponents,
  getNavItems,
} from './navigation/NavigationPillsConfig';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import {
  CancelButton,
  SaveButton,
} from '../../components/simple/CustomButtons';
import { IChangeType } from '../../components/common/IChangeType';

import './SiteDetails.css'; // Ensure this import is correct
import { SiteDetailsMode } from './dto/SiteDetailsMode';
import { UserType } from '../../helpers/requests/userType';
import Actions from '../../components/action/Actions';
import { ActionItems } from '../../components/action/ActionsConfig';
import {
  formatDate,
  formatDateWithNoTimzoneName,
  getUser,
  showNotification,
} from '../../helpers/utility';
import { addRecentView } from '../dashboard/DashboardSlice';
import { fetchSiteParticipants } from './participants/ParticipantSlice';
import { fetchSiteDisclosure } from './disclosure/DisclosureSlice';
import { addCartItem, resetCartItemAddedStatus } from '../cart/CartSlice';
import { useAuth } from 'react-oidc-context';
import { fetchNotationParticipants } from './notations/NotationSlice';
import { fetchDocuments } from './documents/DocumentsSlice';
import SearchInput from '../../components/search/SearchInput';
import {
  addSiteToFolio,
  addSiteToFolioRequest,
  fetchFolioItems,
  folioItems,
  resetFolioItemAddedStatus,
} from '../folios/redux/FolioSlice';
import { Folio, FolioContentDTO } from '../folios/dto/Folio';
import {
  fetchSnapshots,
  snapshots,
  getFirstSnapshotCreatedDate,
  selectBannerType,
  getBannerType,
} from './snapshot/SnapshotSlice';
import { RequestStatus } from '../../helpers/requests/status';
import {
  fetchMinistryContact,
  fetchNotationClassCd,
  fetchNotationParticipantRoleCd,
  fetchNotationTypeCd,
  fetchParticipantRoleCd,
  fetchPeopleOrgsCd,
} from './dropdowns/DropdownSlice';
import {
  FormFieldType,
  IFormField,
} from '../../components/input-controls/IFormField';
import BannerDetails from '../../components/banners/BannerDetails';
import {
  resetSaveSiteDetails,
  resetSaveSiteDetailsRequestStatus,
  saveRequestStatus,
  saveSiteDetails,
  setupSiteIdForSaving,
} from './SaveSiteDetailsSlice';
import { fetchAssociatedSites } from './associates/AssociateSlice';
import { updateRequestStatus } from './srUpdates/srUpdatesSlice';

const SiteDetails = () => {
  const [navItems, SetNavItems] = useState<string[] | undefined>();
  const [navComponents, SetNavComponents] = useState<JSX.Element[]>();
  const [dropDownNavItems, SetDropDownNavItems] =
    useState<{ label: string; value: string }[]>();

  const auth = useAuth();

  useEffect(() => {
    SetNavComponents(getNavComponents());
    SetNavItems(getNavItems());
    SetDropDownNavItems(getDropDownNavItems());
  }, [auth.user]);

  const [folioSearchTerm, SetFolioSearchTeam] = useState('');

  const folioDetails = useSelector(folioItems);

  const addSiteToFolioRequestStatus = useSelector(addSiteToFolioRequest);

  const handleFolioSelect = (folioId: string) => {
    let selectedFolio = folioDetails.filter(
      (x: any) => x.folioId === folioId,
    )[0];
    let dto: FolioContentDTO = {
      siteId: details.id,
      folioId: selectedFolio.id + '',
      id: parseInt(selectedFolio.id),
      whoCreated: loggedInUser?.profile.given_name ?? '',
      userId: loggedInUser?.profile.sub ?? '',
    };
    dispatch(addSiteToFolio([dto])).unwrap();
  };

  useEffect(() => {
    if (addSiteToFolioRequestStatus === RequestStatus.success) {
      //dispatch(resetFolioItemAddedStatus(null));
      showNotification(
        addSiteToFolioRequestStatus,
        'Successfully added site to folio',
        'Unable to add to folio',
      );
    }
  }, [addSiteToFolioRequestStatus]);

  const folioDropdown: IFormField = {
    type: FormFieldType.DropDownWithSearch,
    label: '',
    isLabel: false,
    graphQLPropertyName: 'folioId',
    placeholder: 'Please enter folio .',
    value: '',
    options: [],
    colSize: 'col-lg-6 col-md-6 col-sm-12',
    customLabelCss: 'custom-participant-lbl-text',
    customInputTextCss: 'custom-participant-input-text',
    customEditLabelCss: 'custom-participant-edit-label',
    customEditInputTextCss: 'custom-participant-edit-input',
    tableMode: true,
  };

  const arr: IFormField[] = [folioDropdown];

  const arr2: IFormField[][] = [arr];

  const [addToFolioVisible, SetAddToFolioVisible] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const snapshot = useSelector(snapshots);
  const snapshotTakenDate = useSelector(getFirstSnapshotCreatedDate);
  const bannerType = useSelector(selectBannerType);
  const [edit, setEdit] = useState(false);
  const [showLocationDetails, SetShowLocationDetails] = useState(false);
  const [showParcelDetails, SetShowParcelDetails] = useState(false);
  const [save, setSave] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const srUpdateRequestStatus = useSelector(updateRequestStatus);

  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);

  useEffect(() => {
    if (
      saveSiteDetailsRequestStatus === RequestStatus.success ||
      saveSiteDetailsRequestStatus === RequestStatus.failed
    ) {
      if (saveSiteDetailsRequestStatus === RequestStatus.success) {
        dispatch(resetSaveSiteDetails(null));
        dispatch(clearTrackChanges(null));
        dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
        setEdit(false);
      } else {
        // dont close edit mode
      }

      showNotification(
        saveSiteDetailsRequestStatus,
        'Successfully saved site details',
        'Failed To save site details',
      );
      dispatch(resetSaveSiteDetailsRequestStatus(null));
    } else {
      // do nothing
    }
  }, [saveSiteDetailsRequestStatus]);

  const navigate = useNavigate();
  const onClickBackButton = () => {
    navigate(-1);
  };

  const { id } = useParams();

  const details = useSelector(selectSiteDetails);

  const loggedInUser = getUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        // Adjust the scroll position as needed
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    dispatch(fetchFolioItems(loggedInUser?.profile.sub ?? ''));
  }, []);

  const savedChanges = useSelector(trackedChanges);
  const mode = useSelector(siteDetailsMode);

  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  // NEEDS TO FETCH DATA BASED ON CONDITION WHEATHER IT IS EXTERNAL USER OR INTERNAL USER
  // BY DOING THIS WE CAN STOP UNNECCESSARY CALL TO DATABASE
  // THERE ARE SOME CALLS WHICH MAY NOT REQUIRED ON DETAILS PAGE.
  useEffect(() => {
    console.log('Calling From Site Details');
    setIsLoading(true); // Set loading state to true before starting API calls
    if (id) {
      dispatch(resetSaveSiteDetails(null));
      dispatch(setupSiteIdForSaving(id));
      Promise.all([
        dispatch(fetchSnapshots(id ?? '')),
        userType === UserType.External
          ? dispatch(getBannerType(id ?? ''))
          : Promise.resolve(),
        dispatch(fetchMinistryContact('EMP')),
        dispatch(fetchNotationClassCd()),
        dispatch(fetchNotationTypeCd()),
        dispatch(fetchNotationParticipantRoleCd()),
        dispatch(fetchParticipantRoleCd()),
        dispatch(
          fetchSiteParticipants({ siteId: id ?? '', showPending: false }),
        ),
        dispatch(
          fetchNotationParticipants({ siteId: id ?? '', showPending: false }),
        ),
        dispatch(fetchDocuments({ siteId: id ?? '', showPending: false })),
        dispatch(
          fetchAssociatedSites({ siteId: id ?? '', showPending: false }),
        ),
        dispatch(fetchSiteDisclosure({ siteId: id ?? '', showPending: false })),
        // should be based on condition for External and Internal User.
        dispatch(fetchSitesDetails({ siteId: id ?? '', showPending: false })),
        // dispatch(fetchNotationParticipants({ siteId: id ?? '', showPending: false})),
      ])
        .then(() => {
          setIsLoading(false); // Set loading state to false after all API calls are resolved
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (srUpdateRequestStatus === RequestStatus.success) {
      if (id) {
        Promise.all([
          dispatch(fetchSitesDetails({ siteId: id ?? '', showPending: false })),
        ])
          .then(() => {
            setIsLoading(false); // Set loading state to false after all API calls are resolved
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }
    }
  }, [srUpdateRequestStatus]);

  useEffect(() => {
    if (details && details.id === id) {
      handleAddRecentView(details);
    }
  }, [details]);

  const handleItemClick = (value: string) => {
    switch (value) {
      case SiteDetailsMode.EditMode:
        setEdit(true);
        setViewMode(SiteDetailsMode.EditMode);
        dispatch(updateSiteDetailsMode(SiteDetailsMode.EditMode));
        break;
      case SiteDetailsMode.SRMode:
        setEdit(true);
        setViewMode(SiteDetailsMode.SRMode);
        dispatch(updateSiteDetailsMode(SiteDetailsMode.SRMode));
        break;
      case SiteDetailsMode.ViewOnlyMode:
        setEdit(false);
        setViewMode(SiteDetailsMode.ViewOnlyMode);
        dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
        break;
      default:
        break;
    }
  };

  const handleCancelButton = () => {
    dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
    dispatch(clearTrackChanges({}));
    setSave(false);
    setEdit(false);
  };

  const handleAddRecentView = async (details: any) => {
    try {
      if (details) {
        await dispatch(
          addRecentView({
            userId: loggedInUser?.profile.preferred_username ?? '',
            siteId: details.id,
            address: details.addrLine_1,
            city: details.city,
            generalDescription: details.generalDescription,
            whenUpdated: new Date(details.whenUpdated),
          }),
        );
      }
    } catch (error) {
      throw error;
    }
  };
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
            siteId: details.id,
            whoCreated: loggedInUser.profile.given_name ?? '',
            price: 200.11,
          },
        ]),
      ).unwrap();
    }
  };

  if (isLoading || snapshot.status === RequestStatus.loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner-container">
          <SpinnerIcon data-testid="loading-spinner" className="site-fa-spin" />
        </div>
      </div>
    );
  }
  if (snapshot.status === RequestStatus.failed)
    return <div>Error: {snapshot.error || 'Failed to load data'}</div>;

  return (
    <>
      {isVisible && (
        <div className="d-flex justify-content-between custom-sticky-header w-100">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <button
              className="d-flex btn-back align-items-center me-3"
              onClick={onClickBackButton}
            >
              <AngleLeft className="btn-icon" />
              <span className="btn-back-lbl">Back </span>
            </button>
            <div className="d-flex  flex-wrap  align-items-center gap-2 pe-3 custom-sticky-header-lbl">
              Site ID:{' '}
              <span className="custom-sticky-header-txt">{id ?? ''}</span>
              <span className="d-flex align-items-center justify-content-center px-2 custom-dot">
                .
              </span>
              <div className="custom-sticky-header-lbl">
                <span>{details && details.addrLine_1}</span>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2 justify-align-center pe-2 position-relative">
            {/* For Action Dropdown*/}
            {!edit &&
              viewMode === SiteDetailsMode.ViewOnlyMode &&
              userType === UserType.Internal && (
                <Actions
                  label="Action"
                  items={ActionItems}
                  onItemClick={handleItemClick}
                />
              )}

            {/* For Edit / SR Dropdown*/}
            <div className="d-flex gap-3 align-items-center">
              {edit && userType === UserType.Internal && (
                <>
                  <CustomLabel
                    labelType="c-b"
                    label={`${viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`}
                  />
                  <SaveButton clickHandler={() => setSave(true)} />
                  <CancelButton clickHandler={handleCancelButton} />
                </>
              )}
            </div>

            {/* For Cart /Folio Controls*/}
            {!edit &&
              viewMode === SiteDetailsMode.ViewOnlyMode &&
              userType === UserType.External && (
                <>
                  <div
                    className="d-flex btn-cart align-items-center "
                    onClick={() => handleAddToCart()}
                  >
                    <ShoppingCartIcon className="btn-icon" />
                    <span className="btn-cart-lbl"> Add to Cart</span>
                  </div>
                  <div
                    className="d-flex btn-folio align-items-center"
                    onClick={() => {
                      SetAddToFolioVisible(!addToFolioVisible);
                    }}
                  >
                    <FolderPlusIcon className="btn-folio-icon" />
                    <span className="btn-folio-lbl"> Add to Folio</span>
                    <DropdownIcon className="btn-folio-icon" />
                  </div>
                  {addToFolioVisible && (
                    <div className="pos-absolute">
                      <SearchInput
                        label={'Search Folios'}
                        placeHolderText={'Search Folios'}
                        searchTerm={folioSearchTerm}
                        clearSearch={() => {
                          SetFolioSearchTeam('');
                          //SetAddToFolioVisible(false);
                        }}
                        handleSearchChange={(e) => {
                          if (e.target) {
                            SetFolioSearchTeam(e.target.value);
                          } else {
                            SetFolioSearchTeam(e);
                          }
                        }}
                        options={folioDetails
                          .filter(
                            (y: any) =>
                              y.folioId
                                .toLowerCase()
                                .indexOf(folioSearchTerm.toLowerCase()) !== -1,
                          )
                          .map((x: any) => x.folioId)}
                        optionSelectHandler={(value) => {
                          handleFolioSelect(value);
                          SetAddToFolioVisible(false);
                        }}
                      />
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      )}
      <PageContainer role="details">
        {save && (
          <ModalDialog
            closeHandler={(response) => {
              setSave(false);
              if (response) {
                dispatch(saveSiteDetails()).unwrap();
              }
            }}
          >
            {savedChanges.length > 0 ? (
              <React.Fragment>
                <div>
                  <span className="custom-modal-data-text">
                    The following fields will be updated:
                  </span>
                </div>
                <div>
                  <ul className="custom-modal-data-text">
                    {savedChanges.map((item: any) => (
                      <li key={item.label}>
                        {IChangeType[item.changeType]} {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div>
                  <span className="custom-modal-data-text">
                    No changes to save
                  </span>
                </div>
              </React.Fragment>
            )}
          </ModalDialog>
        )}

        {!isVisible && (
          <div className="d-flex justify-content-between">
            <button
              className="d-flex btn-back align-items-center"
              onClick={onClickBackButton}
            >
              <AngleLeft className="btn-icon" />
              <span className="btn-back-lbl">Back to</span>
            </button>
            <div className="d-flex gap-2 justify-align-center pe-2 pos-relative">
              {/* For Action Dropdown*/}
              {!edit &&
                viewMode === SiteDetailsMode.ViewOnlyMode &&
                userType === UserType.Internal && (
                  <Actions
                    label="Action"
                    items={ActionItems}
                    onItemClick={handleItemClick}
                  />
                )}

              {/* For Edit / SR Dropdown*/}
              <div className="d-flex gap-3 align-items-center">
                {edit && userType === UserType.Internal && (
                  <>
                    <CustomLabel
                      labelType="c-b"
                      label={`${viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`}
                    />
                    <SaveButton clickHandler={() => setSave(true)} />
                    <CancelButton clickHandler={handleCancelButton} />
                  </>
                )}
              </div>

              {/* For Cart /Folio Controls*/}
              {!edit &&
                viewMode === SiteDetailsMode.ViewOnlyMode &&
                userType === UserType.External && (
                  <>
                    <div
                      className="d-flex btn-cart align-items-center"
                      onClick={() => handleAddToCart()}
                    >
                      <ShoppingCartIcon className="btn-icon" />
                      <span className="btn-cart-lbl"> Add to Cart</span>
                    </div>
                    <div
                      className="d-flex btn-folio align-items-center"
                      onClick={() => {
                        SetAddToFolioVisible(!addToFolioVisible);
                      }}
                    >
                      <FolderPlusIcon className="btn-folio-icon" />
                      <span className="btn-folio-lbl"> Add to Folio</span>
                      <DropdownIcon className="btn-folio-icon" />
                    </div>
                    {addToFolioVisible && (
                      <div className="pos-absolute">
                        <SearchInput
                          label={'Search Folios'}
                          placeHolderText={'Search Folios'}
                          searchTerm={folioSearchTerm}
                          clearSearch={() => {
                            SetFolioSearchTeam('');
                            //SetAddToFolioVisible(false);
                          }}
                          handleSearchChange={(e) => {
                            if (e.target) {
                              SetFolioSearchTeam(e.target.value);
                            } else {
                              SetFolioSearchTeam(e);
                            }
                          }}
                          options={folioDetails
                            .filter(
                              (y: any) =>
                                y.folioId
                                  .toLowerCase()
                                  .indexOf(folioSearchTerm.toLowerCase()) !==
                                -1,
                            )
                            .map((x: any) => x.folioId)}
                          optionSelectHandler={(value) => {
                            handleFolioSelect(value);
                            SetAddToFolioVisible(false);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        )}
        <div className="section-details-header row">
          {UserType.External === userType && (
            <div>
              <BannerDetails
                bannerType={bannerType}
                snapshotDate={
                  snapshot.status === RequestStatus.success &&
                  snapshot.snapshot.data !== null
                    ? `Snapshot Taken: ${formatDateWithNoTimzoneName(new Date(snapshotTakenDate))}`
                    : ''
                }
              />
            </div>
          )}

          {!isVisible && (
            <>
              <div>
                <CustomLabel label="Site ID: " labelType="b-h5" />
                <CustomLabel label={id ?? ''} labelType="r-h5" />
              </div>
              <div>
                <CustomLabel
                  label={details && details.addrLine_1}
                  labelType="b-h1"
                />
              </div>
            </>
          )}
        </div>
        <NavigationPills
          items={navItems ?? []}
          components={navComponents}
          dropdownItems={dropDownNavItems}
          isDisable={
            UserType.External === userType && snapshot.snapshot.data === null
          }
        />
      </PageContainer>
    </>
  );
};

export default SiteDetails;
