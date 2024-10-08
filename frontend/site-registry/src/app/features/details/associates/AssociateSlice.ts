import { print } from 'graphql';
import { GRAPHQL } from '../../../helpers/endpoints';
import { RequestStatus } from '../../../helpers/requests/status';
import { getAxiosInstance } from '../../../helpers/utility';
import { graphQLAssociatedSitesBySiteId } from '../../site/graphql/Associate';
import { IAssociateState } from './IAssociateState';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState: IAssociateState = {
  siteAssociate: [],
  status: RequestStatus.idle,
  error: '',
};

// Define the asynchronous thunk to fetch site associated from the backend
export const fetchAssociatedSites = createAsyncThunk(
  'associatedSites/fetchAssociatedSites',
  async ({siteId,showPending}:{siteId: string, showPending: boolean}) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLAssociatedSitesBySiteId()),
        variables: {
          siteId: siteId,
          pending: showPending
        },
      });
      return response.data.data.getAssociatedSitesBySiteId.data;
    } catch (error) {
      throw error;
    }
  },
);

// Define the recent views slice
const associatedSitesSlice = createSlice({
  name: 'associatedSites',
  initialState,
  reducers: {
    updateAssociatedSites: (state, action) => {
      state.siteAssociate = action.payload;
      state.status = RequestStatus.success;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssociatedSites.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchAssociatedSites.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.siteAssociate = action.payload;
      })
      .addCase(fetchAssociatedSites.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const associatedSites = (state: any) =>
  state.associatedSites.siteAssociate;
export const { updateAssociatedSites } = associatedSitesSlice.actions;

export default associatedSitesSlice.reducer;
