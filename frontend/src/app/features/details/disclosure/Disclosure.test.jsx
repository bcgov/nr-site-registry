import { render, screen, fireEvent } from '@testing-library/react';
import Disclosure from './Disclosure';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockDisclosure = {
  id: '900bc9eb-46b4-4708-bb4c-bea32e59390a',
  siteId: '9',
  dateCompleted: '2024-10-08T07:00:00.000Z',
  rwmDateDecision: '2024-10-08T07:00:00.000Z',
  localAuthDateRecd: '2024-10-08T07:00:00.000Z',
  siteRegDateEntered: '2024-10-18T07:00:00.000Z',
  siteRegDateRecd: '2024-10-08T07:00:00.000Z',
  govDocumentsComment: 'Test',
  siteDisclosureComment: 'Test',
  plannedActivityComment: 'Test',
  srAction: 'false',
  siteProfileSchedule2Refs: [],
};

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('react-redux', () => {
  const actualRedux = jest.requireActual('react-redux');
  return {
    ...actualRedux,
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
  };
});

// Mock utility so we can control isUserOfType per test
jest.mock('../../../helpers/utility', () => ({
  ...jest.requireActual('../../../helpers/utility'),
  isUserOfType: jest.fn(() => false),
  getUser: jest.fn(() => null),
  flattenFormRows: jest.fn(() => []),
  serializeDate: jest.fn((v) => v),
  sortArray: jest.fn((arr) => arr),
}));

// Import after mock so we get the mocked version
const { isUserOfType } = require('../../../helpers/utility');

const mockStore = configureStore([thunk]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildState = ({
  siteDetailsMode = SiteDetailsMode.EditMode,
  userType = UserType.External,
  disclosureData = mockDisclosure,
  disclosureStatus = RequestStatus.idle,
  saveRequestStatus = 'idle',
  resetSiteDetails = false,
} = {}) => ({
  sites: {
    siteDetails: { siteDetailsMode },
    resetSiteDetails,
  },
  siteDisclosure: {
    siteDisclosure: disclosureData,
    status: disclosureStatus,
    error: null,
  },
  user: { user: { userType } },
  siteDetails: {
    saveRequestStatus,
    profilesData: disclosureData ? [disclosureData] : [],
    siteDisclosure: disclosureData,
  },
  dropdown: {
    dropdowns: {
      internalUserList: [],
      participantRoles: { getNotationParticipantRoleCd: [] },
      notationClass: { getNotationClassCd: [] },
      notationType: { getNotationTypeCd: [] },
      notationParticipantRole: { getNotationParticipantRoleCd: [] },
      participantNames: { getPeopleOrgsCd: [] },
      ministryContact: { getPeopleOrgsCd: [] },
      siteRiskCode: { getSiteRiskCd: { data: [{ key: 'LOW', value: 'Low' }] } },
      bceRegionCode: {
        getBCeRegionCd: { data: [{ key: '1', value: 'Region 1' }] },
      },
      siteStatusCode: {
        getSiteStatusCd: { data: [{ key: 'ACTIVE', value: 'Active' }] },
      },
      schedule2Ref: {
        getSchedule2Ref: {
          data: [
            { key: 'S2-1', value: 'Schedule 2 Ref 1', metaData: 'Meta 1' },
          ],
        },
      },
    },
  },
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Disclosure Component', () => {
  let store;
  let dispatch;

  // Wrap in a real route so useParams() gets { id: '9' }
  const renderDisclosure = (
    stateOverride = {},
    showPending = false,
    isInternal = false,
  ) => {
    const state = buildState(stateOverride);
    useSelector.mockImplementation((cb) => cb(state));
    // isUserOfType is called with UserRoleType values; return true for INTERNAL when isInternal=true
    isUserOfType.mockImplementation((roleType) => {
      if (isInternal) return roleType === 'internal';
      return false;
    });
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/site/details/9']}>
          <Routes>
            <Route
              path="/site/details/:id"
              element={<Disclosure showPending={showPending} />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
  };

  beforeEach(() => {
    dispatch = jest.fn();
    store = mockStore(buildState());
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((cb) => cb(buildState()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Basic rendering ────────────────────────────────────────────────────────

  it('renders Disclosure component', () => {
    renderDisclosure();
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  it('renders with showPending=true without crashing', () => {
    renderDisclosure({}, true);
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  it('renders the Site Disclosure Statement widget title', () => {
    renderDisclosure();
    expect(
      screen.getByText('Site Disclosure Statement (Sec. III and IV)'),
    ).toBeInTheDocument();
  });

  it('renders the Schedule III widget title', () => {
    renderDisclosure();
    expect(
      screen.getByText(
        'III Commercial and Industrial Purposes or Activities on Site',
      ),
    ).toBeInTheDocument();
  });

  it('renders the Additional Comments widget title', () => {
    renderDisclosure();
    expect(
      screen.getByText('IV Additional Comments and Explanations'),
    ).toBeInTheDocument();
  });

  // ── No data ────────────────────────────────────────────────────────────────

  it('displays message when no disclosures are available', () => {
    renderDisclosure({ disclosureData: {} });
    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });

  it('renders without crashing when disclosureData is null', () => {
    renderDisclosure({ disclosureData: null });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  // ── Disclosure data present ────────────────────────────────────────────────

  it('displays disclosure comment data when available', async () => {
    renderDisclosure({ disclosureStatus: RequestStatus.success });
    const elements = await screen.findAllByText((content) =>
      content.startsWith('Test'),
    );
    expect(elements.length).toBe(3);
    expect(elements[0].textContent).toEqual('Test');
    expect(elements[1].textContent).toEqual('Test');
    expect(elements[2].textContent).toEqual('Test');
  });

  // ── Internal user ──────────────────────────────────────────────────────────

  it('does not render Add/Remove buttons for external user', () => {
    renderDisclosure({
      userType: UserType.External,
      siteDetailsMode: SiteDetailsMode.EditMode,
      disclosureData: {
        ...mockDisclosure,
        siteProfileSchedule2Refs: [],
      },
    });
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('shows "Sent to SR on" timestamp for internal user', () => {
    renderDisclosure({}, false, true); // isInternal = true
    expect(
      screen.getByText((text) => text.startsWith('Sent to SR on')),
    ).toBeInTheDocument();
  });

  it('does not show "Sent to SR on" timestamp for external user', () => {
    renderDisclosure({ userType: UserType.External });
    expect(
      screen.queryByText((text) => text.startsWith('Sent to SR on')),
    ).not.toBeInTheDocument();
  });

  // ── SR Mode ────────────────────────────────────────────────────────────────

  it('renders in SRMode without crashing', () => {
    renderDisclosure({
      siteDetailsMode: SiteDetailsMode.SRMode,
      userType: UserType.Internal,
    });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  it('does not render Add/Remove buttons in SRMode', () => {
    renderDisclosure({
      siteDetailsMode: SiteDetailsMode.SRMode,
      userType: UserType.Internal,
    });
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  // ── ViewOnlyMode ───────────────────────────────────────────────────────────

  it('renders in ViewOnlyMode without crashing', () => {
    renderDisclosure({ siteDetailsMode: SiteDetailsMode.ViewOnlyMode });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  // ── Request statuses ───────────────────────────────────────────────────────

  it('renders without crashing when status is loading', () => {
    renderDisclosure({ disclosureStatus: RequestStatus.loading });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  it('renders without crashing when status is failed', () => {
    renderDisclosure({ disclosureStatus: RequestStatus.failed });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  // ── Schedule refs ──────────────────────────────────────────────────────────

  it('renders disclosure with siteProfileSchedule2Refs', () => {
    renderDisclosure({
      disclosureData: {
        ...mockDisclosure,
        siteProfileSchedule2Refs: [
          {
            id: 'ref-1',
            schedule2ReferenceCode: 'S2-1',
            srAction: 'false',
            srValue: false,
          },
        ],
      },
      disclosureStatus: RequestStatus.success,
      userType: UserType.Internal,
      siteDetailsMode: SiteDetailsMode.EditMode,
    });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  // ── Side-effects / dispatch ────────────────────────────────────────────────

  it('dispatches fetch when saveRequestStatus is success', () => {
    renderDisclosure({ saveRequestStatus: RequestStatus.success });
    expect(dispatch).toHaveBeenCalled();
  });

  it('dispatches fetch when resetSiteDetails is true', () => {
    renderDisclosure({ resetSiteDetails: true });
    expect(dispatch).toHaveBeenCalled();
  });

  // ── srAction variants ──────────────────────────────────────────────────────

  it('renders correctly when srAction is "PUBLIC"', () => {
    renderDisclosure({
      disclosureData: { ...mockDisclosure, srAction: 'PUBLIC' },
      disclosureStatus: RequestStatus.success,
    });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  it('renders correctly when srAction is "true"', () => {
    renderDisclosure({
      disclosureData: { ...mockDisclosure, srAction: 'true' },
      disclosureStatus: RequestStatus.success,
    });
    expect(screen.getByTestId('disclosure-component')).toBeInTheDocument();
  });

  // ── Timestamp fallbacks ────────────────────────────────────────────────────

  it('shows whenUpdated date in SR timestamp for internal user', () => {
    renderDisclosure(
      {
        disclosureData: {
          ...mockDisclosure,
          whenUpdated: '2024-11-01T00:00:00.000Z',
        },
      },
      false,
      true, // isInternal
    );
    expect(
      screen.getByText((text) => text.startsWith('Sent to SR on')),
    ).toBeInTheDocument();
  });

  it('falls back to whenCreated in SR timestamp when whenUpdated is absent', () => {
    renderDisclosure(
      {
        disclosureData: {
          ...mockDisclosure,
          whenUpdated: undefined,
          whenCreated: '2024-09-01T00:00:00.000Z',
        },
      },
      false,
      true, // isInternal
    );
    expect(
      screen.getByText((text) => text.startsWith('Sent to SR on')),
    ).toBeInTheDocument();
  });
});
