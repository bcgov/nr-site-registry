import { RequestStatus } from '../../helpers/requests/status';
import reducer, { resetSaveSiteDetails } from './SaveSiteDetailsSlice';

describe('siteDetailsSlice', () => {
  it('nullifies data', () => {
    const initialState = {
      saveRequestStatus: RequestStatus.loading,
      notationData: ['notationData'],
      siteParticipantData: ['siteParticipantData'],
      documentsData: ['documentsData'],
      landHistoriesData: ['landHistoriesData'],
      parcelDescriptionsData: ['parcelDescriptionsData'],
      profilesData: ['profilesData'],
      siteAssociationsData: ['siteAssociationsData'],
      siteId: '123',
      sitesSummary: ['sitesSummary'],
    };

    const result = reducer(initialState, resetSaveSiteDetails(null));
    expect(result).toEqual(
      expect.objectContaining({
        notationData: null,
        siteParticipantData: null,
        documentsData: null,
        landHistoriesData: null,
        parcelDescriptionsData: null,
        profilesData: null,
        siteAssociationsData: null,
        sitesSummary: null,
      }),
    );
  });

  it('sets saveRequestStatus to idle', () => {
    const initialState = {
      saveRequestStatus: RequestStatus.loading,
      notationData: ['notationData'],
      siteParticipantData: ['siteParticipantData'],
      documentsData: ['documentsData'],
      landHistoriesData: ['landHistoriesData'],
      parcelDescriptionsData: ['parcelDescriptionsData'],
      profilesData: ['profilesData'],
      siteAssociationsData: ['siteAssociationsData'],
      siteId: '123',
      sitesSummary: ['sitesSummary'],
    };

    const result = reducer(initialState, resetSaveSiteDetails(null));
    expect(result.saveRequestStatus).toEqual(RequestStatus.idle);
  });

  it('maintains siteId', () => {
    const initialState = {
      saveRequestStatus: RequestStatus.loading,
      notationData: ['notationData'],
      siteParticipantData: ['siteParticipantData'],
      documentsData: ['documentsData'],
      landHistoriesData: ['landHistoriesData'],
      parcelDescriptionsData: ['parcelDescriptionsData'],
      profilesData: ['profilesData'],
      siteAssociationsData: ['siteAssociationsData'],
      siteId: '123',
      sitesSummary: ['sitesSummary'],
    };

    const result = reducer(initialState, resetSaveSiteDetails(null));
    expect(result.siteId).toEqual('123');
  });
});
