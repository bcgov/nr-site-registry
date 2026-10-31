import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAxiosInstance } from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';
import { print } from 'graphql';
import { IDashboardState } from './IDashboardState';
import { RequestStatus } from '../../helpers/requests/status';
import { graphQLAddRecentView } from '../site/graphql/Dashboard';

// Define the initial state
const initialState: IDashboardState = {
  dashboard: {
    recentFolios: [],
    recentAssigned: [],
  },
  status: RequestStatus.idle,
  error: '',
};

export const addRecentView = createAsyncThunk(
  'recentViews/addRecentViews',
  async (payload: {
    userId: string;
    siteId: string;
    address: string;
    city: string;
    generalDescription: string;
    whenUpdated: Date;
  }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'addRecentView',
        query: print(graphQLAddRecentView()),
        variables: {
          recentViewDto: {
            userId: payload.userId,
            siteId: payload.siteId,
            address: payload.address,
            city: payload.city,
            generalDescription: payload.generalDescription,
            whenUpdated: payload.whenUpdated,
          },
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

// Define the recent views slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addRecentView.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(addRecentView.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
      })
      .addCase(addRecentView.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export default dashboardSlice.reducer;
