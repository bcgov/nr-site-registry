import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GRAPHQL } from '../../helpers/endpoints';
import * as utility from '../../helpers/utility';
import Purchases from './Purchases';

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

const purchasedSites = [
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
];

type PurchaseBody = {
  operationName?: string;
  variables?: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortByDir?: string;
  };
};

function renderPurchases() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Purchases />
        </QueryParamProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function purchaseResponse(
  data: typeof purchasedSites,
  totalRecords: number,
): [number, object] {
  return [
    200,
    {
      data: {
        getPurchasedSites: {
          httpStatusCode: data.length > 0 ? 200 : 404,
          data,
          totalRecords,
        },
      },
    },
  ];
}

describe('Purchases Component', () => {
  let mock: MockAdapter;
  let requests: PurchaseBody['variables'][];

  beforeEach(() => {
    requests = [];
    jest.spyOn(utility, 'getUser').mockReturnValue({
      profile: { sub: 'user-123', given_name: 'Test' },
    } as ReturnType<typeof utility.getUser>);
    jest.spyOn(utility, 'getAxiosInstance').mockReturnValue(axios);
    mock = new MockAdapter(axios);
    mock.onPost(GRAPHQL).reply((config) => {
      const body: PurchaseBody =
        typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      requests.push(body.variables);
      const rows =
        body.variables?.page === 1
          ? purchasedSites
          : ([] as typeof purchasedSites);
      return purchaseResponse(rows, rows.length);
    });
  });

  afterEach(() => {
    mock.restore();
    jest.restoreAllMocks();
  });

  test('renders the Site Details heading', async () => {
    renderPurchases();
    expect(await screen.findByText('Site Details')).toBeInTheDocument();
  });

  test('requests purchased sites on mount', async () => {
    renderPurchases();
    await screen.findByText('100');
    expect(requests[0]).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: 10,
        sortBy: 'purchaseDate',
        sortByDir: 'DESC',
      }),
    );
    expect(mock.history.post[0].signal).toEqual(expect.any(AbortSignal));
  });

  test('renders site data in the table', async () => {
    renderPurchases();
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Site ID 100' })).toHaveClass(
      'table-cell-link',
    );
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Victoria')).toBeInTheDocument();
    expect(screen.getByText('Vancouver')).toBeInTheDocument();
  });

  test('renders empty table when no purchased sites', async () => {
    mock.reset();
    mock.onPost(GRAPHQL).reply(() => purchaseResponse([], 0));
    renderPurchases();
    expect(await screen.findByText('No Results Found')).toBeInTheDocument();
    expect(screen.getByText('Site Details')).toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
  });

  test('formats purchaseDate as locale string', async () => {
    renderPurchases();
    await screen.findByText('100');
    expect(screen.queryByText('2026-01-15T00:00:00Z')).not.toBeInTheDocument();
  });
});
