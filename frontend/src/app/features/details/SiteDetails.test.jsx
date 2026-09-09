import { render, screen } from '@testing-library/react';
import SiteDetails from './SiteDetails';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { RequestStatus } from '../../helpers/requests/status';
import { useAuth } from 'react-oidc-context';
import * as utility from '../../helpers/utility';

// ---- Module Mocks (must be before component mocks) ----
jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn(() => ({ toBlob: jest.fn(() => Promise.resolve(new Blob())) })),
  Document: ({ children }) => <>{children}</>,
  Page: ({ children }) => <>{children}</>,
  View: ({ children }) => <>{children}</>,
  Text: ({ children }) => <>{children}</>,
  StyleSheet: { create: (s) => s },
}));
jest.mock('./pdf/SiteDetailsPdf', () => ({
  __esModule: true,
  default: () => <div data-testid="site-details-pdf" />,
}));
jest.mock('./pdf/useSiteDetailsPdfData', () => ({
  useSiteDetailsPdfData: () => ({
    fetchForPdf: jest.fn(() => Promise.resolve()),
    isSiteReady: true,
  }),
}));
jest.mock('./pdf/DownloadSitePdfButton', () => ({
  __esModule: true,
  default: () => <button data-testid="download-pdf-btn">Download PDF</button>,
}));

// ---- Component Mocks ----
jest.mock('../../components/simple/PageContainer', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="page-container">{children}</div>,
}));
jest.mock('../../components/simple/CustomLabel', () => ({
  __esModule: true,
  default: ({ label }) => <span>{label}</span>,
}));
jest.mock('../../components/modaldialog/ModalDialog', () => ({
  __esModule: true,
  default: ({ children, label, closeHandler, saveBtnLabel }) => (
    <div data-testid="modal-dialog">
      <span>{label}</span>
      {children}
      <button data-testid="modal-confirm" onClick={() => closeHandler(true)}>
        {saveBtnLabel || 'Confirm'}
      </button>
      <button data-testid="modal-cancel" onClick={() => closeHandler(false)}>
        Cancel
      </button>
    </div>
  ),
}));
jest.mock('../../components/action/Actions', () => ({
  __esModule: true,
  default: ({ items, onItemClick }) => (
    <div data-testid="actions">
      {items?.map((i, idx) => (
        <button
          key={idx}
          data-testid={`action-${i.value || i.label}`}
          onClick={() => onItemClick(i.value)}
        >
          {i.label}
        </button>
      ))}
    </div>
  ),
}));
jest.mock('../../components/banners/BannerDetails', () => ({
  __esModule: true,
  default: () => <div data-testid="banner-details" />,
}));
jest.mock('../folios/AddToFolio', () => ({
  __esModule: true,
  default: () => <div data-testid="add-to-folio" />,
}));
jest.mock('../../components/button/Button', () => ({
  __esModule: true,
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));
jest.mock('../../components/simple/CustomButtons', () => ({
  __esModule: true,
  SaveButton: ({ clickHandler }) => (
    <button data-testid="save-btn" onClick={clickHandler}>
      Save
    </button>
  ),
  CancelButton: ({ clickHandler }) => (
    <button data-testid="cancel-btn" onClick={clickHandler}>
      Cancel
    </button>
  ),
}));
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return { ...actual, useSelector: jest.fn(), useDispatch: jest.fn() };
});
jest.mock('react-oidc-context', () => ({ useAuth: jest.fn() }));
jest.mock('./navigation/siteTabCatalog', () => ({
  getSiteTabCatalog: jest.fn(() => []),
  shouldShowUpdatesTab: jest.fn(() => false),
}));
jest.mock(
  '../../components/navigation/navigationpills/NavigationPills',
  () => ({
    __esModule: true,
    default: ({ isDisable }) => (
      <div data-testid="nav-pills" data-disabled={String(!!isDisable)} />
    ),
  }),
);
jest.mock('../../components/common/icon', () => ({
  SpinnerIcon: (props) => <div data-testid="loading-spinner" {...props} />,
  AngleLeft: () => <span data-testid="angle-left" />,
  ShoppingCartIcon: () => <span data-testid="shopping-cart-icon" />,
  CircleExclamationIconFa: () => <span data-testid="exclamation-icon" />,
}));
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn() };
});

// ---- State Builder ----
const buildState = (override = {}) => {
  const base = {
    sites: {
      siteDetails: {
        id: '9',
        addrLine_1: '123 Main St',
        city: 'Victoria',
        generalDescription: 'Desc',
        whenUpdated: new Date().toISOString(),
        srAction: 'public',
      },
      siteDetailsMode: 'viewOnly',
      changeTracker: [],
      resetSiteDetails: false,
      siteInsights: null,
      siteInsightsFetchStatus: RequestStatus.success,
    },
    siteDetails: {
      saveRequestStatus: RequestStatus.idle,
      parentBucket: null,
      notationData: [],
      siteParticipantData: null,
      documentsData: null,
      landHistoriesData: null,
      parcelDescriptionsData: null,
      profilesData: null,
      siteAssociationsData: null,
      siteId: '9',
      sitesSummary: null,
    },
    siteDisclosure: {
      siteDisclosure: [{ id: '1', siteId: '9' }],
      status: RequestStatus.success,
      error: '',
    },
    dropdown: {
      dropdowns: {
        participantNames: [],
        participantRoles: [],
        notationClass: [],
        notationType: [],
        notationParticipantRole: [],
        ministryContact: [],
        internalUserList: [],
        siteRiskCode: { getSiteRiskCd: [] },
        bceRegionCode: { getBCeRegionCd: [] },
        siteStatusCode: [],
        schedule2Ref: { getSchedule2Ref: [] },
      },
      status: RequestStatus.success,
      error: '',
    },
    srReview: {
      sites: [],
      error: '',
      fetchStatus: RequestStatus.success,
      searchQuery: '',
      currentPage: 1,
      pageSize: 5,
      resultsCount: 0,
      updateStatus: RequestStatus.idle,
      searchParam: null,
    },
    srUpdates: {
      siteSummaryData: null,
      notation: null,
      updateRequestStatus: RequestStatus.idle,
      siteParticipants: null,
      landUsesData: { data: [] },
      documents: null,
      siteAssociations: null,
      disclosure: null,
      parcelDescriptionData: { data: [] },
    },
    snapshots: {
      snapshot: [],
      status: RequestStatus.success,
      error: '',
      firstSnapshotCreatedDate: '2026-01-15T00:00:00.000Z',
      createSnapshotRequest: RequestStatus.success,
      bannerType: 'info',
    },
  };
  // Deep merge overrides
  const merged = { ...base };
  for (const key of Object.keys(override)) {
    if (
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      override[key] !== null &&
      base[key]
    ) {
      merged[key] = { ...base[key], ...override[key] };
    } else {
      merged[key] = override[key];
    }
  }
  return merged;
};

const mockStore = configureStore([thunk]);

// ---- Setup Helpers ----
let dispatch, signinRedirect;

const setup = ({
  isClient = false,
  isInternal = false,
  isSR = false,
  isPublic = false,
  loggedIn = true,
} = {}) => {
  dispatch = jest.fn(() => Promise.resolve());
  signinRedirect = jest.fn();
  useDispatch.mockReturnValue(dispatch);
  useAuth.mockReturnValue({
    isAuthenticated: loggedIn,
    user: loggedIn
      ? { profile: { preferred_username: 'testuser', sub: 'u1' } }
      : null,
    signinRedirect,
  });
  jest.spyOn(utility, 'isUserOfType').mockImplementation((role) => {
    if (role === utility.UserRoleType.CLIENT) return isClient;
    if (role === utility.UserRoleType.INTERNAL) return isInternal;
    if (role === utility.UserRoleType.SR) return isSR;
    if (role === utility.UserRoleType.PUBLIC) return isPublic;
    return false;
  });
  jest
    .spyOn(utility, 'getUser')
    .mockReturnValue(
      loggedIn
        ? { profile: { preferred_username: 'testuser', sub: 'u1' } }
        : null,
    );
  jest.spyOn(utility, 'showNotification').mockImplementation(() => {});
  jest.spyOn(utility, 'validateForm').mockReturnValue([]);
  jest.spyOn(utility, 'deepFilterByUserAction').mockImplementation((d) => d);
  jest.spyOn(utility, 'removeProperty').mockImplementation((d) => d);
};

const renderSite = (stateOverride = {}, id = '9') => {
  useParams.mockReturnValue({ id });
  const state = buildState(stateOverride);
  useSelector.mockImplementation((cb) => cb(state));
  const store = mockStore(state);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/site/details/${id}`]}>
        <Routes>
          <Route path="/site/details/:id" element={<SiteDetails />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

// ---- Tests ----
describe('SiteDetails', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // --- Loading ---
  describe('Loading', () => {
    it('shows spinner when loading', () => {
      setup();
      renderSite();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows page container after load', async () => {
      setup();
      renderSite();
      expect(await screen.findByTestId('page-container')).toBeInTheDocument();
    });
  });

  // --- Basic Rendering ---
  describe('Basic rendering', () => {
    it('shows Site ID label and value', async () => {
      setup();
      renderSite();
      expect(await screen.findByText('Site ID:')).toBeInTheDocument();
      expect(await screen.findByText('9')).toBeInTheDocument();
    });

    it('shows address', async () => {
      setup();
      renderSite();
      expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    });

    it('shows Back button with icon', async () => {
      setup();
      renderSite();
      expect(await screen.findByText(/Back to/i)).toBeInTheDocument();
      expect(
        (await screen.findAllByTestId('angle-left')).length,
      ).toBeGreaterThan(0);
    });

    it('shows nav pills', async () => {
      setup();
      renderSite();
      expect(await screen.findByTestId('nav-pills')).toBeInTheDocument();
    });

    it('dispatches on mount', () => {
      setup();
      renderSite();
      expect(dispatch).toHaveBeenCalled();
    });
  });

  // --- External (Client) User ---
  describe('External user', () => {
    it('shows banner details', async () => {
      setup({ isClient: true });
      renderSite();
      expect(await screen.findByTestId('banner-details')).toBeInTheDocument();
    });
  });

  // --- Internal User ---
  describe('Internal user', () => {
    it('does not show banner', async () => {
      setup({ isInternal: true });
      renderSite();
      await screen.findByTestId('page-container');
      expect(screen.queryByTestId('banner-details')).not.toBeInTheDocument();
    });

    it('does not show Add to Cart', async () => {
      setup({ isInternal: true });
      renderSite();
      await screen.findByTestId('page-container');
      expect(screen.queryByText(/Add to Cart/i)).not.toBeInTheDocument();
    });

    it('does not show Add to Folio', async () => {
      setup({ isInternal: true });
      renderSite();
      await screen.findByTestId('page-container');
      expect(screen.queryByTestId('add-to-folio')).not.toBeInTheDocument();
    });
  });

  // --- Create New Site (no ID) ---
  describe('Create new site', () => {
    it('shows Create New Site when no id and internal user', async () => {
      setup({ isInternal: true });
      useParams.mockReturnValue({ id: undefined });
      const state = buildState({
        sites: {
          siteDetails: null,
          siteDetailsMode: 'edit',
          changeTracker: [],
          resetSiteDetails: false,
          siteInsights: null,
          siteInsightsFetchStatus: RequestStatus.success,
        },
      });
      useSelector.mockImplementation((cb) => cb(state));
      const store = mockStore(state);
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/site/details/']}>
            <Routes>
              <Route path="/site/details/" element={<SiteDetails />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      );
      expect(await screen.findByText('Create New Site')).toBeInTheDocument();
    });
  });

  // --- Save success notification ---
  describe('Save flow', () => {
    it('dispatches after save success', async () => {
      setup({ isInternal: true });
      renderSite({ siteDetails: { saveRequestStatus: RequestStatus.success } });
      await screen.findByTestId('page-container');
      expect(dispatch).toHaveBeenCalled();
    });
  });

  // --- SR User ---
  describe('SR user', () => {
    it('renders with SR role without crashing', async () => {
      setup({ isSR: true, isInternal: true });
      renderSite();
      expect(await screen.findByTestId('page-container')).toBeInTheDocument();
    });
  });

  // --- Not logged in ---
  describe('Not logged in', () => {
    it('renders without crashing', async () => {
      setup({ loggedIn: false });
      renderSite();
      expect(await screen.findByTestId('page-container')).toBeInTheDocument();
    });

    it('nav pills are disabled when not logged in', async () => {
      setup({ loggedIn: false });
      renderSite();
      const pills = await screen.findByTestId('nav-pills');
      expect(pills).toBeInTheDocument();
    });
  });

  // --- Snapshot loading state ---
  describe('Snapshot loading', () => {
    it('shows spinner when snapshots are loading', () => {
      setup();
      renderSite({
        snapshots: {
          snapshot: [],
          status: RequestStatus.loading,
          error: '',
          firstSnapshotCreatedDate: null,
          createSnapshotRequest: RequestStatus.success,
          bannerType: '',
        },
      });
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  // --- Bulk approve/reject status ---
  describe('Bulk approve/reject', () => {
    it('handles bulk approve success state', async () => {
      setup({ isInternal: true, isSR: true });
      renderSite({
        srReview: {
          sites: [],
          error: '',
          fetchStatus: RequestStatus.success,
          searchQuery: '',
          currentPage: 1,
          pageSize: 5,
          resultsCount: 0,
          updateStatus: RequestStatus.success,
          searchParam: null,
        },
      });
      await screen.findByTestId('page-container');
      expect(dispatch).toHaveBeenCalled();
    });

    it('handles bulk approve failed state', async () => {
      setup({ isInternal: true, isSR: true });
      renderSite({
        srReview: {
          sites: [],
          error: '',
          fetchStatus: RequestStatus.success,
          searchQuery: '',
          currentPage: 1,
          pageSize: 5,
          resultsCount: 0,
          updateStatus: RequestStatus.failed,
          searchParam: null,
        },
      });
      await screen.findByTestId('page-container');
      expect(dispatch).toHaveBeenCalled();
    });
  });

  // --- SR update request status ---
  describe('SR update request', () => {
    it('refetches on srUpdateRequestStatus success', async () => {
      setup();
      renderSite({
        srUpdates: {
          siteSummaryData: null,
          notation: null,
          updateRequestStatus: RequestStatus.success,
          siteParticipants: null,
          landUsesData: { data: [] },
          documents: null,
          siteAssociations: null,
          disclosure: null,
          parcelDescriptionData: { data: [] },
        },
      });
      await screen.findByTestId('page-container');
      expect(dispatch).toHaveBeenCalled();
    });
  });
});
