import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LandUses from './LandUses';
import { UserRoleType } from '../../../helpers/utility';

/* =========================
   MOCKS
========================= */

// Mock user utilities
jest.mock('../../../helpers/utility', () => ({
  getUser: jest.fn(() => ({ id: 'test-user' })),
  isUserOfType: jest.fn(),
  UserRoleType: {
    INTERNAL: 'INTERNAL',
    CLIENT: 'CLIENT',
    PUBLIC: 'PUBLIC',
  },
}));

// Mock LandUseTable to just render column keys
jest.mock('./LandUseTable', () => {
  return ({ columns }: any) => (
    <div>
      {columns.map((col: any) => (
        <div key={col.graphQLPropertyName}>
          {col.graphQLPropertyName}
        </div>
      ))}
    </div>
  );
});

/* =========================
   HELPERS
========================= */

const { isUserOfType } = jest.requireMock('../../../helpers/utility');

const renderWithStore = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: () => ({}), // minimal dummy reducer
  });

  return render(<Provider store={store}>{ui}</Provider>);
};

/* =========================
   TESTS
========================= */

describe('LandUses – SR column visibility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows SR column for internal users', async () => {
    isUserOfType.mockImplementation(
      (role: string) => role === UserRoleType.INTERNAL
    );

    renderWithStore(<LandUses />);

    expect(
      await screen.findByText('srApprovalStatus')
    ).toBeInTheDocument();
  });

  it('hides SR column for external users', async () => {
    isUserOfType.mockImplementation(
      (role: string) =>
        role === UserRoleType.CLIENT || role === UserRoleType.PUBLIC
    );

    renderWithStore(<LandUses />);

    expect(
      screen.queryByText('srApprovalStatus')
    ).not.toBeInTheDocument();
  });
});