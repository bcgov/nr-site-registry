import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../helpers/requests/status';

import { getAxiosInstance, safeParseFloat } from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';

import { print } from 'graphql';
import { updateSiteDetails } from './graphql/SaveSiteDetails';
import { SaveSiteDetails } from './dto/SiteDetailsMode';
import { UserActionEnum } from '../../common/userActionEnum';

const initialState: SaveSiteDetails = {
  saveRequestStatus: RequestStatus.idle,
  parentBucket: null,
  notationData: null,
  siteParticipantData: null,
  documentsData: null,
  landHistoriesData: null,
  parcelDescriptionsData: null,
  profilesData: null,
  siteAssociationsData: null,
  siteId: '',
  sitesSummary: null,
};

export const saveSiteDetails = createAsyncThunk(
  'saveSiteDetails',
  async (_, { getState }) => {
    const saveDTO = getSiteDetailsToBeSaved(getState());
    const request = await getAxiosInstance().post(GRAPHQL, {
      query: print(updateSiteDetails()),
      variables: {
        siteDetailsDTO: saveDTO,
      },
    });
    return request.data;
  },
);

function normalizeParcelDescription(dto: {
  id: any;
  apiAction: UserActionEnum;
}) {
  const isExisting = Number(dto.id) > 0;

  // Deleted rows
  if (dto.apiAction === UserActionEnum.deleted) {
    return { ...dto, apiAction: UserActionEnum.deleted };
  }

  // Existing DB rows
  if (isExisting) {
    return { ...dto, apiAction: UserActionEnum.updated };
  }

  // Newly added rows (negative IDs)
  return { ...dto, apiAction: UserActionEnum.added };
}

const siteDetailsSlice = createSlice({
  name: 'siteDetails',
  initialState,
  reducers: {
    resetSaveSiteDetails: (state, action) => {
      const newState = {
        ...state,
      };
      newState.saveRequestStatus = RequestStatus.idle;
      newState.notationData = null;
      newState.siteParticipantData = null;
      newState.documentsData = null;
      newState.landHistoriesData = null;
      newState.parcelDescriptionsData = null;
      newState.profilesData = null;
      newState.siteAssociationsData = null;
      newState.siteId = state.siteId;
      newState.sitesSummary = null;
      newState.parentBucket = null;
      return newState;
    },
    resetSaveSiteDetailsRequestStatus: (state, action) => {
      const newState = {
        ...state,
      };

      newState.saveRequestStatus = RequestStatus.idle;
      return newState;
    },
    setupSiteSummaryForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.sitesSummary = action.payload;
      return newState;
    },
    setupSiteIdForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.siteId = action.payload;
      return newState;
    },
    setupNotationDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.notationData = action.payload;
      return newState;
    },
    setupSiteParticipantDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.siteParticipantData = action.payload;
      return newState;
    },
    setupDocumentsDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.documentsData = action.payload;
      return newState;
    },
    setupLandHistoriesDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.landHistoriesData = action.payload;
      return newState;
    },
    setupParcelDescriptionsDataForSaving: (state, action) => {
      const newState = { ...state };

      // ⭐ Normalize all parcel description actions before saving
      const normalized = action.payload.map(
        (dto: { id: any; apiAction: UserActionEnum }) =>
          normalizeParcelDescription(dto),
      );

      newState.parcelDescriptionsData = normalized;
      return newState;
    },
    setupSiteAssociationDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.siteAssociationsData = action.payload;
      return newState;
    },
    setupSiteDisclosureDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.profilesData = action.payload;
      return newState;
    },
    updateParentBucket: (state, action) => {
      const newState = {
        ...state,
      };
      newState.parentBucket = action.payload;
      return newState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveSiteDetails.fulfilled, (state, action) => {
        if (action?.payload?.data?.updateSiteDetails?.httpStatusCode === 200)
          state.saveRequestStatus = RequestStatus.success;
        else state.saveRequestStatus = RequestStatus.failed;
      })
      .addCase(saveSiteDetails.rejected, (state, action) => {
        state.saveRequestStatus = RequestStatus.failed;
      });
  },
});

export const getSiteDetailsToBeSaved = (state: any) => {
  return {
    events: state.siteDetails?.notationData,
    siteParticipants: state.siteDetails?.siteParticipantData,
    documents: state.siteDetails?.documentsData,
    siteAssociations: state.siteDetails?.siteAssociationsData,
    parcelDescriptions: state.siteDetails.parcelDescriptionsData,
    landHistories: state.siteDetails.landHistoriesData,
    profiles: state.siteDetails?.profilesData,
    siteId: state.siteDetails?.siteId,
    sitesSummary: state?.siteDetails?.sitesSummary
      ? {
          ...state.siteDetails.sitesSummary,
          bcerCode2: undefined,
          latDegrees: safeParseFloat(
            state.siteDetails?.sitesSummary?.latDegrees,
          ),
          longDegrees: safeParseFloat(
            state.siteDetails?.sitesSummary?.longDegrees,
          ),
          latMinutes: safeParseFloat(
            state.siteDetails?.sitesSummary?.latMinutes,
          ),
          longMinutes: safeParseFloat(
            state.siteDetails?.sitesSummary?.longMinutes,
          ),
          latSeconds: safeParseFloat(
            state.siteDetails?.sitesSummary?.latSeconds,
          ),
          longSeconds: safeParseFloat(
            state.siteDetails?.sitesSummary?.longSeconds,
          ),
        }
      : null,
  };
};

export const saveRequestStatus = (state: any) =>
  state.siteDetails.saveRequestStatus;

export const getSiteNoatations = (state: any) => state.siteDetails.notationData;

export const currentSiteId = (state: any) => state.siteDetails.siteId;

export const getSiteSummaryEdits = (state: any) =>
  state.siteDetails.sitesSummary;

export const getSiteDocuments = (state: any) => state.siteDetails.documentsData;
export const getSiteDisclosure = (state: any) => state.siteDetails.profilesData;
export const getSiteParticipants = (state: any) =>
  state.siteDetails.siteParticipantData;
export const getSiteAssociated = (state: any) =>
  state.siteDetails.siteAssociationsData;
export const getParentBucket = (state: any) => state.siteDetails.parentBucket;

export const getSiteSummary = (state: any) => state.siteDetails.sitesSummary;

export const {
  resetSaveSiteDetailsRequestStatus,
  resetSaveSiteDetails,
  setupNotationDataForSaving,
  setupSiteIdForSaving,
  setupDocumentsDataForSaving,
  setupLandHistoriesDataForSaving,
  setupSiteAssociationDataForSaving,
  setupSiteParticipantDataForSaving,
  setupParcelDescriptionsDataForSaving,
  setupSiteSummaryForSaving,
  setupSiteDisclosureDataForSaving,
  updateParentBucket,
} = siteDetailsSlice.actions;

export default siteDetailsSlice.reducer;
