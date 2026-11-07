import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LandUses from './LandUses';
import { UserRoleType } from '../../../helpers/utility';

/* =========================
   Mocks
========================= */

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
}));

jest.mock('../../../helpers/utility', () => ({
  ...jest.requireActual('../../../helpers/utility'),
  isUserOfType: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

/* =========================
   Stable Redux State
========================= */

const mockReduxState = {
  landUses: {
    landUses: [],
    landUseCodes: [],
    landUsesFetchRequestStatus: 'SUCCESS',
    landUseCodesFetchRequestStatus: 'SUCCESS',
  },
  sites: {
    siteDetailsMode: 'VIEW',
    siteDetails: {},
    changeTracker: {},
    resetSiteDetails: false,
    siteInsights: {},
  },
};

/* =========================
   Dummy Store
========================= */

const store = configureStore({
  reducer: {
    dummy: (state = {}) => state,
  },
});

/* =========================
   Tests
========================= */

const { isUserOfType } = jest.requireMock('../../../helpers/utility');

describe('LandUses – SR column visibility', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((selector) =>
      selector(mockReduxState),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows SR column for internal users', async () => {
    isUserOfType.mockImplementation(
      (role: string) => role === UserRoleType.INTERNAL,
    );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <LandUses />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>,
    );

    expect(await screen.findByText('SR')).toBeInTheDocument();
  });

  it('keeps the search text in the address bar', () => {
    isUserOfType.mockReturnValue(false);

    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={['/site/details/123/landuses?search=park']}
        >
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <LandUses />
            <LocationSearch />
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>,
    );

    const input = screen.getByLabelText('Search');
    expect(input).toHaveValue('park');

    fireEvent.change(input, { target: { value: 'trail' } });
    expect(screen.getByTestId('location')).toHaveTextContent('search=trail');
  });
});

function LocationSearch() {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
}
