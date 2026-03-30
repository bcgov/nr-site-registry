import React from 'react';
import { render, screen } from '@testing-library/react';
import LandUses from './LandUses';
import { UserRoleType } from '../../../helpers/utility';


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

    expect(await screen.findByText('SR')).toBeInTheDocument();
  });
});