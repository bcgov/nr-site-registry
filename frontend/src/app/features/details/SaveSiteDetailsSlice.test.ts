import { UserActionEnum } from '../../common/userActionEnum';
import { RequestStatus } from '../../helpers/requests/status';
import reducer, { resetSaveSiteDetails } from './SaveSiteDetailsSlice';

describe('siteDetailsSlice', () => {
  describe('resetSaveSiteDetails', () => {

    describe('parcelDescriptions normalization on save', () => {
      it('deletes rows correctly', () => {
        const initialState: any = {
          parcelDescriptionsData: [],
        };

        const payload = [
          { id: 5, apiAction: UserActionEnum.deleted },
        ];

        const action = {
          type: 'siteDetails/setupParcelDescriptionsDataForSaving',
          payload,
        };

        const result = reducer(initialState, action);

        expect(result.parcelDescriptionsData[0].apiAction)
          .toBe(UserActionEnum.deleted);
      });

      it('updates existing rows', () => {
        const initialState: any = {
          parcelDescriptionsData: [],
        };

        const payload = [
          { id: 10 },
        ];

        const action = {
          type: 'siteDetails/setupParcelDescriptionsDataForSaving',
          payload,
        };

        const result = reducer(initialState, action);

        expect(result.parcelDescriptionsData[0].apiAction)
          .toBe(UserActionEnum.updated);
      });

      it('adds new rows', () => {
        const initialState: any = {
          parcelDescriptionsData: [],
        };

        const payload = [
          { id: -1 },
        ];

        const action = {
          type: 'siteDetails/setupParcelDescriptionsDataForSaving',
          payload,
        };

        const result = reducer(initialState, action);

        expect(result.parcelDescriptionsData[0].apiAction)
          .toBe(UserActionEnum.added);
      });
    });



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
        parentBucket: ['parentBucket'],
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
          parentBucket: null,
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
        parentBucket: ['parentBucket'],
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
        parentBucket: ['parentBucket'],
      };

      const result = reducer(initialState, resetSaveSiteDetails(null));
      expect(result.siteId).toEqual('123');
    });
  });
});



