import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RequestStatus } from '../../helpers/requests/status';

import { useAuth } from '../../../../node_modules/react-oidc-context';
import { getUser } from '../../helpers/utility';
import FolioContents from './FolioContent';
import { getAxiosInstance } from '../../helpers/utility';

const mockStore = configureStore([thunk]);

// Mock useAuth and getUser
jest.mock('../../../../node_modules/react-oidc-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../helpers/utility', () => ({
  getUser: jest.fn(),
  getAxiosInstance: jest.fn(),
}));

const router = createBrowserRouter([
  {
    element: <FolioContents />,
    path: '/',
  },
]);

describe('Folio Component', () => {
  let store;

  beforeEach(() => {
    useAuth.mockReturnValue({
      // Mock the values returned by useAuth
      isAuthenticated: true,
      user: { name: 'Test User', email: 'test@example.com' }, // Example user object
    });

    getUser.mockReturnValue({
      name: 'Test User',
      email: 'test@example.com',
      profile: {
        sub: '1',
      },
    });

    getAxiosInstance.mockReturnValue({
      url: '',
      post: () => {},
    });

    store = mockStore({
      folio: {
        fetchRequestStatus: RequestStatus.idle,
        addRequestStatus: RequestStatus.idle,
        deleteRequestStatus: RequestStatus.idle,
        updateRequestStatus: RequestStatus.idle,
        folioItems: [],
        addSiteToFolioRequest: RequestStatus.idle,
        sitesArray: [],
        deleteSiteInFolioRequest: RequestStatus.idle,
      },
    });
  });

  test('renders Folio Contents Page', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={router}>
          <FolioContents />
        </RouterProvider>
      </Provider>,
    );
    expect(screen.getByText('Folio Contents')).toBeInTheDocument();
  });
});
