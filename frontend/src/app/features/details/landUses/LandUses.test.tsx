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
