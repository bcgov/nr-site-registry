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
      const newState = {
        ...state,
      };
      newState.parcelDescriptionsData = action.payload;
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
  const rawAddrType = state?.siteDetails?.sitesSummary?.addrType;
  const normalizedAddrType =
    typeof rawAddrType === 'string'
      ? rawAddrType.trim().toUpperCase()
      : rawAddrType;

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
          addrType: normalizedAddrType,
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
