import React from 'react';
import { render, screen } from '@testing-library/react';
import LandUses from './LandUses';
import { UserType } from '../../../helpers/requests/userType';
import { UserRoleType } from '../../../helpers/utility';

/* =========================
   MOCKS
   ========================= */

jest.mock('../../../helpers/utility', () => ({
  getUser: jest.fn(() => ({ id: 'test-user' })),
  isUserOfType: jest.fn(),
  UserRoleType: {
    INTERNAL: 'INTERNAL',
    CLIENT: 'CLIENT',
    PUBLIC: 'PUBLIC',
  },
}));

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
   TESTS
   ========================= */

const { isUserOfType } = jest.requireMock('../../../helpers/utility');

describe('LandUses – SR column visibility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows SR column for internal users', async () => {
    isUserOfType.mockImplementation(
      (role: string) => role === UserRoleType.INTERNAL
    );

    render(<LandUses />);

    expect(
      await screen.findByText('srApprovalStatus')
    ).toBeInTheDocument();
  });

  it('hides SR column for external users', async () => {
    isUserOfType.mockImplementation(
      (role: string) =>
        role === UserRoleType.CLIENT || role === UserRoleType.PUBLIC
    );

    render(<LandUses />);

    expect(
      screen.queryByText('srApprovalStatus')
    ).not.toBeInTheDocument();
  });
});
