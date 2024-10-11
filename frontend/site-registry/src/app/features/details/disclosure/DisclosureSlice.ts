import { graphQLSiteParticipantsBySiteId } from '../../site/graphql/Participant';
import { RequestStatus } from '../../../helpers/requests/status';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import { IDisclosureState } from './IDisclosureState';
import { graphQLSiteDisclosureBySiteId } from '../../site/graphql/Disclosure';

// Define the initial state
const initialState: IDisclosureState = {
  siteDisclosure: {},
  status: RequestStatus.idle,
  error: '',
};

// Define the asynchronous thunk to fetch site participants from the backend
export const fetchSiteDisclosure = createAsyncThunk(
  'siteDisclosure/fetchSiteDisclosure',
  async ({ siteId, showPending }: { siteId: string; showPending: boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteDisclosureBySiteId()),
        variables: {
          siteId: siteId,
          pending: showPending,
        },
      });
      const res = response.data.data.getSiteDisclosureBySiteId.data[0];
      if (res) {
        return res;
      }
      return [{}];
    } catch (error) {
      throw error;
    }
  },
);

// Define the recent views slice
const siteDisclosureSlice = createSlice({
  name: 'siteDisclosure',
  initialState,
  reducers: {
    updateSiteDisclosure: (state, action) => {
      state.siteDisclosure = action.payload;
      state.status = RequestStatus.success;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteDisclosure.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchSiteDisclosure.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.siteDisclosure = action.payload;
      })
      .addCase(fetchSiteDisclosure.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const siteDisclosure = (state: any) => state.siteDisclosure;
export const { updateSiteDisclosure } = siteDisclosureSlice.actions;

export default siteDisclosureSlice.reducer;
