import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getLandHistoriesForSiteQuery,
  getLandUseCodesQuery,
} from './graphql/LandUses';
import { print } from 'graphql';
import { RequestStatus } from '../../../helpers/requests/status';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';

const initialState = {
  landUsesFetchRequestStatus: RequestStatus.idle,
  landUses: [],
  landUseCodesFetchRequestStatus: RequestStatus.idle,
  landUseCodes: [],
};

export const fetchLandUses = createAsyncThunk(
  'landUses/fetchLandUses',
  async ({
    siteId,
    searchTerm,
    sortDirection,
    showPending
  }: {
    siteId: string;
    searchTerm?: string;
    sortDirection?: string;
    showPending: boolean
  }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(getLandHistoriesForSiteQuery),
        variables: { siteId, searchTerm, sortDirection, pending: showPending },
      });

      return response.data.data.getLandHistoriesForSite.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchLandUseCodes = createAsyncThunk(
  'landUses/fetchLandUseCodes',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(getLandUseCodesQuery),
      });

      return response.data.data.getLandUseCodes.data;
    } catch (error) {
      throw error;
    }
  },
);

const landUsesSlice = createSlice({
  name: 'landUses',
  initialState,
  reducers: {
    updateLandUses: (state, action) => {
      state.landUses = action.payload;
      state.landUsesFetchRequestStatus = RequestStatus.success;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandUses.pending, (state) => {
        state.landUsesFetchRequestStatus = RequestStatus.loading;
      })
      .addCase(fetchLandUses.fulfilled, (state, action) => {
        state.landUsesFetchRequestStatus = RequestStatus.success;
        state.landUses = action.payload;
      })
      .addCase(fetchLandUses.rejected, (state, action) => {
        state.landUsesFetchRequestStatus = RequestStatus.failed;
      })
      .addCase(fetchLandUseCodes.pending, (state) => {
        state.landUseCodesFetchRequestStatus = RequestStatus.loading;
      })
      .addCase(fetchLandUseCodes.fulfilled, (state, action) => {
        state.landUseCodesFetchRequestStatus = RequestStatus.success;
        state.landUseCodes = action.payload;
      })
      .addCase(fetchLandUseCodes.rejected, (state, action) => {
        state.landUseCodesFetchRequestStatus = RequestStatus.failed;
      });
  },
});

export const landUses = (state: any) => state.landUses;
export const selectLandUseCodes = (state: any) => state.landUses.landUseCodes;
export const { updateLandUses } = landUsesSlice.actions;

export default landUsesSlice.reducer;
