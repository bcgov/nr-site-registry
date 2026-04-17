import React, { useEffect, useRef, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
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
  fetchSitesInsights,
  updateSiteDetail,
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
import { getFieldLabel, ChangeContext } from '../../helpers/fieldLabelMapper';

import './SiteDetails.css'; // Ensure this import is correct
import { SiteActionBtn, SiteDetailsMode } from './dto/SiteDetailsMode';
import { UserType } from '../../helpers/requests/userType';
import Actions from '../../components/action/Actions';
import { getActionItems } from '../../components/action/ActionsConfig';
import {
  deepFilterByUserAction,
  formatDateWithNoTimzoneName,
  getUser,
  isUserOfType,
  removeProperty,
  showNotification,
  UserRoleType,
  validateForm,
} from '../../helpers/utility';
import { addRecentView } from '../dashboard/DashboardSlice';
import {
  fetchSiteParticipants,
  updateSiteParticipants,
} from './participants/ParticipantSlice';
import {
  fetchSiteDisclosure,
  updateSiteDisclosure,
  siteDisclosure as siteDisclosureSelector,
} from './disclosure/DisclosureSlice';
import { addCartItem, resetCartItemAddedStatus } from '../cart/CartSlice';
import { useAuth } from 'react-oidc-context';
import {
  fetchNotationParticipants,
  updateSiteNotation,
} from './notations/NotationSlice';
import { fetchDocuments, updateSiteDocument } from './documents/DocumentsSlice';
import {
  fetchSnapshots,
  snapshots,
  getFirstSnapshotCreatedDate,
  selectBannerType,
  getBannerType,
} from './snapshot/SnapshotSlice';
import { RequestStatus } from '../../helpers/requests/status';
import {
  fetchBceRegionCd,
  fetchMinistryContact,
  fetchNotationClassCd,
  fetchNotationParticipantRoleCd,
  fetchNotationTypeCd,
  fetchParticipantRoleCd,
  fetchSchedule2ReferenceCd,
  fetchSiteRiskCd,
  fetchSiteStatusCd,
  schedule2ReferenceCdDrpdown,
} from './dropdowns/DropdownSlice';
import BannerDetails from '../../components/banners/BannerDetails';
import {
  getParentBucket,
  getSiteAssociated,
  getSiteDocuments,
  getSiteNoatations,
  getSiteParticipants,
  getSiteSummary,
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
import {
  fetchAssociatedSites,
  updateAssociatedSites,
} from './associates/AssociateSlice';
import AddToFolio from '../folios/AddToFolio';
import {
  fetchParcelDescriptionsForApproval,
  fetchPendingAssociatedSites,
  fetchPendingDocumentsForApproval,
  fetchPendingLandUses,
  fetchPendingSiteDisclosure,
  fetchPendingSiteNotationBySiteId,
  fetchPendingSiteParticipantsForApproval,
  fetchPendingSitesDetailsForApproval,
  hasNoPendingUpdates,
  updateRequestStatus,
} from './srUpdates/srUpdatesSlice';
import { fetchLandUseCodes } from './landUses/LandUsesSlice';
import { IFetchParcelDescriptionsParams } from './parcelDescriptions/parcelDescriptionsInterfaces';
import {
  bulkAproveRejectChanges,
  bulkUpdateApproveRejectStatus,
  fetchPendingSiteForSRApproval,
  resetBulkUpdateStatus,
  selectAllSites,
} from './srUpdates/state/srUpdatesTableSlice';
import { Button } from '../../components/button/Button';
import { IFormField } from '../../components/input-controls/IFormField';
import { GetNotationConfig } from './notations/NotationsConfig';
import GetConfig from './participants/ParticipantConfig';
import { GetAssociateConfig } from './associates/AssociateConfig';
import { GetDocumentsConfig } from './documents/DocumentsConfig';
import { UserActionEnum } from '../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import {
  createObject,
  deleteObject,
  setFilePublic,
  updateObject,
} from './documents/DocumentEndpoints';
import { HttpStatusCode } from '../../common/httpStatusCode';
import { GetSummaryConfig } from './summary/SummaryConfig';
import { siteDisclosureConfig } from './disclosure/DisclosureConfig';

const SiteDetails = () => {
  const { disclosureStatementConfigEditMode } = siteDisclosureConfig(
    useSelector(schedule2ReferenceCdDrpdown)?.data,
  );
  const auth = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath =
    location.state?.fromPath || location.state?.fromLabel || 'Search'; // Default to "search" if no state is passed
  const fromScreen = location.state?.fromLabel || 'Search'; // Default to "Unknown Screen" if no state is passed
  const fromPathRef = useRef(fromPath);
  const fromScreenRef = useRef(fromScreen);
  const loggedInUser = getUser();
  // TODO: this is for future use when we support automatic flow of creating new site for specific application.
  // We need applicationid and newly created siteId to fill cats db  in order to keep both application in sync.
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // TODO: For future use when we support automatic flow of creating new site for specific application.
  const applicationId = searchParams.get('applicationId');

  const mode = useSelector(siteDetailsMode);
  const details = useSelector(selectSiteDetails);
  const bulkApproveRejectStatus = useSelector(bulkUpdateApproveRejectStatus);
  const hasNoPendingUpdatesFromState = useSelector(hasNoPendingUpdates);
  const srUpdates = useSelector(selectAllSites);
  const snapshot = useSelector(snapshots);
  const snapshotTakenDate = useSelector(getFirstSnapshotCreatedDate);
  const bannerType = useSelector(selectBannerType);
  const savedChanges = useSelector(trackedChanges);
  const siteNotation = useSelector(getSiteNoatations);
  const siteSummary = useSelector(getSiteSummary);
  const disclosureSourceOfTruth = useSelector(
    siteDisclosureSelector,
  )?.siteDisclosure;
  const sitePartics = useSelector(getSiteParticipants);
  const siteAssocs = useSelector(getSiteAssociated);
  const siteDocuments = useSelector(getSiteDocuments);
  const parentBucket = useSelector(getParentBucket);
  const srUpdateRequestStatus = useSelector(updateRequestStatus);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);

  const { notationFormRowEditMode, notationColumnInternal } =
    GetNotationConfig();
  const { participantColumnInternal } = GetConfig();
  const { associateColumnInternal } = GetAssociateConfig();
  const { documentFormRowsEditMode } = GetDocumentsConfig();
  const { createSiteFormRows, summaryFormRows } = GetSummaryConfig();

  const [errorList, setErrorList] = useState<any[]>([]);
  const [confirmSiteReview, SetConfirmSiteReview] = useState<Boolean | null>(
    null,
  );
  const [navComponents, SetNavComponents] = useState<any[]>();
  const [isVisible, setIsVisible] = useState(false);
  const [edit, setEdit] = useState(false);
  const [save, setSave] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [isLoading, setIsLoading] = useState(true);
  const [siteDetailsForSRMode, SetSiteDetailsForSRMode] = useState(details);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const userActions = [UserActionEnum.added, UserActionEnum.updated];

  useEffect(() => {
    SetNavComponents(getNavComponents(false));
  }, [auth.user]);

  useEffect(() => {
    if (
      isUserOfType(UserRoleType.SR) &&
      !hasNoPendingUpdatesFromState &&
      viewMode !== SiteDetailsMode.EditMode &&
      (!isUserOfType(UserRoleType.INTERNAL) ||
        viewMode === SiteDetailsMode.SRMode)
    ) {
      SetNavComponents(getNavComponents(true));
    } else {
      SetNavComponents(getNavComponents(false));
    }
  }, [hasNoPendingUpdatesFromState]);

  useEffect(() => {
    if (
      saveSiteDetailsRequestStatus === RequestStatus.success ||
      saveSiteDetailsRequestStatus === RequestStatus.failed
    ) {
      if (saveSiteDetailsRequestStatus === RequestStatus.success) {
        dispatch(
          fetchSitesInsights({
            siteId: id ?? '',
            showPending: userType === UserType.Internal,
          }),
        );
        dispatch(fetchSitesDetails({ siteId: id ?? '', showPending: false }));
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
        'Changes saved successfully',
        'System error prevented changes from being saved.',
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

  const onClickBackButton = () => {
    navigate(`/${fromPathRef.current.replace(/\s+/g, '').toLowerCase()}`);
  };

  useEffect(() => {
    SetSiteDetailsForSRMode(details);
    if (details && details.id === id) {
      handleAddRecentView(details);
    }
  }, [details]);

  const lastScrollY = useRef(0);
  const isVisibleRef = useRef(false); // track visibility without triggering re-renders
  useEffect(() => {
    const thresholdShow = 100; // show header only after scrolling past 100px
    const thresholdHide = 30; // hide header only when scrolling up to < 30px

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always hide at the top
      if (currentScrollY <= 5) {
        if (isVisibleRef.current) {
          setIsVisible(false);
          isVisibleRef.current = false;
        }
        lastScrollY.current = currentScrollY;
        return;
      }

      const scrollingDown = currentScrollY > lastScrollY.current;
      const scrollingUp = currentScrollY < lastScrollY.current;

      if (
        scrollingDown &&
        currentScrollY > thresholdShow &&
        !isVisibleRef.current
      ) {
        setIsVisible(true);
        isVisibleRef.current = true;
      }

      if (
        scrollingUp &&
        currentScrollY < thresholdHide &&
        isVisibleRef.current
      ) {
        setIsVisible(false);
        isVisibleRef.current = false;
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (
      isUserOfType(UserRoleType.CLIENT) ||
      isUserOfType(UserRoleType.PUBLIC)
    ) {
      setUserType(UserType.External);
    } else if (isUserOfType(UserRoleType.INTERNAL)) {
      setUserType(UserType.Internal);
    }
  }, [loggedInUser]);

  useEffect(() => {
    setViewMode(mode);
    if (
      isUserOfType(UserRoleType.SR) &&
      !hasNoPendingUpdatesFromState &&
      mode !== SiteDetailsMode.EditMode &&
      (!isUserOfType(UserRoleType.INTERNAL) || mode === SiteDetailsMode.SRMode)
    ) {
      SetNavComponents(getNavComponents(true));
    } else {
      SetNavComponents(getNavComponents(false));
    }
  }, [mode]);

  useEffect(() => {
    dispatch(updateSiteDetailsMode(SiteDetailsMode.ViewOnlyMode));
    dispatch(
      fetchPendingSiteForSRApproval({
        searchParam: { id: id ?? '' },
        page: 1,
        pageSize: 5,
      }),
    );
  }, []);

  // NEEDS TO FETCH DATA BASED ON CONDITION WHEATHER IT IS EXTERNAL USER OR INTERNAL USER
  // BY DOING THIS WE CAN STOP UNNECCESSARY CALL TO DATABASE
  // THERE ARE SOME CALLS WHICH MAY NOT REQUIRED ON DETAILS PAGE.
  useEffect(() => {
    setIsLoading(true); // Set loading state to true before starting API calls
    dispatch(resetSaveSiteDetails(null));
    fetchAllDropdownDetails();
    if (!!id?.trim()) {
      checkForRecordsPendingReview(id);
      dispatch(setupSiteIdForSaving(id));
      dispatch(
        fetchSitesInsights({
          siteId: id ?? '',
          showPending: userType === UserType.Internal,
        }),
      );
      if (auth.user !== null) {
        Promise.all([
          dispatch(fetchSnapshots(id ?? '')),
          userType === UserType.External
            ? dispatch(getBannerType(id ?? ''))
            : Promise.resolve(),

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
    } else {
      if (userType === UserType.Internal && auth.user !== null) {
        resetSite();
        setEdit(true);
        setViewMode(SiteDetailsMode.EditMode);
        dispatch(updateSiteDetailsMode(SiteDetailsMode.EditMode));
      }
    }
  }, [id, userType]);

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

  const resetSite = () => {
    dispatch(clearTrackChanges(null));
    dispatch(updateSiteParticipants([]));
    dispatch(updateSiteNotation([]));
    dispatch(updateSiteDocument([]));
    dispatch(updateSiteDisclosure([]));
    dispatch(updateAssociatedSites([]));
    dispatch(updateSiteDetail(null));
  };

  const fetchAllDropdownDetails = async () => {
    dispatch(fetchMinistryContact('EMP'));
    dispatch(fetchNotationClassCd());
    dispatch(fetchNotationTypeCd());
    dispatch(fetchNotationParticipantRoleCd());
    dispatch(fetchParticipantRoleCd());
    dispatch(fetchSiteRiskCd());
    dispatch(fetchSiteStatusCd());
    dispatch(fetchBceRegionCd());
    dispatch(fetchSchedule2ReferenceCd());
  };

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
          fetchPendingSitesDetailsForApproval({ siteId, showPending: true }),
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

  const groupChangesByContextAndType = (changes: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    changes.forEach((item) => {
      const key = `${item.changeType}-${item.context || ''}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

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
        break;
      case SiteActionBtn.RejectAll:
        setEdit(false);
        SetConfirmSiteReview(false);
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
        if (!id?.trim()) {
          navigate(-1);
        } else {
          handleCancelButton();
        }
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
        siteSummaryErrors,
      ] = await Promise.all([
        validateNotationsForm(),
        validateSiteParticipantForm(),
        validateSiteDocumentsForm(),
        validateAssociatedSitesForm(),
        validateSiteDisclosureForm(),
        validateSiteSummaryForm(),
      ]);

      // Combine all errors into one list
      const errors = [
        ...siteNotationErrors,
        ...siteParticErrors,
        ...siteDocErrors,
        ...siteAssocErrors,
        ...siteDisclosureErrors,
        ...siteSummaryErrors,
      ];
      // You can now use `allErrors` for further processing
      return errors;
    } catch (error) {
      return []; // Return empty array in case of error to avoid breaking further logic
    }
  };

  const validateSiteSummaryForm = async () => {
    try {
      if (siteSummary && Object.keys(siteSummary).length > 0) {
        const errors = validateForm(
          !id?.trim() ? createSiteFormRows : summaryFormRows,
          siteSummary,
          'Site Summary',
        );
        if (errors?.length > 0) {
          return errors;
        } else {
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

  const validateSiteDocumentsForm = async () => {
    try {
      if (siteDocuments?.length > 0) {
        let updatedSiteDocs = deepFilterByUserAction(siteDocuments, [
          ...userActions,
          UserActionEnum.deleted,
        ]);
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
      const disclosureData = disclosureSourceOfTruth;
      if (
        disclosureData &&
        typeof disclosureData === 'object' &&
        Object.keys(disclosureData).length > 0
      ) {
        const siteDisclosureErrors: any[] = [];

        // Validate against the disclosure slice (source of truth) — always has full field values
        const errors = validateForm(
          disclosureStatementConfigEditMode,
          disclosureData,
          'Site Disclosure',
        );
        if (errors?.length > 0) {
          siteDisclosureErrors.push(...errors);
        }

        const { siteRegDateRecd, dateCompleted } = disclosureData;
        if (!!siteRegDateRecd && !!dateCompleted) {
          if (new Date(dateCompleted) < new Date(siteRegDateRecd)) {
            siteDisclosureErrors.push({
              label: 'Site Disclosure',
              errorMessage: `Site Disclosure Date Completed is always equal or greater than Date Received.`,
            });
          }
        }

        if (siteDisclosureErrors?.length > 0) {
          return siteDisclosureErrors;
        } else {
          let updatedSiteDisclosure = deepFilterByUserAction(disclosureData, [
            ...userActions,
            UserActionEnum.deleted,
          ]);
          updatedSiteDisclosure = removeProperty(
            updatedSiteDisclosure,
            'position',
          );
          updatedSiteDisclosure = removeProperty(
            updatedSiteDisclosure,
            'description',
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
        let updatedSiteNotations = deepFilterByUserAction(siteNotation, [
          UserActionEnum.added,
          UserActionEnum.updated,
          UserActionEnum.deleted,
          UserActionEnum.restored,
        ]);
        // Exclude deleted notations from validation, but keep them for saving
        const notationsForValidation = Array.isArray(updatedSiteNotations)
          ? updatedSiteNotations.filter(
              (notation: any) =>
                notation?.userAction !== UserActionEnum.deleted,
            )
          : updatedSiteNotations;
        const [notationErrors, notationParticipantErrors] = await Promise.all([
          validateNotations(notationsForValidation), // Async function handling Notation validation
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
        if (notation?.apiAction === UserActionEnum.deleted) {
          continue;
        }
        if (
          notation?.notationParticipant &&
          notation?.notationParticipant?.length > 0
        ) {
          for (const [
            participantIndex,
            notationParticipant,
          ] of notation.notationParticipant.entries()) {
            if (notationParticipant?.apiAction === UserActionEnum.deleted) {
              continue;
            }
            // Validate and accumulate errors for each notation participant
            const errors = validateForm(
              notationParticipantTable,
              notationParticipant,
              `Notation [${notation?.position + 1}] Notation Participant [${notationParticipant?.position + 1}]`,
            );
            notationParticipantErrors.push(...errors);
          }
        } else if (notation?.apiAction !== UserActionEnum.deleted) {
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
    dispatch(resetSaveSiteDetails(null));
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

  if (id && (isLoading || snapshot.status === RequestStatus.loading)) {
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
      updateSiteDetail({
        ...details,
        srAction:
          event?.target?.checked === true
            ? SRApprovalStatusEnum.Public
            : SRApprovalStatusEnum.Private,
      }),
    );
    dispatch(
      setupSiteSummaryForSaving({
        ...details,
        apiAction: UserActionEnum.updated,
        userAction: UserActionEnum.updated,
        srAction:
          event?.target?.checked === true
            ? SRApprovalStatusEnum.Public
            : SRApprovalStatusEnum.Private,
      }),
    );

    const tracker = new ChangeTracker(
      IChangeType.Modified,
      getFieldLabel('srValue'),
      ChangeContext.SITE,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

  const saveSiteDocumentData = async () => {
    try {
      if (siteDocuments?.length > 0) {
        // Create an array of promises that will resolve when the deletion and object creation is done
        const updatedDocumentsPromises = siteDocuments.map(
          async (document: any) => {
            if (document?.apiAction === UserActionEnum.added) {
              const objRes = await createObject(
                parentBucket?.bucketId,
                document?.file,
              );
              if (objRes?.status === HttpStatusCode.CONFLICT) {
                setHasError(true);
                errorList.push({
                  errorMessage: `${document?.title} is already exists. Same file name is deleted by someone in past. Please change the name of file.`,
                });
                return document;
              } else {
                // Create the updated document object
                const updatedSiteDocument = {
                  ...document,
                  bucketId: parentBucket?.bucketId,
                  objectId: objRes?.id,
                };

                // Delete the file from the document object
                delete updatedSiteDocument.file;

                // Return the updated document
                return updatedSiteDocument;
              }
            } else if (document?.apiAction === UserActionEnum.updated) {
              // Create the updated document object
              const updatedSiteDocument = { ...document };
              if (document?.file) {
                const objRes = await updateObject(
                  document?.objectId,
                  document?.file,
                );
                if (objRes) {
                  // Delete the file from the document object
                  delete updatedSiteDocument.file;
                }
              }
              if (document?.srAction === SRApprovalStatusEnum.Public) {
                // Make file public
                await setFilePublic(document?.objectId);
              }

              // Return the updated document
              delete updatedSiteDocument?.whenCreated;
              delete updatedSiteDocument?.whenUpdated;
              return updatedSiteDocument;
            } else if (document?.apiAction === UserActionEnum.deleted) {
              const response = await deleteObject(document?.objectId);
              if (response?.DeleteMarker) {
                const updatedSiteDocument = { ...document };
                delete updatedSiteDocument?.whenCreated;
                delete updatedSiteDocument?.whenUpdated;
                return updatedSiteDocument;
              }
            }
            return document;
          },
        );

        // Wait for all the promises to resolve
        const updatedDocuments = await Promise.all(updatedDocumentsPromises);
        if (errorList.length === 0) {
          // Dispatch the updated documents for saving
          dispatch(setupDocumentsDataForSaving(updatedDocuments));
        }
      }
    } catch (error) {
      console.error(`Error: Saving Document: ${error}`);
      errorList.push('Error in saving or updating document(s)');
      throw error;
    }
  };

  const saveSiteDetailsHandler = async () => {
    try {
      // Wait for saveSiteData to complete
      if (siteDocuments?.length > 0) {
        await saveSiteDocumentData();
      }
      if (errorList.length === 0) {
        const res = await dispatch(saveSiteDetails()).unwrap();
        const { httpStatusCode, success } = res?.data?.updateSiteDetails;
        if (httpStatusCode === HttpStatusCode.OK && success) {
          navigate(-1);
        }
      }
    } catch (error) {
      console.error('Error while saving site details:', error);
      throw error;
    }
  };

  return (
    <>
      {isVisible && (
        <div className="d-flex justify-content-between align-items-center custom-sticky-header w-100">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <Button variant="secondary" onClick={onClickBackButton}>
              <AngleLeft />
              {`Back to ${fromScreenRef.current}`}
            </Button>
            <div className="d-flex flex-wrap align-items-center gap-2 pe-3 custom-sticky-header-lbl">
              {!!id?.trim() ? (
                <>
                  <span>Site ID:</span>
                  <span className="custom-sticky-header-txt">{id}</span>
                  <span className="d-flex align-items-center justify-content-center px-2 custom-dot">
                    .
                  </span>
                  {details?.addrLine_1 && (
                    <div className="custom-sticky-header-lbl">
                      <span>{details.addrLine_1}</span>
                    </div>
                  )}
                </>
              ) : (
                <span>Create New Site</span>
              )}
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
                    label={`${!id?.trim() ? 'Create Site' : viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'} `}
                  />
                  <SaveButton
                    variant="secondary"
                    clickHandler={() => handleItemClick(SiteActionBtn.SAVE)}
                    isDisabled={savedChanges?.length > 0 ? false : true}
                  />
                  <CancelButton
                    clickHandler={() => handleItemClick(SiteActionBtn.CANCEL)}
                  />
                </>
              )}
            </div>
            {edit && userType === UserType.Internal && (
              <div className="d-flex d-md-none d-lg-none d-xl-none">
                <Actions
                  label="Actions"
                  items={
                    !id?.trim()
                      ? [
                          { label: 'Create Site', value: SiteActionBtn.SAVE },
                          { label: 'Cancel', value: SiteActionBtn.CANCEL },
                        ]
                      : [
                          { label: 'Save', value: SiteActionBtn.SAVE },
                          { label: 'Cancel', value: SiteActionBtn.CANCEL },
                        ]
                  }
                  onItemClick={handleItemClick}
                />
              </div>
            )}
            {/* For Cart /Folio Controls*/}
            {!edit &&
              viewMode === SiteDetailsMode.ViewOnlyMode &&
              userType === UserType.External && (
                <>
                  {id && (
                    <AddToFolio selectedSiteIds={[id]} label="Add to Folio" />
                  )}
                  <Button onClick={handleAddToCart}>
                    <ShoppingCartIcon />
                    Add to Cart
                  </Button>
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
                  if (confirmSiteReview) {
                    if (srUpdates.length > 0) {
                      dispatch(
                        bulkAproveRejectChanges({
                          sites: srUpdates,
                          isApproved: true,
                          fromSiteDetails: false,
                        }),
                      );
                    }
                  }

                  if (!confirmSiteReview) {
                    if (srUpdates.length > 0) {
                      dispatch(
                        bulkAproveRejectChanges({
                          sites: srUpdates,
                          isApproved: false,
                          fromSiteDetails: false,
                        }),
                      );
                    }
                  }
                }
                SetConfirmSiteReview(null);
              }}
            />
          )}

        {(save || hasError) && (
          <ModalDialog
            errorOption={hasError}
            customHeaderCss={hasError ? 'custom-modal-error-header-text' : ''}
            headerLabel={hasError ? 'Please fix the errors' : ''}
            label="Are you sure you want to save changes ?"
            saveBtnLabel="Yes, Save Changes"
            closeHandler={async (response) => {
              setSave(false);
              if (response && errorList?.length === 0) {
                // Proceed with saving if there are no errors
                await saveSiteDetailsHandler();
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
                        {IChangeType[item?.changeType]} {item.errorMessage}
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
                    {savedChanges.length > 0 ? '' : 'No changes to save'}
                  </span>
                </div>
                {savedChanges.length > 0 && (
                  <div>
                    <ul className="custom-modal-data-text change-group-list">
                      {Object.entries(
                        groupChangesByContextAndType(savedChanges),
                      ).map(([key, items]) => {
                        const isExpanded = expandedSections.has(key);
                        const firstItem = items[0];
                        const changeTypeName =
                          IChangeType[firstItem.changeType];
                        const context = firstItem.context || '';
                        const isModified =
                          firstItem.changeType === IChangeType.Modified;
                        return (
                          <li key={key} className="change-group-item">
                            <div
                              onClick={
                                isModified
                                  ? () => toggleSection(key)
                                  : undefined
                              }
                              className={`change-group-header${isModified ? ' change-group-header--expandable' : ''}`}
                            >
                              {isModified && (
                                <span>{isExpanded ? '▼' : '▶'}</span>
                              )}
                              <span>
                                {changeTypeName} {context}
                              </span>
                            </div>
                            {isModified && isExpanded && (
                              <ul className="change-group-details">
                                {items.map((item: any, idx: number) => (
                                  <li key={`${key}-${idx}`}>{item.label}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
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
              <AngleLeft /> {`Back to ${fromScreenRef.current}`}
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
                      label={`${!id?.trim() ? 'Create Site' : viewMode === SiteDetailsMode.SRMode ? 'SR Mode' : 'Edit Mode'} `}
                    />
                    <SaveButton
                      variant="secondary"
                      clickHandler={() => handleItemClick(SiteActionBtn.SAVE)}
                      isDisabled={savedChanges?.length > 0 ? false : true}
                    />
                    <CancelButton
                      clickHandler={() => handleItemClick(SiteActionBtn.CANCEL)}
                    />
                  </>
                )}
              </div>
              {edit && userType === UserType.Internal && (
                <div className="d-flex d-md-none d-lg-none d-xl-none">
                  <Actions
                    label="Actions"
                    items={
                      !id?.trim()
                        ? [
                            { label: 'Create Site', value: 'create' },
                            { label: 'Cancel', value: 'cancel' },
                          ]
                        : [
                            { label: 'Save', value: 'save' },
                            { label: 'Cancel', value: 'cancel' },
                          ]
                    }
                    onItemClick={handleItemClick}
                  />
                </div>
              )}

              {/* For Cart /Folio Controls*/}
              {!edit &&
                viewMode === SiteDetailsMode.ViewOnlyMode &&
                userType === UserType.External && (
                  <>
                    {id && (
                      <AddToFolio selectedSiteIds={[id]} label="Add to Folio" />
                    )}
                    <Button onClick={handleAddToCart}>
                      <ShoppingCartIcon />
                      Add to Cart
                    </Button>
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
                <div className="sr-mode-content mb-5">
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
                  <div className="p-2">
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
                          ? 'Publish page to Site Registry'
                          : 'Hide page from Site Registry'}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {!!id?.trim() ? (
                <>
                  <div>
                    <CustomLabel label="Site ID: " labelType="b-h5" />
                    <CustomLabel label={id} labelType="r-h5" />
                  </div>
                  <div>
                    <CustomLabel
                      label={details && details.addrLine_1}
                      labelType="b-h1"
                    />
                  </div>
                </>
              ) : (
                <CustomLabel label="Create New Site" labelType="b-h5" />
              )}
            </>
          )}
        </div>
        <NavigationPills
          components={navComponents}
          isDisable={
            getUser() === null ||
            (UserType.External === userType &&
              snapshot?.snapshot?.data === null) ||
            (UserType.Internal === userType &&
              viewMode === SiteDetailsMode.EditMode &&
              !id?.trim() &&
              !(savedChanges?.length > 0))
          }
        />
      </PageContainer>
    </>
  );
};

export default SiteDetails;
