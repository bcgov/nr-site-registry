import React from 'react';
import { render, screen } from '@testing-library/react';
import LandUses from './LandUses';
import { UserRoleType } from '../../../helpers/utility';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
}));
