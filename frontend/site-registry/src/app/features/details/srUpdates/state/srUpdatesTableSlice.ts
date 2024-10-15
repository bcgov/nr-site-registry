import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { print } from 'graphql';
import { BulkApproveRejectChangesDTO, SRReviewListState } from '../dto/srUpdateState';
import { RequestStatus } from '../../../../helpers/requests/status';
import { getAxiosInstance } from '../../../../helpers/utility';
import { bulkAproveRejectChangesQL, getPendingSiteForSRApprovalQL } from '../../../site/graphql/Site';
import { GRAPHQL } from '../../../../helpers/endpoints';

const initialState: SRReviewListState = {
  sites: [],
  error: '',
  fetchStatus: RequestStatus.idle,
  searchQuery: '',
  currentPage: 1,
  pageSize: 5,
  resultsCount: 0,
  updateStatus: RequestStatus.idle,
  searchParam : null
};

export const fetchPendingSiteForSRApproval = createAsyncThunk(
  'sites/getPendingSiteForSRApproval',
  async (args: {
    searchParam: any;
    page: number;
    pageSize: number;  
  }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(getPendingSiteForSRApprovalQL()),
        variables: {
          searchParam: args.searchParam,
          pageSize: args.pageSize.toString(),
          page: args.page.toString()        
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);


export const bulkAproveRejectChanges = createAsyncThunk(
    'sites/bulkAproveRejectChanges',
    async (approveRejectDTO: BulkApproveRejectChangesDTO) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(bulkAproveRejectChangesQL()),
        variables: {
            approveRejectDTO: approveRejectDTO,
        },
      });
      return request.data;
    },
  );
  

const srReviewSlice = createSlice({
  name: 'srReview',
  initialState,

  reducers: {
    setFetchLoadingState: (state, action) => {
      const newState = {
        ...state,
      };
      newState.fetchStatus = RequestStatus.loading;
      return newState;
    },
    resetSites: (state, action) => {
      const newState = {
        ...state,
      };
      newState.sites = [];
      newState.fetchStatus = RequestStatus.idle;
      return newState;
    },
    updateSearchQuery: (state, action) => {
      const newState = {
        ...state,
      };
      newState.searchQuery = action.payload;
      return newState;
    },
    updatePageSizeSetting: (state, action) => {
      const newState = {
        ...state,
      };
      newState.currentPage = action.payload.currentPage;
      newState.pageSize = action.payload.pageSize;
      return newState;
    },
    updateSearchParam: (state, payload) => {
      const newState = {
        ...state
      }
      newState.searchParam = payload;
      return newState;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPendingSiteForSRApproval.pending, (state, action) => {
        const newState = { ...state };
        newState.fetchStatus = RequestStatus.loading;
        return newState;
      })
      .addCase(fetchPendingSiteForSRApproval.fulfilled, (state, action) => {
        const newState = { ...state };
        if (
          action.payload &&
          action.payload.data &&
          action.payload.data.getPendingSiteForSRApproval &&
          action.payload.data.getPendingSiteForSRApproval.httpStatusCode === 200
        ) {
          newState.fetchStatus = RequestStatus.success;
          newState.sites = action.payload.data.getPendingSiteForSRApproval.data.data;
          newState.resultsCount = action.payload.data.getPendingSiteForSRApproval.data.totalRecords;
        } else {
          newState.fetchStatus = RequestStatus.failed;
          newState.sites = [];
          newState.resultsCount = 0;
        }

        return newState;
      })
      .addCase(fetchPendingSiteForSRApproval.rejected, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(bulkAproveRejectChanges.fulfilled,(state, action) => {
        const newState = { ...state };
        newState.updateStatus = RequestStatus.success;
        return newState;
      })
      .addCase(bulkAproveRejectChanges.pending,(state, action) => {
        const newState = { ...state };
        newState.updateStatus = RequestStatus.pending;
        return newState;
      })
      .addCase(bulkAproveRejectChanges.rejected,(state, action) => {
        const newState = { ...state };
        newState.updateStatus = RequestStatus.failed;
        return newState;
      })
  },
});

export const selectAllSites = (state: any) => state.srReview.sites;
export const loadingState = (state: any) => state.srReview.fetchStatus;
export const currentPageSelection = (state: any) => state.srReview.currentPage;
export const currentPageSize = (state: any) => state.srReview.pageSize;
export const getTotalRecords = (state: any) => state.srReview.resultsCount;
export const updateStatus = (state: any) => state.srReview.updateStatus;
export const getSearchParam = (state: any) => state.srReview.searchParam;

export const {
  resetSites,
  setFetchLoadingState,
  updatePageSizeSetting,
  updateSearchQuery,
  updateSearchParam
} = srReviewSlice.actions;

export default srReviewSlice.reducer;
