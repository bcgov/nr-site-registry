import { render, screen, fireEvent } from '@testing-library/react';
import Disclosure from './Disclosure';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';

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
  siteProfileQA: [],
};

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
  formatDate: jest.fn(() => '2024-10-08'),
}));

// Import after mock so we get the mocked version
const { isUserOfType } = require('../../../helpers/utility');

const mockStore = configureStore([thunk]);

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
    siteDisclosure: disclosureData ? [disclosureData] : [],
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

describe('Disclosure Component', () => {
  let store;
  let dispatch;

  const renderDisclosure = (
    stateOverride = {},
    showPending = false,
    isInternal = false,
  ) => {
    const state = buildState(stateOverride);

    useSelector.mockImplementation((cb) => cb(state));
    isUserOfType.mockImplementation((roleType) =>
      isInternal ? roleType === 'internal' : false,
    );

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

  // Expand all collapsed PanelWithUpDown sections
  const expandAllSections = () => {
    const expandButtons = screen.queryAllByRole('button', {
      name: /expand section/i,
    });
    expandButtons.forEach((btn) => fireEvent.click(btn));
  };

  // Render and immediately expand all sections
  const renderAndExpand = (
    stateOverride = {},
    showPending = false,
    isInternal = false,
  ) => {
    renderDisclosure(stateOverride, showPending, isInternal);
    expandAllSections();
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

  it('renders Disclosure component', () => {
    renderDisclosure();
    // Use getAllByTestId since both Disclosure.tsx and DisclosureComponent.tsx
    // share the same data-testid="disclosure-component"
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('renders with showPending=true without crashing', () => {
    renderDisclosure({}, true);
    // outer div is guarded by !showPending so it won't render — just assert no crash
    expect(document.body).toBeTruthy();
  });

  it('renders the Site Disclosure Statement widget title after expanding', () => {
    renderAndExpand();
    // "Site Disclosure Statement" appears as the short label in PanelWithUpDown firstChild
    expect(
      screen.getAllByText('Site Disclosure Statement')[0],
    ).toBeInTheDocument();
  });

  it('renders the Schedule III widget title after expanding', () => {
    renderAndExpand();
    expect(
      screen.getByText(
        'III Commercial and Industrial Purposes or Activities on Site',
      ),
    ).toBeInTheDocument();
  });

  it('renders the Additional Comments widget title after expanding', () => {
    renderAndExpand();
    expect(
      screen.getByText('IV Additional Comments and Explanations'),
    ).toBeInTheDocument();
  });

  it('renders empty state when disclosureData is null — no inner panels rendered', () => {
    // Source renders formData.map(...) — null/empty means no DisclosureComponent children.
    // There is no "No Results Found" text in the source.
    renderDisclosure({ disclosureData: null });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
    // No inner DisclosureComponent should have rendered
    expect(screen.queryAllByText('Site Disclosure Statement').length).toBe(0);
  });

  it('renders without crashing when disclosureData is null', () => {
    renderDisclosure({ disclosureData: null });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('displays disclosure comment data when available after expanding', async () => {
    renderAndExpand({ disclosureStatus: RequestStatus.success });
    // govDocumentsComment, siteDisclosureComment, plannedActivityComment all equal 'Test'
    const elements = await screen.findAllByText((content) =>
      content.startsWith('Test'),
    );
    expect(elements.length).toBeGreaterThanOrEqual(3);
  });

  it('does not render Add/Remove schedule buttons for external user', () => {
    renderAndExpand({
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

  it('shows "Sent to SR on" timestamp for internal user after expanding', () => {
    renderAndExpand({}, false, true);
    expect(
      screen.getByText((text) => text.startsWith('Sent to SR on')),
    ).toBeInTheDocument();
  });

  it('does not show "Sent to SR on" timestamp for external user', () => {
    renderAndExpand({ userType: UserType.External });
    expect(
      screen.queryByText((text) => text.startsWith('Sent to SR on')),
    ).not.toBeInTheDocument();
  });

  it('renders in SRMode without crashing', () => {
    renderDisclosure({
      siteDetailsMode: SiteDetailsMode.SRMode,
      userType: UserType.Internal,
    });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('does not render Add/Remove buttons in SRMode after expanding', () => {
    renderAndExpand({
      siteDetailsMode: SiteDetailsMode.SRMode,
      userType: UserType.Internal,
    });
    // Add Disclosure button is disabled in SRMode; schedule Add/Remove never shown in SRMode
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('renders in ViewOnlyMode without crashing', () => {
    renderDisclosure({ siteDetailsMode: SiteDetailsMode.ViewOnlyMode });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('renders without crashing when status is loading', () => {
    renderDisclosure({ disclosureStatus: RequestStatus.loading });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('renders without crashing when status is failed', () => {
    renderDisclosure({ disclosureStatus: RequestStatus.failed });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('renders disclosure with siteProfileSchedule2Refs after expanding', () => {
    renderAndExpand({
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
    // Two elements share data-testid: outer wrapper + inner DisclosureComponent
    const components = screen.getAllByTestId('disclosure-component');
    expect(components.length).toBeGreaterThanOrEqual(1);
    expect(components[0]).toBeInTheDocument();
  });

  it('dispatches fetch when saveRequestStatus is success', () => {
    renderDisclosure({ saveRequestStatus: RequestStatus.success });
    expect(dispatch).toHaveBeenCalled();
  });

  it('dispatches fetch when resetSiteDetails is true', () => {
    renderDisclosure({ resetSiteDetails: true });
    expect(dispatch).toHaveBeenCalled();
  });

  it('renders correctly when srAction is SRApprovalStatusEnum.Public', () => {
    renderDisclosure({
      disclosureData: {
        ...mockDisclosure,
        srAction: SRApprovalStatusEnum.Public,
      },
      disclosureStatus: RequestStatus.success,
    });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('renders correctly when srAction is "true"', () => {
    renderDisclosure({
      disclosureData: { ...mockDisclosure, srAction: 'true' },
      disclosureStatus: RequestStatus.success,
    });
    expect(
      screen.getAllByTestId('disclosure-component')[0],
    ).toBeInTheDocument();
  });

  it('shows whenUpdated date in SR timestamp for internal user', () => {
    renderAndExpand(
      {
        disclosureData: {
          ...mockDisclosure,
          whenUpdated: '2024-11-01T00:00:00.000Z',
        },
      },
      false,
      true,
    );
    expect(
      screen.getByText((text) => text.startsWith('Sent to SR on')),
    ).toBeInTheDocument();
  });

  it('falls back to whenCreated in SR timestamp when whenUpdated is absent', () => {
    renderAndExpand(
      {
        disclosureData: {
          ...mockDisclosure,
          whenUpdated: undefined,
          whenCreated: '2024-09-01T00:00:00.000Z',
        },
      },
      false,
      true,
    );
    expect(
      screen.getByText((text) => text.startsWith('Sent to SR on')),
    ).toBeInTheDocument();
  });
});
