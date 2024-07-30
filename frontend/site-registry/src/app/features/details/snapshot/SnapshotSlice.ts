import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RequestStatus } from "../../../helpers/requests/status";
import { ISnapshotState } from "./ISnapshotState";
import { getAxiosInstance } from "../../../helpers/utility";
import { GRAPHQL } from "../../../helpers/endpoints";
import { graphQLSnapshotByUserIdAndSiteId } from "../../site/graphql/Snapshot";
import { print } from "graphql";

// Define the initial state
const initialState : ISnapshotState = {
    snapshot: [],
    status: RequestStatus.idle,
    error: '',
};

// Define the asynchronous thunk to fetch site participants from the backend
export const fetchSnapshots = createAsyncThunk(
    'snapshots/fetchSnapshots',
    async (args: {siteId: string, userId: string}) => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(graphQLSnapshotByUserIdAndSiteId()),
            variables: {
                siteId: args.siteId,
                userId: args.userId,
            }
        });
      
        return response.data.data.getSnapshotsByUserIdAndSiteId;
      }
      catch(error)
      {
        throw error
      }
    }
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
          })
          .addCase(fetchSnapshots.fulfilled, (state, action) => {
            state.status = RequestStatus.success;
            state.snapshot = action.payload;
          })
          .addCase(fetchSnapshots.rejected, (state, action) => {
            state.status = RequestStatus.failed;
            state.error = action.error.message;
          });
      },
  });

export const snapshots = (state: any) => state.snapshots;

export default snapshotsSlice.reducer;
