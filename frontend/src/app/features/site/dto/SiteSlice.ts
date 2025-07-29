import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAxiosInstance, getUser } from '../../../helpers/utility';
import { print } from 'graphql';
import {
  getSiteInsightsQL,
  graphqlSiteDetailsQuery,
  graphqlSiteDetailsQueryForLoggedIn,
  graphQlSiteQueryForAuthenticatedUsers,
} from '../graphql/Site';
import { SiteState } from './SiteState';
import { RequestStatus } from '../../../helpers/requests/status';
import { SiteResultDto } from './Site';
import { GRAPHQL } from '../../../helpers/endpoints';
import { SiteDetailsMode } from '../../details/dto/SiteDetailsMode';
import { UserType } from '../../../helpers/requests/userType';

const initialState: SiteState = {
  siteDetails: null,
  siteDetailsFetchStatus: RequestStatus.idle,
  siteDetailsDeleteStatus: RequestStatus.idle,
  siteDetailsAddedStatus: RequestStatus.idle,
  siteDetailsUpdateStatus: RequestStatus.idle,
  changeTracker: [],
  siteDetailsMode: SiteDetailsMode.ViewOnlyMode,
  resetSiteDetails: false,
  userType: UserType.External,
  siteInsights: null,
  siteInsightsFetchStatus: RequestStatus.idle,
};

export const fetchSitesDetails = createAsyncThunk(
  'sites/fetchSitesDetails',
  async (args: { siteId: string; showPending: Boolean }) => {
    try {
      const { siteId } = args;
      const user = getUser();
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(
          user
            ? graphqlSiteDetailsQueryForLoggedIn()
            : graphqlSiteDetailsQuery(),
        ),
        variables: {
          siteId: args.siteId,
          pending: args.showPending,
        },
      });
      return user
        ? response.data?.data?.findSiteBySiteIdLoggedInUser?.data
        : response.data?.data?.findSiteBySiteId?.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchSitesInsights = createAsyncThunk(
  'sites/fetchSitesInsights',
  async (args: { siteId: string }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(getSiteInsightsQL()),
        variables: {
          siteId: args.siteId,
        },
      });
      return response.data?.data?.getSiteInsights?.data;
    } catch (error) {
      throw error;
    }
  },
);

const siteSlice = createSlice({
  name: 'sites',
  initialState,

  reducers: {
    trackChanges: (state, action) => {
      let recordExists = state.changeTracker.filter((tracked) => {
        return (
          tracked.changeType === action.payload.changeType &&
          tracked.label === action.payload.label
        );
      });

      if (recordExists.length === 0) {
        const newState = {
          ...state,
          changeTracker: [...state.changeTracker, action.payload],
          resetSiteDetails: false,
        };
        return newState;
      } else {
        const newState = {
          ...state,
        };
        return newState;
      }
    },
    clearTrackChanges: (state, action) => {
      const newState = {
        ...state,
        changeTracker: [],
        resetSiteDetails: true,
      };

      return newState;
    },
    updateSiteDetailsMode: (state, action) => {
      const newState = {
        ...state,
        siteDetailsMode: action.payload,
      };
      return newState;
    },
    updateUserType: (state, action) => {
      const newState = {
        ...state,
      };
      newState.userType = action.payload;
      return newState;
    },
    updateSiteDetail: (state, action) => {
      const newState = {
        ...state,
      };
      newState.siteDetails = action.payload;
      return newState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSitesDetails.pending, (state, action) => {
        const newState = { ...state };
        newState.siteDetailsFetchStatus = RequestStatus.loading;
        return newState;
      })
      .addCase(fetchSitesDetails.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.siteDetails = action.payload;
        newState.siteDetailsFetchStatus = RequestStatus.success;
        return newState;
      })
      .addCase(fetchSitesDetails.rejected, (state, action) => {
        const newState = { ...state };
        newState.siteDetailsFetchStatus = RequestStatus.failed;
        return newState;
      })
      .addCase(fetchSitesInsights.pending, (state, action) => {
        const newState = { ...state };
        newState.siteInsightsFetchStatus = RequestStatus.loading;
        return newState;
      })
      .addCase(fetchSitesInsights.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.siteInsights = action.payload;
        newState.siteInsightsFetchStatus = RequestStatus.success;
        return newState;
      });
  },
});

export const resultsCount = (state: any) => state.sites.resultsCount;
export const siteDetailsLoadingState = (state: any) =>
  state.sites.fetchSitesDetails;
export const selectSiteDetails = (state: any) => state.sites.siteDetails;
export const trackedChanges = (state: any) => state.sites.changeTracker;
export const siteDetailsMode = (state: any) => state.sites.siteDetailsMode;
export const resetSiteDetails = (state: any) => state.sites.resetSiteDetails;
export const selectSiteInsights = (state: any) => state.sites.siteInsights;

export const {
  trackChanges,
  clearTrackChanges,
  updateSiteDetailsMode,
  updateUserType,
  updateSiteDetail,
} = siteSlice.actions;

export default siteSlice.reducer;
