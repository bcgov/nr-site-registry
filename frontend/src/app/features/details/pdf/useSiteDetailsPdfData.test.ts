import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import React from 'react';
import { RequestStatus } from '../../../helpers/requests/status';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: jest.fn().mockResolvedValue({ data: { data: {} } }),
    })),
  },
}));

jest.mock('../../../helpers/utility', () => ({
  isUserOfType: jest.fn().mockReturnValue(false),
  UserRoleType: {
    CLIENT: 'client',
    INTERNAL: 'internal',
    SR: 'sr',
    PUBLIC: 'public',
  },
  getUser: jest.fn().mockReturnValue({ profile: { sub: 'user-123' } }),
  getAxiosInstance: jest.fn().mockReturnValue({
    post: jest.fn().mockResolvedValue({
      data: {
        data: {
          getParcelDescriptionsBySiteId: { data: [] },
          getLandHistoriesForSite: { data: [] },
        },
      },
    }),
  }),
}));

jest.mock('@react-pdf/renderer', () => ({
  StyleSheet: { create: (s: any) => s },
  Font: { register: jest.fn() },
}));

import { useSiteDetailsPdfData } from './useSiteDetailsPdfData';

const mockStore = configureStore([thunk]);

const createStore = (overrides: any = {}) =>
  mockStore({
    sites: {
      siteDetails: { id: '137', commonName: 'Test Site' },
      ...overrides.sites,
    },
    snapshots: {
      snapshot: { data: [{ siteId: '137', whenCreated: '2026-01-01' }] },
      status: RequestStatus.success,
      firstSnapshotCreatedDate: '2026-01-01',
      ...overrides.snapshots,
    },
    notationParticipant: { siteNotation: [], status: RequestStatus.success },
    siteParticipant: { siteParticipants: [], status: RequestStatus.success },
    documents: { siteDocuments: [], status: RequestStatus.success },
    siteDisclosure: { siteDisclosure: {}, status: RequestStatus.success },
    associatedSites: { siteAssociate: [], status: RequestStatus.success },
    landUses: {
      landUses: [],
      landUsesFetchRequestStatus: RequestStatus.success,
    },
    parcelDescriptions: { data: [], requestStatus: RequestStatus.success },
    dropdown: {
      dropdowns: {
        notationType: { getNotationTypeCd: { data: [] } },
        notationClass: { getNotationClassCd: { data: [] } },
        ministryContact: { getPeopleOrgsCd: { data: [] } },
        notationParticipantRole: { getNotationParticipantRoleCd: { data: [] } },
        participantRoles: { getParticipantRoleCd: { data: [] } },
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(Provider, { store: createStore() }, children);

describe('useSiteDetailsPdfData', () => {
  test('returns isSiteReady true when site details exist', () => {
    const { result } = renderHook(() => useSiteDetailsPdfData(), { wrapper });
    expect(result.current.isSiteReady).toBe(true);
  });

  test('returns isSiteReady false when site details are null', () => {
    const store = createStore({ sites: { siteDetails: null } });
    const nullWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store }, children);
    const { result } = renderHook(() => useSiteDetailsPdfData(), {
      wrapper: nullWrapper,
    });
    expect(result.current.isSiteReady).toBe(false);
  });

  test('fetchForPdf returns a SiteDetailsPdfData object', async () => {
    const { result } = renderHook(() => useSiteDetailsPdfData(), { wrapper });
    const data = await result.current.fetchForPdf();
    expect(data).toHaveProperty('site');
    expect(data).toHaveProperty('notations');
    expect(data).toHaveProperty('participants');
    expect(data).toHaveProperty('documents');
    expect(data).toHaveProperty('disclosure');
    expect(data).toHaveProperty('associatedSites');
    expect(data).toHaveProperty('landUses');
    expect(data).toHaveProperty('parcelDescriptions');
    expect(data).toHaveProperty('isSnapshot');
    expect(data).toHaveProperty('notationTypeData');
    expect(data).toHaveProperty('participantRoleData');
  });
});
