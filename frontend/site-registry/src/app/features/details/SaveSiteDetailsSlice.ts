import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../helpers/requests/status';

import { getAxiosInstance } from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';

import { print } from 'graphql';
import { updateSiteDetails } from './graphql/SaveSiteDetails';
import { SaveSiteDetails } from './dto/SiteDetailsMode';

const initialState: SaveSiteDetails = {
  saveRequestStatus: RequestStatus.idle,
  notationData: null,
  siteParticipantData: null,
  documentsData: null,
  landHistoriesData: null,
  subDivisionsData: null,
  profilesData: null,
  siteAssociationsData: null,
  siteId: ''
};

export const saveSiteDetails = createAsyncThunk(
  'saveSiteDetails',
  async (siteDetailsDTO: any) => {
    const request = await getAxiosInstance().post(GRAPHQL, {
      query: print(updateSiteDetails()),
      variables: {
        siteDetailsDTO: siteDetailsDTO,
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
        state.saveRequestStatus = RequestStatus.success;
      })
      .addCase(saveSiteDetails.rejected, (state, action) => {
        state.saveRequestStatus = RequestStatus.failed;
      });
  },
});

export const getSiteDetailsToBeSaved = (state: any) => {
  return {
    events: state.siteDetails.notationData,
    siteParticipants: state.siteDetails.siteParticipantData,
    documents: state.siteDetails.documentsData,
    siteAssociations: state.siteDetails.siteAssociations,
    subDivisions: state.siteDetails.subDivisions,
    landHistories: state.siteDetails.landHistories,
    profiles: state.siteDetails.profiles,
    siteId: state.siteDetails.siteId
  };
};

export const { 
  resetSaveSiteDetailsRequestStatus, 
  resetSaveSiteDetails, 
  setupNotationDataForSaving,
  setupSiteIdForSaving,
  setupDocumentsDataForSaving,
  setupLandHistoriesDataForSaving,
  setupSiteAssociationDataForSaving,
  setupSiteParticipantDataForSaving,
  setupSubDivisionsDataForSaving } =
  siteDetailsSlice.actions;

export default siteDetailsSlice.reducer;
