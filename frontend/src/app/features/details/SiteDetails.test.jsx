import { render, screen } from '@testing-library/react';
import SiteDetails from './SiteDetails';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { SiteDetailsMode } from './dto/SiteDetailsMode';
import { RequestStatus } from '../../helpers/requests/status';
import { useAuth } from 'react-oidc-context';
import PageContainer from '../../components/simple/PageContainer';

// ---------------- MOCKS ----------------
jest.mock('../../components/simple/PageContainer', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="page-container">{children}</div>,
  PageContainer: ({ children }) => (
    <div data-testid="page-container">{children}</div>
  ),
}));

jest.mock('../../components/simple/CustomLabel', () => ({
  __esModule: true,
  default: ({ label }) => <div>{label}</div>,
}));

jest.mock('../../components/modaldialog/ModalDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="modal-dialog" />,
}));

jest.mock('../../components/action/Actions', () => ({
  __esModule: true,
  default: () => <div data-testid="actions" />,
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
  Button: ({ children }) => <button>{children}</button>,
}));

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
  };
});

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./navigation/NavigationPillsConfig', () => ({
  getNavComponents: jest.fn(() => []),
}));

// ✅ FIXED (handles both default + named export)
jest.mock(
  '../../components/navigation/navigationpills/NavigationPills',
  () => ({
    __esModule: true,
    default: () => <div data-testid="nav-pills" />,
    NavigationPills: () => <div data-testid="nav-pills" />,
  }),
);

jest.mock('../../components/common/icon', () => ({
  SpinnerIcon: (props) => <div data-testid="loading-spinner" {...props} />,
}));

// ---------------- MOCK react-router-dom ----------------
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn(), // mock here
    MemoryRouter: actual.MemoryRouter,
    Route: actual.Route,
    Routes: actual.Routes,
  };
});

// ---------------- STATE ----------------
const buildState = (override = {}) => ({
  sites: {
    siteDetails: {
      id: '9',
      addrLine_1: '123 Main St',
      saveRequestStatus: RequestStatus.success,
    },
    siteDetailsMode: 'normal',
    changeTracker: [],
    resetSiteDetails: false,
    siteInsights: null,
    siteInsightsFetchStatus: RequestStatus.success,
  },

  siteDetails: {
    saveRequestStatus: RequestStatus.success,
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
    siteDisclosure: {
      id: '1',
      siteId: '9',
    },
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
    updateStatus: RequestStatus.success,
    searchParam: null,
  },

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

  snapshots: {
    snapshot: [],
    status: RequestStatus.success,
    error: '',
    firstSnapshotCreatedDate: null,
    createSnapshotRequest: RequestStatus.success,
    bannerType: '',
  },

  ...override,
});

// ---------------- STORE ----------------
const mockStore = configureStore([thunk]);

// ---------------- TEST ----------------
describe('SiteDetails Component', () => {
  let store;
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    store = mockStore(buildState());
    useParams.mockImplementation(() => ({ id: '9' }));
    useDispatch.mockReturnValue(dispatch);

    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { profile: { preferred_username: 'testuser' } },
    });

    useSelector.mockImplementation((cb) => cb(buildState()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (stateOverride = {}) => {
    useSelector.mockImplementation((cb) => cb(buildState(stateOverride)));

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/site/details/9']}>
          <Routes>
            <Route path="/site/details/:id" element={<SiteDetails />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  // ---------------- CASES ----------------
  it('renders SiteDetails component', async () => {
    renderComponent();
    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
  });
});
