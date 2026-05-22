import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { RequestStatus } from '../../helpers/requests/status';
import Purchases from './Purchases';

const mockStore = configureStore([thunk]);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn().mockReturnValue({
    isAuthenticated: true,
    signinRedirect: jest.fn(),
  }),
}));

jest.mock('../../helpers/utility', () => ({
  ...jest.requireActual('../../helpers/utility'),
  getUser: jest.fn().mockReturnValue({
    profile: { sub: 'user-123', given_name: 'Test' },
  }),
}));

const renderWithProviders = (store: any) => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Purchases />
      </MemoryRouter>
    </Provider>,
  );
};

describe('Purchases Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      purchases: {
        fetchStatus: RequestStatus.success,
        purchasedSites: [
          {
            siteId: '100',
            address: '123 Main St',
            city: 'Victoria',
            purchaseDate: '2026-01-15T00:00:00Z',
            status: 'current',
          },
          {
            siteId: '200',
            address: '456 Oak Ave',
            city: 'Vancouver',
            purchaseDate: '2026-03-01T00:00:00Z',
            status: 'outdated',
          },
        ],
        totalRecords: 2,
        page: 1,
        pageSize: 10,
        sortBy: 'purchaseDate',
        sortByDir: 'DESC',
      },
    });
  });

  test('renders the Site Details heading', () => {
    renderWithProviders(store);
    expect(screen.getByText('Site Details')).toBeInTheDocument();
  });

  test('dispatches fetchPurchasedSites on mount', async () => {
    renderWithProviders(store);
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringContaining('purchases/fetchPurchasedSites'),
          }),
        ]),
      );
    });
  });

  test('renders site data in the table', () => {
    renderWithProviders(store);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Victoria')).toBeInTheDocument();
    expect(screen.getByText('Vancouver')).toBeInTheDocument();
  });

  test('renders empty table when no purchased sites', () => {
    store = mockStore({
      purchases: {
        fetchStatus: RequestStatus.success,
        purchasedSites: [],
        totalRecords: 0,
        page: 1,
        pageSize: 10,
        sortBy: 'purchaseDate',
        sortByDir: 'DESC',
      },
    });

    renderWithProviders(store);
    expect(screen.getByText('Site Details')).toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
  });

  test('formats purchaseDate as locale string', () => {
    renderWithProviders(store);
    // The date should be formatted, not raw ISO
    expect(screen.queryByText('2026-01-15T00:00:00Z')).not.toBeInTheDocument();
  });
});
