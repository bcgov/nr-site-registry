import { render, screen } from '@testing-library/react';
import Disclosure from './Disclosure';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';

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
};

jest.mock('react-redux', () => {
  const actualRedux = jest.requireActual('react-redux');
  return {
    ...actualRedux,
    useSelector: jest.fn(() => ({
      siteDisclosure: {
        siteDisclosure: mockDisclosure,
        status: 'success',
        error: '',
      },
      sites: {
        siteDetailsMode: 'edit',
        resetSiteDetails: false,
      },
      siteDetails: {
        saveRequestStatus: 'success',
        profilesData: [mockDisclosure],
      },
    })),
    useDispatch: jest.fn(() => ({
      siteDisclosure: {
        siteDisclosure: mockDisclosure,
        status: 'success',
        error: '',
      },
      sites: {
        siteDetailsMode: 'edit',
        userType: 'Internal',
        resetSiteDetails: false,
      },
      siteDetails: {
        saveRequestStatus: 'success',
        profilesData: [mockDisclosure],
      },
    })),
  };
});

const mockStore = configureStore([thunk]);

describe('Disclosure Component', () => {
  let store;
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn(); // Create a mock dispatch function
    store = mockStore({
      sites: {
        siteDetails: {
          siteDetailsMode: SiteDetailsMode.EditMode,
        },
      },
      siteDisclosure: {
        siteDisclosure: mockDisclosure,
        status: RequestStatus.idle,
        error: null,
      },
      user: {
        user: { userType: UserType.External },
      },
      siteDetails: {
        saveRequestStatus: 'success',
        profilesData: mockDisclosure,
      },
    });

    useSelector.mockImplementation((callback) => {
      return callback({
        sites: {
          siteDetails: {
            siteDetailsMode: SiteDetailsMode.EditMode,
          },
        },
        siteDisclosure: {
          siteDisclosure: mockDisclosure,
          status: RequestStatus.idle,
          error: null,
        },
        user: {
          user: { userType: UserType.External },
        },
        siteDetails: {
          saveRequestStatus: 'success',
          profilesData: mockDisclosure,
        },
      });
    });
    useDispatch.mockReturnValue(dispatch); // Return the mock dispatch function
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Disclosure component', () => {
    render(
      <Provider store={store}>
        <Disclosure showPending={false} />
      </Provider>,
    );
    const disclosureComponent = screen.getByTestId('disclosure-component');
    expect(disclosureComponent).toBeInTheDocument();
  });

  it('displays message when no disclosures are available', () => {
    useSelector.mockImplementation((callback) => {
      return callback({
        sites: {
          siteDetails: {
            siteDetailsMode: SiteDetailsMode.EditMode,
          },
        },
        siteDisclosure: {
          siteDisclosure: {},
          status: RequestStatus.idle,
          error: null,
        },
        user: {
          user: { userType: UserType.External },
        },
        siteDetails: {
          saveRequestStatus: 'success',
          profilesData: mockDisclosure,
        },
      });
    });
    render(
      <Provider store={store}>
        <Disclosure showPending={false} />
      </Provider>,
    );
    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });

  it('displays disclosure data when available', async () => {
    store = mockStore({
      sites: {
        siteDetails: {
          siteDetailsMode: SiteDetailsMode.EditMode,
        },
      },
      siteDisclosure: {
        siteDisclosure: mockDisclosure,
        status: RequestStatus.success,
        error: null,
      },
      user: {
        user: { userType: UserType.External },
      },
      siteDetails: {
        saveRequestStatus: 'success',
        profilesData: [mockDisclosure],
      },
    });

    render(
      <Provider store={store}>
        <Disclosure showPending={false} />
      </Provider>,
    );

    const elements = await screen.findAllByText((content) =>
      content.startsWith('Test'),
    );
    expect(elements.length).toBe(3);
    expect(elements[0].textContent).toEqual('Test');
    expect(elements[1].textContent).toEqual('Test');
    expect(elements[2].textContent).toEqual('Test');
  });
});
