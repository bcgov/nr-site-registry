import React from 'react';
import { render, screen } from '@testing-library/react';
import LandUses from './LandUses';
import { UserRoleType } from '../../../helpers/utility';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
}));

/* =========================
   MOCK react-redux
========================= */
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => ({
    landUses: [],
    landUseCodes: [],
    landUsesFetchRequestStatus: 'idle',
    landUseCodesFetchRequestStatus: 'idle',
  }),
}));

/* =========================
   MOCK utilities
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