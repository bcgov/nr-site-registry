import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Disclosure from './Disclosure';
import { Provider, useSelector } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import {
  disclosureCommentsConfig,
  disclosureScheduleExternalConfig,
  disclosureScheduleInternalConfig,
  disclosureStatementConfig,
  srVisibilityConfig,
} from './DisclosureConfig';
import { siteDisclosure, updateSiteDisclosure } from './DisclosureSlice';
import { RequestStatus } from '../../../helpers/requests/status';
import { Minus, Plus } from '../../../components/common/icon';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';

// Mocking the useSelector hook with the correct state structure
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));
const mockStore = configureStore([thunk]);

describe('Disclosure Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
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
    });

    useSelector.mockImplementation((callback) => {
      return callback({
        sites: {
          siteDetails: {
            siteDetailsMode: SiteDetailsMode.EditMode,
          },
        },
        siteDisclosure: {
          siteDisclosure: {
            siteId: '9',
            dateCompleted: '1997-09-09T07:00:00.000Z',
            rwmDateDecision: '1997-09-09T07:00:00.000Z',
            localAuthDateRecd: '1997-09-09T07:00:00.000Z',
            siteRegDateEntered: null,
            siteRegDateRecd: null,
            govDocumentsComment: 'TESTING GOV DOCS COMMENTS.',
            siteDisclosureComment: 'TESTING SITE DISCLOSURE COMMENTS.',
            plannedActivityComment: 'TESTING COMMENT IN PLANNED ACTIVITY.',
            siteDisclosure: [
              { id: 1, statement: 'TESTING GOV DOCS COMMENTS.' },
            ],
            status: RequestStatus.succeeded,
          },
        },
        user: {
          user: { userType: UserType.External },
        },
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Disclosure component', () => {
    render(
      <Provider store={store}>
        <Disclosure />
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
      });
    });
    render(
      <Provider store={store}>
        <Disclosure />
      </Provider>,
    );
    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });

  test('displays disclosure data when available', async () => {
    store = mockStore({
      ...store.getState().disclosure,
      status: RequestStatus.loading,
    });

    render(
      <Provider store={store}>
        <Disclosure />
      </Provider>,
    );
    expect(
      screen.getByText((content, element) =>
        content.startsWith('TESTING GOV DOCS COMMENTS.'),
      ),
    ).toBeInTheDocument();
  });
});
