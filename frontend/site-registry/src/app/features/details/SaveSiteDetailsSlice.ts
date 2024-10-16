import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../helpers/requests/status';

import {
  deepFilterByUserAction,
  getAxiosInstance,
} from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';

import { print } from 'graphql';
import { updateSiteDetails } from './graphql/SaveSiteDetails';
import { SaveSiteDetails } from './dto/SiteDetailsMode';
import { UserActionEnum } from '../../common/userActionEnum';

const initialState: SaveSiteDetails = {
  saveRequestStatus: RequestStatus.idle,
  notationData: null,
  siteParticipantData: null,
  documentsData: null,
  landHistoriesData: null,
  subDivisionsData: null,
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
      newState.subDivisionsData = null;
      newState.profilesData = null;
      newState.siteAssociationsData = null;
      newState.siteId = '';
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
    setupSubDivisionsDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.subDivisionsData = action.payload;
      return newState;
    },
    setupSiteAssociationDataForSaving: (state, action) => {
      const newState = {
        ...state,
      };
      newState.siteAssociationsData = action.payload;
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
    events:
      state.siteDetails.notationData &&
      state.siteDetails.notationData.length > 0 &&
      deepFilterByUserAction(state.siteDetails.notationData, [
        UserActionEnum.added,
        UserActionEnum.updated,
        UserActionEnum.deleted,
      ]),
    siteParticipants:
      state.siteDetails.siteParticipantData &&
      state.siteDetails.siteParticipantData.length > 0 &&
      deepFilterByUserAction(state.siteDetails.siteParticipantData, [
        UserActionEnum.added,
        UserActionEnum.updated,
        UserActionEnum.deleted,
      ]),
    documents:
      state.siteDetails.documentsData &&
      state.siteDetails.documentsData.length > 0 &&
      deepFilterByUserAction(state.siteDetails.documentsData, [
        UserActionEnum.added,
        UserActionEnum.updated,
        UserActionEnum.deleted,
      ]),
    siteAssociations:
      state.siteDetails.siteAssociationsData &&
      state.siteDetails.siteAssociationsData.length > 0 &&
      deepFilterByUserAction(state.siteDetails.siteAssociationsData, [
        UserActionEnum.added,
        UserActionEnum.updated,
        UserActionEnum.deleted,
      ]),
    subDivisions: state.siteDetails.subDivisions,
    landHistories: state.siteDetails.landHistoriesData,
    profiles: state.siteDetails.profiles,
    siteId: state.siteDetails.siteId,
    sitesSummary: state.siteDetails.sitesSummary,
  };
};

export const saveRequestStatus = (state: any) =>
  state.siteDetails.saveRequestStatus;

export const getSiteNoatations = (state: any) => state.siteDetails.notationData;

export const currentSiteId = (state: any) => state.siteDetails.siteId;

export const getSiteDocuments = (state: any) => state.siteDetails.documentsData;
export const getSiteParticipants = (state: any) =>
  state.siteDetails.siteParticipantData;
export const getSiteAssociated = (state: any) =>
  state.siteDetails.siteAssociationsData;
export const {
  resetSaveSiteDetailsRequestStatus,
  resetSaveSiteDetails,
  setupNotationDataForSaving,
  setupSiteIdForSaving,
  setupDocumentsDataForSaving,
  setupLandHistoriesDataForSaving,
  setupSiteAssociationDataForSaving,
  setupSiteParticipantDataForSaving,
  setupSubDivisionsDataForSaving,
  setupSiteSummaryForSaving,
} = siteDetailsSlice.actions;

export default siteDetailsSlice.reducer;
