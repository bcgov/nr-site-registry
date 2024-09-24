import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getLandHistoriesForSiteQuery } from './graphql/LandUses';
import { print } from 'graphql';
import { RequestStatus } from '../../../helpers/requests/status';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';

const initialState = {
  fetchRequestStatus: RequestStatus.idle,
  landUses: [],
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
    searchTerm: string;
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

const landUsesSlice = createSlice({
  name: 'landUses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandUses.pending, (state) => {
        state.fetchRequestStatus = RequestStatus.loading;
      })
      .addCase(fetchLandUses.fulfilled, (state, action) => {
        state.fetchRequestStatus = RequestStatus.success;
        state.landUses = action.payload;
      })
      .addCase(fetchLandUses.rejected, (state, action) => {
        state.fetchRequestStatus = RequestStatus.failed;
      });
  },
});

export const landUses = (state: any) => state.landUses;

export default landUsesSlice.reducer;
