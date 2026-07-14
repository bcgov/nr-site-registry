import React from 'react';
import { render, screen } from '@testing-library/react';
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
        <LandUses />
      </Provider>,
    );

    expect(await screen.findByText('SR')).toBeInTheDocument();
  });
});
