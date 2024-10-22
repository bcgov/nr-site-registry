import { IParticipant, IParticipantState } from './IParticipantState';
import { graphQLSiteParticipantsBySiteId } from '../../site/graphql/Participant';
import { RequestStatus } from '../../../helpers/requests/status';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';

// Define the initial state
const initialState: IParticipantState = {
  siteParticipants: [],
  status: RequestStatus.idle,
  error: '',
};

// Define the asynchronous thunk to fetch site participants from the backend
export const fetchSiteParticipants = createAsyncThunk(
  'siteParticipants/fetchSiteParticipants',
  async (args: { siteId: string; showPending: Boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteParticipantsBySiteId()),
        variables: {
          siteId: args.siteId,
          pending: args.showPending,
        },
      });
      const participants: IParticipant[] =
        response.data.data.getSiteParticipantBySiteId.data;
      return participants;
    } catch (error) {
      throw error;
    }
  },
);

// Define the recent views slice
const siteParticipantSlice = createSlice({
  name: 'siteParticipant',
  initialState,
  reducers: {
    updateSiteParticipants: (state, action) => {
      state.siteParticipants = action.payload;
      state.status = RequestStatus.success;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteParticipants.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchSiteParticipants.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.siteParticipants = action.payload;
      })
      .addCase(fetchSiteParticipants.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const siteParticipants = (state: {
  siteParticipant: IParticipantState;
}) => state.siteParticipant;
export const { updateSiteParticipants } = siteParticipantSlice.actions;

export default siteParticipantSlice.reducer;
