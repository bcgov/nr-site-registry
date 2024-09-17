import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus, ResponseCode } from '../../../helpers/requests/status';
import { CreateSnapshotInputDto, ISnapshotState } from './ISnapshotState';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import {
  createSnapshotForSitesQL,
  graphQLSnapshotBySiteId,
} from '../../site/graphql/Snapshot';
import { print } from 'graphql';

// Define the initial state
const initialState: ISnapshotState = {
  snapshot: [],
  status: RequestStatus.idle,
  error: '',
  firstSnapshotCreatedDate: null,
  createSnapshotRequest: RequestStatus.idle,
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

export const createSnapshotForSites = createAsyncThunk(
  'snapshots/createSnapshotForSites',
  async (inputDto: CreateSnapshotInputDto[]) => {
    const response = await getAxiosInstance().post(GRAPHQL, {
      query: print(createSnapshotForSitesQL()),
      variables: {
        inputDto: inputDto,
      },
    });
    return response.data;
  },
);

// Define the recent views slice
const snapshotsSlice = createSlice({
  name: 'snapshots',
  initialState,
  reducers: {
    resetCreateSnapshotForSitesStatus: (state, action) => {
      const newState = {
        ...state,
      };
      newState.createSnapshotRequest = RequestStatus.idle;
      return newState;
    },
  },
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
            action.payload[0].whenCreated);
        }
      })
      .addCase(fetchSnapshots.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(createSnapshotForSites.fulfilled, (state, action) => {
        if (!action.payload) state.createSnapshotRequest = RequestStatus.failed;
        else if (
          action.payload.data &&
          action.payload.data.createSnapshotForSites.httpStatusCode ===
            ResponseCode.created
        )
          state.createSnapshotRequest = RequestStatus.success;
        else state.createSnapshotRequest = RequestStatus.failed;
      })
      .addCase(createSnapshotForSites.rejected, (state, action) => {
        state.createSnapshotRequest = RequestStatus.failed;
      });
  },
});

export const snapshots = (state: any) => state.snapshots;

export const getFirstSnapshotCreatedDate = (state: any) => {
  return state.snapshots.firstSnapshotCreatedDate;
};

export const createSnapshotForSitesStatus = (state: any) =>
  state.snapshots.createSnapshotRequest;

export const { resetCreateSnapshotForSitesStatus } = snapshotsSlice.actions;

export default snapshotsSlice.reducer;
