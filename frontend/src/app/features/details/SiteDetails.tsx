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
  trackChanges,
} from '../site/dto/SiteSlice';
import { AppDispatch } from '../../Store';
import NavigationPills from '../../components/navigation/navigationpills/NavigationPills';
import { getNavComponents } from './navigation/NavigationPillsConfig';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import {
  CancelButton,
  SaveButton,
} from '../../components/simple/CustomButtons';
import {
  ChangeTracker,
  IChangeType,
} from '../../components/common/IChangeType';

import './SiteDetails.css'; // Ensure this import is correct
import { SiteActionBtn, SiteDetailsMode } from './dto/SiteDetailsMode';
import { UserType } from '../../helpers/requests/userType';
import Actions from '../../components/action/Actions';
import { getActionItems } from '../../components/action/ActionsConfig';
import {
  deepFilterByUserAction,
  formatDate,
  formatDateWithNoTimzoneName,
  getUser,
  isUserOfType,
  removeProperty,
  showNotification,
  UserRoleType,
  validateForm,
} from '../../helpers/utility';
import { addRecentView } from '../dashboard/DashboardSlice';
import { fetchSiteParticipants } from './participants/ParticipantSlice';
import { fetchSiteDisclosure } from './disclosure/DisclosureSlice';
import { addCartItem, resetCartItemAddedStatus } from '../cart/CartSlice';
import { useAuth } from 'react-oidc-context';
import { fetchNotationParticipants } from './notations/NotationSlice';
import { documents, fetchDocuments } from './documents/DocumentsSlice';
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
} from './dropdowns/DropdownSlice';
import BannerDetails from '../../components/banners/BannerDetails';
import {
  getSiteAssociated,
  getSiteDisclosure,
  getSiteDocuments,
  getSiteNoatations,
  getSiteParticipants,
  resetSaveSiteDetails,
  resetSaveSiteDetailsRequestStatus,
  saveRequestStatus,
  saveSiteDetails,
  setupDocumentsDataForSaving,
  setupNotationDataForSaving,
  setupSiteAssociationDataForSaving,
  setupSiteDisclosureDataForSaving,
  setupSiteIdForSaving,
  setupSiteParticipantDataForSaving,
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
import { IFetchParcelDescriptionsParams } from './parcelDescriptions/parcelDescriptionsInterfaces';
import {
  bulkUpdateApproveRejectStatus,
  resetBulkUpdateStatus,
} from './srUpdates/state/srUpdatesTableSlice';
import { Button } from '../../components/button/Button';
import { IFormField } from '../../components/input-controls/IFormField';
import { GetNotationConfig } from './notations/NotationsConfig';
import { disclosureStatementConfigEditMode } from './disclosure/DisclosureConfig';
import GetConfig from './participants/ParticipantConfig';
import { GetAssociateConfig } from './associates/AssociateConfig';
import { GetDocumentsConfig } from './documents/DocumentsConfig';
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
  const [hasError, setHasError] = useState(false);
  const [errorList, setErrorList] = useState<any[]>([]);
  const savedChanges = useSelector(trackedChanges);
  const siteNotation = useSelector(getSiteNoatations);
  const disclosure = useSelector(getSiteDisclosure);
  const sitePartics = useSelector(getSiteParticipants);
  const siteAssocs = useSelector(getSiteAssociated);
  const siteDocuments = useSelector(getSiteDocuments);
  const userActions = [UserActionEnum.added, UserActionEnum.updated];
  const { notationFormRowEditMode, notationColumnInternal } =
    GetNotationConfig();
  const { participantColumnInternal } = GetConfig();
  const { associateColumnInternal } = GetAssociateConfig();
  const { documentFormRowsEditMode } = GetDocumentsConfig();
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
      const params: IFetchParcelDescriptionsParams = {
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

  const handleItemClick = async (value: string) => {
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
      case SiteActionBtn.SAVE:
        const errors = await validateSiteForms();
        if (errors.length > 0) {
          setErrorList(errors);
          setHasError(true);
          setSave(false);
        } else {
          setErrorList([]);
          setHasError(false);
          setSave(true);
        }
        break;
      case SiteActionBtn.CANCEL:
        handleCancelButton();
        break;
      default:
        break;
    }
  };

  const validateSiteForms = async () => {
    try {
      // Run all validation functions in parallel using Promise.all
      const [
        siteNotationErrors,
        siteParticErrors,
        siteDocErrors,
        siteAssocErrors,
        siteDisclosureErrors,
      ] = await Promise.all([
        validateNotationsForm(),
        validateSiteParticipantForm(),
        validateSiteDocumentsForm(),
        validateAssociatedSitesForm(),
        validateSiteDisclosureForm(),
      ]);

      // Combine all errors into one list
      const errors = [
        ...siteNotationErrors,
        ...siteParticErrors,
        ...siteDocErrors,
        ...siteAssocErrors,
        ...siteDisclosureErrors,
      ];
      // You can now use `allErrors` for further processing
      return errors;
    } catch (error) {
      return []; // Return empty array in case of error to avoid breaking further logic
    }
  };

  const validateSiteDocumentsForm = async () => {
    try {
      if (siteDocuments?.length > 0) {
        let updatedSiteDocs = deepFilterByUserAction(
          siteDocuments,
          userActions,
        );
        const errors = validateForm(
          documentFormRowsEditMode,
          updatedSiteDocs,
          'Documents',
        );
        if (errors?.length > 0) {
          return errors;
        } else {
          updatedSiteDocs = removeProperty(updatedSiteDocs, 'position');
          dispatch(setupDocumentsDataForSaving(updatedSiteDocs));
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const validateAssociatedSitesForm = async () => {
    try {
      if (siteAssocs?.length > 0) {
        const associatedSiteTable: IFormField[][] = [
          associateColumnInternal
            .map((column) => column.displayType)
            .filter(
              (displayType): displayType is IFormField =>
                displayType !== undefined,
            ),
        ];
        let updatedSiteAssocs = deepFilterByUserAction(siteAssocs, userActions);
        const errors = validateForm(
          associatedSiteTable,
          updatedSiteAssocs,
          'Associated Sites',
        );
        if (errors?.length > 0) {
          return errors;
        } else {
          updatedSiteAssocs = removeProperty(updatedSiteAssocs, 'position');
          dispatch(setupSiteAssociationDataForSaving(updatedSiteAssocs));
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const validateSiteParticipantForm = async () => {
    try {
      if (sitePartics?.length) {
        const siteParticipantTable: IFormField[][] = [
          participantColumnInternal
            .map((column) => column.displayType)
            .filter(
              (displayType): displayType is IFormField =>
                displayType !== undefined,
            ),
        ];
        let updatedSitePartics = deepFilterByUserAction(
          sitePartics,
          userActions,
        );
        const errors = validateForm(
          siteParticipantTable,
          updatedSitePartics,
          'Site Participant',
        );
        if (errors?.length > 0) {
          return errors;
        } else {
          updatedSitePartics = removeProperty(updatedSitePartics, 'position');
          dispatch(setupSiteParticipantDataForSaving(updatedSitePartics));
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const validateSiteDisclosureForm = async () => {
    try {
      if (
        disclosure &&
        typeof disclosure === 'object' &&
        Object.keys(disclosure).length > 0
      ) {
        const siteDisclosureErrors: any[] = [];
        let updatedSiteDisclosure = deepFilterByUserAction(
          disclosure,
          userActions,
        );
        const errors = validateForm(
          disclosureStatementConfigEditMode,
          updatedSiteDisclosure,
          'Site Disclosure',
        );
        if (errors?.length > 0) {
          siteDisclosureErrors.push(...errors);
        }
        const { siteRegDateRecd, dateCompleted } = disclosure;
        if (!!siteRegDateRecd && !!dateCompleted) {
          if (
            new Date(disclosure?.dateCompleted) <
            new Date(disclosure?.siteRegDateRecd)
          ) {
            siteDisclosureErrors.push({
              label: 'Site Disclosure',
              errorMessage: `Site Disclosure Date Completed is always equal or greater than Date Received.`,
            });
          }
        }

        if (siteDisclosureErrors?.length > 0) {
          return siteDisclosureErrors;
        } else {
          updatedSiteDisclosure = removeProperty(
            updatedSiteDisclosure,
            'position',
          );
          dispatch(setupSiteDisclosureDataForSaving(updatedSiteDisclosure));
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const validateNotationsForm = async () => {
    try {
      // Run both validations in parallel and wait for them to finish
      if (siteNotation?.length > 0) {
        let updatedSiteNotations = deepFilterByUserAction(
          siteNotation,
          userActions,
        );
        const [notationErrors, notationParticipantErrors] = await Promise.all([
          validateNotations(updatedSiteNotations), // Async function handling Notation validation
          validateNotationParticipants(updatedSiteNotations), // Async function handling Notation Participant validation
        ]);
        // Combine and return the errors from both functions
        const siteNotationErrors = [
          ...notationErrors,
          ...notationParticipantErrors,
        ];
        if (siteNotationErrors.length > 0) {
          return siteNotationErrors;
        } else {
          updatedSiteNotations = removeProperty(
            updatedSiteNotations,
            'position',
          );
          dispatch(setupNotationDataForSaving(updatedSiteNotations));
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const validateNotations = async (updatedSiteNotations: any) => {
    try {
      // Directly return the result of validateForm if it's not async
      return validateForm(
        notationFormRowEditMode,
        updatedSiteNotations,
        'Notation',
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const validateNotationParticipants = async (updatedSiteNotations: any) => {
    try {
      const notationParticipantTable: IFormField[][] = [
        notationColumnInternal
          .map((column) => column.displayType)
          .filter(
            (displayType): displayType is IFormField =>
              displayType !== undefined,
          ),
      ];

      const notationParticipantErrors: any[] = [];
      // Loop through siteNotation and their notationParticipants
      for (const [index, notation] of updatedSiteNotations?.entries()) {
        if (
          notation?.notationParticipant &&
          notation?.notationParticipant?.length > 0
        ) {
          for (const [
            participantIndex,
            notationParticipant,
          ] of notation.notationParticipant.entries()) {
            // Validate and accumulate errors for each notation participant
            const errors = validateForm(
              notationParticipantTable,
              notationParticipant,
              `Notation [${notation?.position + 1}] Notation Participant [${notationParticipant?.position + 1}]`,
            );
            notationParticipantErrors.push(...errors);
          }
        } else {
          notationParticipantErrors.push({
            label: 'Notation Participants',
            errorMessage: `Notation [${notation?.position + 1}] Atleast one  Notation Participant is required.`,
          });
        }
      }

      // Return the accumulated errors
      return notationParticipantErrors;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleCancelButton = () => {
    dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
    dispatch(clearTrackChanges({}));
    setSave(false);
    setHasError(false);
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

    const tracker = new ChangeTracker(IChangeType.Modified, 'Site : SR Status');
    dispatch(trackChanges(tracker.toPlainObject()));
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
            <div className="gap-3 align-items-center d-none d-md-flex d-lg-flex d-xl-flex">
              {edit && userType === UserType.Internal && (
                <>
                  <CustomLabel
                    labelType="c-b"
                    label={`${viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`}
                  />
                  <SaveButton
                    variant="secondary"
                    clickHandler={() => handleItemClick(SiteActionBtn.SAVE)}
                    isDisabled={savedChanges?.length > 0 ? false : true}
                  />
                  <CancelButton clickHandler={handleCancelButton} />
                </>
              )}
            </div>
            {edit && userType === UserType.Internal && (
              <div className="d-flex d-md-none d-lg-none d-xl-none">
                <Actions
                  label="Actions"
                  items={[
                    {
                      label: 'Save',
                      value: 'save',
                    },
                    {
                      label: 'Cancel',
                      value: 'cancel',
                    },
                  ]}
                  onItemClick={handleItemClick}
                />
              </div>
            )}
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
        {/* {save && !error && errors?.length === 0 && (
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

        {save && error && errors?.length > 0 && (
          <ModalDialog
            closeHandler={(response) => {
              setError(false);
              if (response) {
                // dispatch(saveSiteDetails()).unwrap();
              }
            }}>
              <React.Fragment>
                <div>
                  <span className="custom-modal-data-text text-danger">
                    The following fields have errors:
                  </span>
                </div>
                <div>
                  <ul className="custom-modal-data-text text-danger">
                    {errors.map((item: any) => (
                      <li key={item.label}>
                        {IChangeType[item.changeType]} {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </React.Fragment>
          </ModalDialog>
        )} */}
        {(save || hasError) && (
          <ModalDialog
            errorOption={hasError}
            customHeaderCss={hasError ? 'custom-modal-error-header-text' : ''}
            headerLabel={hasError ? 'Please fix the errors' : ''}
            closeHandler={(response) => {
              setSave(false);
              if (response && errorList?.length === 0) {
                // Proceed with saving if there are no errors
                dispatch(saveSiteDetails()).unwrap();
              } else {
                // If there are errors, you can handle accordingly (perhaps reset or keep showing the errors)
                setHasError(false);
              }
            }}
          >
            {/* Show error message if errors exist */}
            {hasError && errorList && errorList?.length > 0 ? (
              <React.Fragment>
                <div>
                  <span className="custom-modal-data-text text-danger">
                    The following fields have errors:
                  </span>
                </div>
                <div
                  style={{
                    maxHeight: '200px', // Adjust based on your modal size
                    overflowY: 'auto',
                  }}
                >
                  <ul className="custom-modal-data-text text-danger">
                    {errorList.map((item: any, index) => (
                      <li key={index}>
                        {/* Assuming item has changeType and label */}
                        {IChangeType[item.changeType]} {item.errorMessage}
                      </li>
                    ))}
                  </ul>
                </div>
              </React.Fragment>
            ) : (
              // Show success message or saved changes if there are no errors
              <React.Fragment>
                <div>
                  <span className="custom-modal-data-text">
                    {savedChanges.length > 0
                      ? 'The following fields will be updated:'
                      : 'No changes to save'}
                  </span>
                </div>
                {savedChanges.length > 0 && (
                  <div>
                    <ul className="custom-modal-data-text">
                      {savedChanges.map((item: any) => (
                        <li key={item.label}>
                          {IChangeType[item.changeType]} {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
              <div className="gap-3 align-items-center d-none d-md-flex d-lg-flex d-xl-flex">
                {edit && userType === UserType.Internal && (
                  <>
                    <CustomLabel
                      labelType="c-b"
                      label={`${viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'}`}
                    />
                    <SaveButton
                      variant="secondary"
                      clickHandler={() => handleItemClick(SiteActionBtn.SAVE)}
                      isDisabled={savedChanges?.length > 0 ? false : true}
                    />
                    <CancelButton clickHandler={handleCancelButton} />
                  </>
                )}
              </div>
              {edit && userType === UserType.Internal && (
                <div className="d-flex d-md-none d-lg-none d-xl-none">
                  <Actions
                    label="Actions"
                    items={[
                      {
                        label: 'Save',
                        value: 'save',
                      },
                      {
                        label: 'Cancel',
                        value: 'cancel',
                      },
                    ]}
                    onItemClick={handleItemClick}
                  />
                </div>
              )}
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
