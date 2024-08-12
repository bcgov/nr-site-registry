import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../helpers/requests/status';
import { ISnapshotState } from './ISnapshotState';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphQLSnapshotBySiteId } from '../../site/graphql/Snapshot';
import { print } from 'graphql';

// Define the initial state
const initialState: ISnapshotState = {
  snapshot: [],
  status: RequestStatus.idle,
  error: '',
  firstSnapshotCreatedDate: null,
};

// Define the asynchronous thunk to fetch site participants from the backend
export const fetchSnapshots = createAsyncThunk(
  'snapshots/fetchSnapshots',
  async (siteId: string) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSnapshotBySiteId()),
        variables: {
          siteId: siteId,
        },
      });

      return response.data.data.getSnapshotsBySiteId;
    } catch (error) {
      throw error;
    }
  },
);

// Define the recent views slice
const snapshotsSlice = createSlice({
  name: 'snapshots',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSnapshots.pending, (state) => {
        state.status = RequestStatus.loading;
        state.snapshot = [];
        state.error = '';
      })
      .addCase(fetchSnapshots.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.snapshot = action.payload;
        state.error = '';
        // Check if there's at least one snapshot and set its createdDate
        if (action.payload && action.payload.length > 0) {
          return (state.firstSnapshotCreatedDate =
            action.payload[0].createdDate);
        }
      })
      .addCase(fetchSnapshots.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const snapshots = (state: any) => state.snapshots;

export const getFirstSnapshotCreatedDate = (state: any) => {
  return state.snapshots.firstSnapshotCreatedDate;
};

export default snapshotsSlice.reducer;
