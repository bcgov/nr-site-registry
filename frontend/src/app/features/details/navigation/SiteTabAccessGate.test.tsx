import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useAuth } from 'react-oidc-context';

import { RequestStatus } from '../../../helpers/requests/status';
import { isUserOfType, UserRoleType } from '../../../helpers/utility';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { SiteTabPath } from './siteTabCatalog';
import SiteTabAccessGate from './SiteTabAccessGate';

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../helpers/utility', () => {
  const actual = jest.requireActual('../../../helpers/utility');
  return {
    ...actual,
    isUserOfType: jest.fn(),
  };
});

jest.mock('../../../components/login/LoginDropdown', () => ({
  LoginDropdown: (title: string) => (
    <div data-testid="login-dropdown">
      <span>{title}</span>
      <button type="button">Basic/Business BCeID</button>
      <button type="button">BC Services Card</button>
      <button type="button">IDIR</button>
    </div>
  ),
}));

jest.mock('./PurchaseAccessPrompt', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="purchase-access-prompt">
      <span>
        In order to view this site’s details, please purchase access using the
        button below.
      </span>
      <button type="button">Purchase Site Details</button>
    </div>
  ),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedIsUserOfType = isUserOfType as jest.MockedFunction<
  typeof isUserOfType
>;

const mockStore = configureStore([thunk]);

type Role = 'anonymous' | 'client' | 'internal' | 'sr';

type RenderOptions = {
  tab?: SiteTabPath;
  role?: Role;
  isAuthLoading?: boolean;
  snapshotStatus?: RequestStatus;
  hasPurchasedSnapshot?: boolean;
  hasPendingUpdates?: boolean;
  mode?: SiteDetailsMode;
};

const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
};

const buildState = ({
  snapshotStatus = RequestStatus.success,
  hasPurchasedSnapshot = false,
  hasPendingUpdates = false,
  mode = SiteDetailsMode.ViewOnlyMode,
}: RenderOptions = {}) => ({
  sites: {
    siteDetails: { id: '9' },
    siteDetailsMode: mode,
  },
  snapshots: {
    snapshot: hasPurchasedSnapshot ? { data: [{ siteId: '9' }] } : [],
    status: snapshotStatus,
    error: '',
    firstSnapshotCreatedDate: hasPurchasedSnapshot
      ? '2026-01-15T00:00:00.000Z'
      : null,
    createSnapshotRequest: RequestStatus.idle,
    bannerType: '',
  },
  srUpdates: {
    siteSummaryData: hasPendingUpdates ? { id: '9' } : null,
    notation: hasPendingUpdates ? [{ id: '1' }] : [],
    updateRequestStatus: RequestStatus.idle,
    siteParticipants: hasPendingUpdates ? [{ id: '1' }] : [],
    landUsesData: hasPendingUpdates ? [{ id: '1' }] : [],
    documents: hasPendingUpdates ? [{ id: '1' }] : [],
    siteAssociations: hasPendingUpdates ? [{ id: '1' }] : [],
    disclosure: hasPendingUpdates ? [{ id: '1' }] : [],
    parcelDescriptionData: hasPendingUpdates
      ? { data: [{ id: '1' }] }
      : { data: [] },
  },
});

const stubAuth = (role: Role, isAuthLoading: boolean) => {
  mockedUseAuth.mockReturnValue({
    isLoading: isAuthLoading,
    isAuthenticated: role !== 'anonymous',
    user: role === 'anonymous' ? null : { profile: { sub: 'u1' } },
  } as never);

  mockedIsUserOfType.mockImplementation((userRole) => {
    if (role === 'client') return userRole === UserRoleType.CLIENT;
    if (role === 'internal') return userRole === UserRoleType.INTERNAL;
    if (role === 'sr') return userRole === UserRoleType.SR;
    return false;
  });
};

const renderGate = ({
  tab = 'notations',
  role = 'internal',
  isAuthLoading = false,
  ...stateOptions
}: RenderOptions = {}) => {
  stubAuth(role, isAuthLoading);
  const store = mockStore(
    buildState({ tab, role, isAuthLoading, ...stateOptions }),
  );

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/site/details/9/${tab}`]}>
        <Routes>
          <Route
            path="/site/details/:id"
            element={
              <>
                <LocationDisplay />
                <Outlet />
              </>
            }
          >
            <Route
              path=":tab"
              element={
                <SiteTabAccessGate tab={tab}>
                  <div>{`${tab}-view`}</div>
                </SiteTabAccessGate>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('SiteTabAccessGate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mounts Summary with no session and no sign-in prompt', () => {
    renderGate({ tab: 'summary', role: 'anonymous' });

    expect(screen.getByText('summary-view')).toBeInTheDocument();
    expect(screen.queryByTestId('gated-tab-signin')).not.toBeInTheDocument();
  });

  it('shows sign-in UI for unauthenticated notations and does not mount the data view', () => {
    renderGate({ tab: 'notations', role: 'anonymous' });

    expect(screen.getByTestId('gated-tab-signin')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to view this site’s details.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Basic/Business BCeID')).toBeInTheDocument();
    expect(screen.getByText('BC Services Card')).toBeInTheDocument();
    expect(screen.getByText('IDIR')).toBeInTheDocument();
    expect(screen.queryByText('notations-view')).not.toBeInTheDocument();
  });

  it('shows the purchase prompt for an unpurchased Client and keeps the URL', () => {
    renderGate({
      tab: 'notations',
      role: 'client',
      hasPurchasedSnapshot: false,
    });

    expect(screen.getByTestId('purchase-access-prompt')).toBeInTheDocument();
    expect(
      screen.getByText(/In order to view this site’s details/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Purchase Site Details')).toBeInTheDocument();
    expect(screen.queryByText('notations-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations',
    );
  });

  it('does not show a purchase prompt for Internal users', () => {
    renderGate({
      tab: 'notations',
      role: 'internal',
      hasPurchasedSnapshot: false,
    });

    expect(screen.getByText('notations-view')).toBeInTheDocument();
    expect(
      screen.queryByTestId('purchase-access-prompt'),
    ).not.toBeInTheDocument();
  });

  it('shows sign-in UI for unauthenticated Updates and does not redirect yet', () => {
    renderGate({ tab: 'updates', role: 'anonymous' });

    expect(screen.getByTestId('gated-tab-signin')).toBeInTheDocument();
    expect(screen.getByText('IDIR')).toBeInTheDocument();
    expect(screen.queryByText('updates-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/updates',
    );
  });

  it('replace-redirects a non–Site Registrar away from Updates to Summary', () => {
    renderGate({ tab: 'updates', role: 'internal' });

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/summary',
    );
    expect(screen.queryByText('updates-view')).not.toBeInTheDocument();
  });

  it('replace-redirects a Site Registrar without pending updates from Updates to Summary', () => {
    renderGate({ tab: 'updates', role: 'sr', hasPendingUpdates: false });

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/summary',
    );
    expect(screen.queryByText('updates-view')).not.toBeInTheDocument();
  });

  it('mounts Updates for an allowed Site Registrar', () => {
    renderGate({
      tab: 'updates',
      role: 'sr',
      hasPendingUpdates: true,
    });

    expect(screen.getByText('updates-view')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/updates',
    );
  });

  it('renders no tab body while auth is loading', () => {
    renderGate({ tab: 'notations', role: 'anonymous', isAuthLoading: true });

    expect(screen.queryByText('notations-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gated-tab-signin')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('purchase-access-prompt'),
    ).not.toBeInTheDocument();
  });

  it('renders no tab body while an unpurchased Client snapshot is loading', () => {
    renderGate({
      tab: 'notations',
      role: 'client',
      snapshotStatus: RequestStatus.loading,
      hasPurchasedSnapshot: false,
    });

    expect(screen.queryByText('notations-view')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('purchase-access-prompt'),
    ).not.toBeInTheDocument();
  });

  it('mounts the gated tab after a Client has purchased a snapshot', () => {
    renderGate({
      tab: 'notations',
      role: 'client',
      hasPurchasedSnapshot: true,
    });

    expect(screen.getByText('notations-view')).toBeInTheDocument();
    expect(
      screen.queryByTestId('purchase-access-prompt'),
    ).not.toBeInTheDocument();
  });
});
