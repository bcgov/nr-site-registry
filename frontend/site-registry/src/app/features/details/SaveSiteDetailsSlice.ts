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
    resetSaveSiteDetailsRequestStatus: (state, action) => {
      const newState = {
        ...state,
      };

      newState.saveRequestStatus = RequestStatus.idle;
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
  };
};

export const { resetSaveSiteDetailsRequestStatus, setupNotationDataForSaving } =
  siteDetailsSlice.actions;

export default siteDetailsSlice.reducer;
