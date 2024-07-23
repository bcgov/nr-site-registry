import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from "graphql";
import { RequestStatus } from '../../../helpers/requests/status';
import { INotationState } from './INotationState';
import { graphQLSiteNotationBySiteId } from '../../site/graphql/Notation';

// Define the initial state
const initialState : INotationState = {
    siteNotation: [],
    status: RequestStatus.idle,
    error: '',
};

// Define the asynchronous thunk to fetch site participants from the backend
export const fetchNotationParticipants = createAsyncThunk(
  'notationParticipant/fetchNotationParticipants',
  async (siteId: string) => {
    try
    {
      const response = await getAxiosInstance().post( GRAPHQL, {
          query: print(graphQLSiteNotationBySiteId()),
          variables: {
              siteId:siteId
          }
      });
      return response.data.data.getSiteNotationBySiteId.data;
    }
    catch(error)
    {
      throw error
    }
  }
);

// Define the recent views slice
const notationParticipantSlice = createSlice({
  name: 'notationParticipant',
  initialState,
  reducers: {
    updateSiteNotation: (state, action) => {
      state.siteNotation = action.payload;
      state.status = RequestStatus.success;
    }
  },
  extraReducers: (builder) => {
      builder
        .addCase(fetchNotationParticipants.pending, (state) => {
          state.status = RequestStatus.loading;
        })
        .addCase(fetchNotationParticipants.fulfilled, (state, action) => {
          state.status = RequestStatus.success;
          state.siteNotation = action.payload;
        })
        .addCase(fetchNotationParticipants.rejected, (state, action) => {
          state.status = RequestStatus.failed;
          state.error = action.error.message;
        });
    },
});

export const notationParticipants = (state: any) => state.notationParticipant.siteNotation;

export const { updateSiteNotation } = notationParticipantSlice.actions;

export default notationParticipantSlice.reducer;