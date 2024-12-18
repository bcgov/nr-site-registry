import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import {
  AngleLeft,
  CircleExclamationIconFa,
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
import { getNavComponents } from './navigation/NavigationPillsConfig';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import {
  CancelButton,
  SaveButton,
} from '../../components/simple/CustomButtons';
import { IChangeType } from '../../components/common/IChangeType';

import './SiteDetails.css'; // Ensure this import is correct
import { SiteActionBtn, SiteDetailsMode } from './dto/SiteDetailsMode';
import { UserType } from '../../helpers/requests/userType';
import Actions from '../../components/action/Actions';
import {
  ActionItems,
  getActionItems,
} from '../../components/action/ActionsConfig';
import {
  formatDate,
  formatDateWithNoTimzoneName,
  getUser,
  isUserOfType,
  showNotification,
  UserRoleType,
} from '../../helpers/utility';
import { addRecentView } from '../dashboard/DashboardSlice';
import { fetchSiteParticipants } from './participants/ParticipantSlice';
import { fetchSiteDisclosure } from './disclosure/DisclosureSlice';
import { addCartItem, resetCartItemAddedStatus } from '../cart/CartSlice';
import { useAuth } from 'react-oidc-context';
import { fetchNotationParticipants } from './notations/NotationSlice';
import { fetchDocuments } from './documents/DocumentsSlice';
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
import BannerDetails from '../../components/banners/BannerDetails';
import {
  resetSaveSiteDetails,
  resetSaveSiteDetailsRequestStatus,
  saveRequestStatus,
  saveSiteDetails,
  setupSiteIdForSaving,
  setupSiteSummaryForSaving,
} from './SaveSiteDetailsSlice';
import { fetchAssociatedSites } from './associates/AssociateSlice';
import AddToFolio from '../folios/AddToFolio';
import {
  fetchParcelDescriptionsForApproval,
  fetchPendingAssociatedSites,
  fetchPendingDocumentsForApproval,
  fetchPendingLandUses,
  fetchPendingSiteDisclosure,
  fetchPendingSiteNotationBySiteId,
  fetchPendingSiteParticipantsForApproval,
  fetchPendingSitesDetailsFprApproval,
  hasNoPendingUpdates,
  updateRequestStatus,
} from './srUpdates/srUpdatesSlice';
import { fetchLandUseCodes } from './landUses/LandUsesSlice';
import { IFetchParcelDescriptionParams } from './parcelDescriptions/parcelDescriptionsSlice';
import {
  bulkAproveRejectChanges,
  bulkUpdateApproveRejectStatus,
  resetBulkUpdateStatus,
} from './srUpdates/state/srUpdatesTableSlice';
import { Button } from '../../components/button/Button';
import { UserActionEnum } from '../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';

const SiteDetails = () => {
  const [confirmSiteReview, SetConfirmSiteReview] = useState<Boolean | null>(
    null,
  );
  const bulkApproveRejectStatus = useSelector(bulkUpdateApproveRejectStatus);
  const hasNoPendingUpdatesFromState = useSelector(hasNoPendingUpdates);
  const [navItems, SetNavItems] = useState<string[] | undefined>();
  const [navComponents, SetNavComponents] = useState<any[]>();
  const [dropDownNavItems, SetDropDownNavItems] =
    useState<{ label: string; value: string }[]>();

  const auth = useAuth();

  useEffect(() => {
    SetNavComponents(getNavComponents(false));
  }, [auth.user]);

  useEffect(() => {
    if (
      isUserOfType(UserRoleType.SR) &&
      !hasNoPendingUpdatesFromState &&
      viewMode !== SiteDetailsMode.EditMode
    ) {
      SetNavComponents(getNavComponents(true));
    } else {
      SetNavComponents(getNavComponents(false));
    }
  }, [hasNoPendingUpdatesFromState]);

  const [isVisible, setIsVisible] = useState(false);
  const snapshot = useSelector(snapshots);
  const snapshotTakenDate = useSelector(getFirstSnapshotCreatedDate);
  const bannerType = useSelector(selectBannerType);
  const [edit, setEdit] = useState(false);
  const [showLocationDetails, SetShowLocationDetails] = useState(false);
  const [showParcelDetails, SetShowParcelDetails] = useState(false);
  const [save, setSave] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
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
        if (id) checkForRecordsPendingReview(id);
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

  useEffect(() => {
    if (
      bulkApproveRejectStatus === RequestStatus.success ||
      bulkApproveRejectStatus === RequestStatus.failed
    ) {
      if (bulkApproveRejectStatus === RequestStatus.success) {
        dispatch(resetBulkUpdateStatus(null));
        dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
        setEdit(false);
        if (id) checkForRecordsPendingReview(id);
      } else if (bulkApproveRejectStatus === RequestStatus.failed) {
        // dont close edit mode
        dispatch(resetBulkUpdateStatus(null));
      }

      showNotification(
        bulkApproveRejectStatus,
        'Successfully updated site review',
        'Failed to update site review',
      );
    } else {
      // do nothing
    }
  }, [bulkApproveRejectStatus]);

  const navigate = useNavigate();
  const onClickBackButton = () => {
    navigate(-1);
  };

  const { id } = useParams();

  const details = useSelector(selectSiteDetails);
  const [siteDetailsForSRMode, SetSiteDetailsForSRMode] = useState(details);

  useEffect(() => {
    SetSiteDetailsForSRMode(details);
  }, [details]);

  const loggedInUser = getUser();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5) {
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
  }, [loggedInUser]);

  const savedChanges = useSelector(trackedChanges);
  const mode = useSelector(siteDetailsMode);

  useEffect(() => {
    setViewMode(mode);
    if (
      isUserOfType(UserRoleType.SR) &&
      !hasNoPendingUpdatesFromState &&
      mode !== SiteDetailsMode.EditMode
    ) {
      SetNavComponents(getNavComponents(true));
    } else {
      SetNavComponents(getNavComponents(false));
    }
  }, [mode]);

  useEffect(() => {
    dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
  }, []);

  // NEEDS TO FETCH DATA BASED ON CONDITION WHEATHER IT IS EXTERNAL USER OR INTERNAL USER
  // BY DOING THIS WE CAN STOP UNNECCESSARY CALL TO DATABASE
  // THERE ARE SOME CALLS WHICH MAY NOT REQUIRED ON DETAILS PAGE.
  useEffect(() => {
    console.log('Calling From Site Details');
    setIsLoading(true); // Set loading state to true before starting API calls
    if (id) {
      dispatch(resetSaveSiteDetails(null));
      dispatch(setupSiteIdForSaving(id));

      if (auth.user !== null) {
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
          dispatch(
            fetchSiteDisclosure({ siteId: id ?? '', showPending: false }),
          ),
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
      } else {
        dispatch(fetchSitesDetails({ siteId: id ?? '', showPending: false }))
          .then(() => {
            setIsLoading(false); // Set loading state to false after all API calls are resolved
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }
    }
  }, [id, userType]);

  useEffect(() => {
    if (id && id !== '') {
      checkForRecordsPendingReview(id);
    }
  }, [id]);

  const checkForRecordsPendingReview = (siteId: string) => {
    if (siteId && siteId !== '' && isUserOfType(UserRoleType.SR)) {
      const params: IFetchParcelDescriptionParams = {
        siteId: parseInt(siteId),
        page: 1,
        pageSize: 1000,
        searchParam: '',
        sortBy: '',
        sortByDir: '',
        showPending: true,
      };

      Promise.all([
        dispatch(
          fetchPendingSitesDetailsFprApproval({ siteId, showPending: true }),
        ),

        dispatch(
          fetchPendingSiteNotationBySiteId({ siteId, showPending: true }),
        ),
        dispatch(
          fetchPendingSiteParticipantsForApproval({
            siteId,
            showPending: true,
          }),
        ),

        dispatch(
          fetchPendingLandUses({
            siteId,
            searchTerm: '',
            sortDirection: 'ASC',
            showPending: true,
          }),
        ),

        dispatch(
          fetchPendingDocumentsForApproval({ siteId, showPending: true }),
        ),

        dispatch(fetchPendingSiteDisclosure({ siteId, showPending: true })),

        dispatch(fetchPendingAssociatedSites({ siteId, showPending: true })),

        dispatch(fetchLandUseCodes()),

        dispatch(fetchParcelDescriptionsForApproval(params)),
      ]);
    }
  };

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
      case SiteActionBtn.ApproveAll:
        setEdit(false);
        SetConfirmSiteReview(true);
        // if(id)
        // dispatch(
        //   bulkAproveRejectChanges({
        //     sites: [{siteId: id, changes: 'summary, notation, notation participants, site participants, documents, associated sites, land histories, site profiles, parcel description', whoUpdated: auth.user?.profile?.given_name ?? '', whenUpdated: new Date(), address:'', id : '1' }],
        //     isApproved: true,
        //     fromSiteDetails: true
        //   }),
        // );
        break;
      case SiteActionBtn.RejectAll:
        setEdit(false);
        SetConfirmSiteReview(false);
        // if(id)
        //   dispatch(
        //     bulkAproveRejectChanges({
        //       sites: [{siteId: id, changes: 'summary, notation, notation participants, site participants, documents, associated sites, land histories, site profiles, parcel description', whoUpdated: auth.user?.profile?.given_name ?? '', whenUpdated: new Date(), address:'', id : '1' }],
        //       isApproved: false,
        //       fromSiteDetails: true
        //     }),
        //   );
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
            siteId: details.id,
            price: 200.11,
          },
        ]),
      ).unwrap();
    }
  };

  const getActionItemsToRender = () => {
    let userTypeSR: boolean = isUserOfType(UserRoleType.SR) ?? false;
    let includeSRApprovalActions =
      userTypeSR &&
      !hasNoPendingUpdatesFromState &&
      viewMode !== SiteDetailsMode.EditMode;
    return getActionItems(includeSRApprovalActions);
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

  const renderOptionsForExternalUser = () => {
    if (
      viewMode === SiteDetailsMode.ViewOnlyMode &&
      userType === UserType.External
    ) {
      return (
        <>
          <div className="d-block d-sm-none">
            <Actions
              label="Actions"
              items={[
                { label: 'Add To Cart', value: 'cart' },
                <AddToFolio
                  selectedSiteIds={[id || '']}
                  triggerElement={<span>Add to Folio</span>}
                />,
              ]}
              onItemClick={(value) => {
                if (value === 'cart') {
                  handleAddToCart();
                }
              }}
            />
          </div>
          <div className="d-none d-sm-block">
            <div className="d-flex gap-2">
              {id && (
                <div>
                  <AddToFolio selectedSiteIds={[id]} label="Add to Folio" />
                </div>
              )}
              <div
                className="d-flex btn-cart align-items-center "
                onClick={() => handleAddToCart()}
              >
                <ShoppingCartIcon className="btn-icon" />
                <span className="btn-cart-lbl"> Add to Cart</span>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  const handleSiteSRVisiblity = (event: any) => {
    SetSiteDetailsForSRMode({
      ...siteDetailsForSRMode,
      srAction:
        event?.target?.checked === true
          ? SRApprovalStatusEnum.Public
          : SRApprovalStatusEnum.Private,
    });
    dispatch(
      setupSiteSummaryForSaving({
        ...details,
        userAction: UserActionEnum.updated,
        srAction:
          event?.target?.checked === true
            ? SRApprovalStatusEnum.Public
            : SRApprovalStatusEnum.Private,
      }),
    );
  };

  return (
    <>
      {isVisible && (
        <div className="d-flex justify-content-between align-items-center custom-sticky-header w-100">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <Button variant="secondary" onClick={onClickBackButton}>
              <AngleLeft />
              Back
            </Button>
            <div className="d-flex flex-wrap align-items-center gap-2 pe-3 custom-sticky-header-lbl">
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
                  label="Actions"
                  items={getActionItemsToRender()}
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
                  <Button variant="secondary" onClick={handleAddToCart}>
                    <ShoppingCartIcon />
                    Add to Cart
                  </Button>
                  {id && (
                    <AddToFolio selectedSiteIds={[id]} label="Add to Folio" />
                  )}
                </>
              )}
          </div>
        </div>
      )}
      <PageContainer role="details">
        {confirmSiteReview != null &&
          (confirmSiteReview === false || confirmSiteReview === true) && (
            <ModalDialog
              label={`Are you sure to proceed`}
              closeHandler={(response) => {
                if (response) {
                  alert(confirmSiteReview);
                  if (confirmSiteReview) {
                    //handleRemoveAssociate(response);
                  }
                }
                SetConfirmSiteReview(null);
              }}
            />
          )}
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
            <Button variant="secondary" onClick={onClickBackButton}>
              <AngleLeft /> Back to
            </Button>

            <div className="d-flex gap-2 justify-align-center pe-2 pos-relative">
              {/* For Action Dropdown*/}
              {!edit &&
                viewMode === SiteDetailsMode.ViewOnlyMode &&
                userType === UserType.Internal && (
                  <Actions
                    label="Actions"
                    items={getActionItemsToRender()}
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
                    <Button onClick={handleAddToCart}>
                      <ShoppingCartIcon />
                      Add to Cart
                    </Button>
                    {id && (
                      <AddToFolio selectedSiteIds={[id]} label="Add to Folio" />
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
              {viewMode === SiteDetailsMode.SRMode && (
                <div className="sr-mode-content">
                  <div className="sr-mode-info-banner">
                    <div className="sr-mode-info-content-layout">
                      <div>
                        <CircleExclamationIconFa className="sr-mode-info-icon-color" />
                      </div>
                      <div className="sr-mode-text-content">
                        <span className="sr-mode-text sr-mode-text-bold">
                          You are in SR Mode.
                        </span>
                        <span className="sr-mode-text sr-mode-text-light">
                          Select items to show in Site Registry.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckChecked"
                      checked={
                        siteDetailsForSRMode?.srAction ===
                        SRApprovalStatusEnum.Public
                      }
                      onChange={(event) => handleSiteSRVisiblity(event)}
                    />
                    <label className="form-check-label">
                      {siteDetailsForSRMode?.srAction ===
                      SRApprovalStatusEnum.Public
                        ? 'Site Published to Site Registry'
                        : 'Publish Page To Site Registry'}
                    </label>
                  </div>
                </div>
              )}

              <div>
                <CustomLabel label="Site ID1: " labelType="b-h5" />
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
          components={navComponents}
          isDisable={
            getUser() === null ||
            (UserType.External === userType &&
              snapshot?.snapshot?.data === null)
          }
        />
      </PageContainer>
    </>
  );
};

export default SiteDetails;
