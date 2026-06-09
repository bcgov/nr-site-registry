import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  IFetchParcelDescriptionsParams,
  IParcelDescriptionResponseDto,
  IParcelDescriptionsState,
} from './parcelDescriptionsInterfaces';
import { print } from 'graphql';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphQLParcelDescriptionBySiteId } from '../../site/graphql/ParcelDescriptions';

export const initialParcelDescriptionsState: IParcelDescriptionsState = {
  siteId: 0,
  data: [],
  requestStatus: RequestStatus.idle,
  totalResults: 0,
  currentPage: 1,
  resultsPerPage: 5,
  searchParam: '',
  sortBy: 'id',
  sortByDir: 'ASC',
  sortByInputValue: {},
  updatedRows: [],
  mergedRows: [],
  addedRows: [],
  deletedRows: [],
};

export const fetchParcelDescriptions = createAsyncThunk(
  'parcelDescriptions/fetchParcelDescriptions',
  async (params: IFetchParcelDescriptionsParams) => {
    const axios = getAxiosInstance();
    let response;
    try {
      response = await axios.post(GRAPHQL, {
        operationName: 'getParcelDescriptionBySiteId',
        query: print(graphQLParcelDescriptionBySiteId()),
        variables: {
          siteId: params.siteId,
          page: params.page,
          pageSize: params.pageSize,
          searchParam: params.searchParam,
          sortBy: params.sortBy,
          sortByDir: params.sortByDir,
          pending: params.showPending, // This is only used for SR approval in the site details component.
        },
      });
    } catch (error) {
      throw error;
    }
    return response;
  },
);

export const parcelDescriptionsSlice = createSlice({
  name: 'parcelDescriptions',
  initialState: initialParcelDescriptionsState,
  reducers: {
    updateCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    updateResultsPerPage: (state, action) => {
      state.resultsPerPage = action.payload;
    },
    updateSearchParam: (state, action) => {
      state.searchParam = action.payload;
    },
    updateSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    updateSortByDir: (state, action) => {
      state.sortByDir = action.payload;
    },
    updateSortByInputValue: (state, action) => {
      state.sortByInputValue = action.payload;
    },
    updateUpdatedRows: (state, action) => {
      state.updatedRows = action.payload;
    },
    updateMergedRows: (state, action) => {
      state.mergedRows = action.payload;
    },
    updateAddedRows: (state, action) => {
      state.addedRows = action.payload;
    },
    updateDeletedRows: (state, action) => {
      state.deletedRows = action.payload;
    },
    resetAllDataForSite: (state, action) => {
      state.siteId = action.payload;
      state.currentPage = initialParcelDescriptionsState.currentPage;
      state.data = initialParcelDescriptionsState.data;
      state.requestStatus = initialParcelDescriptionsState.requestStatus;
      state.resultsPerPage = initialParcelDescriptionsState.resultsPerPage;
      state.searchParam = initialParcelDescriptionsState.searchParam;
      state.sortBy = initialParcelDescriptionsState.sortBy;
      state.sortByDir = initialParcelDescriptionsState.sortByDir;
      state.sortByInputValue = initialParcelDescriptionsState.sortByInputValue;
      state.totalResults = initialParcelDescriptionsState.totalResults;
      state.updatedRows = initialParcelDescriptionsState.updatedRows;
      state.mergedRows = initialParcelDescriptionsState.mergedRows;
      state.addedRows = initialParcelDescriptionsState.addedRows;
      state.deletedRows = initialParcelDescriptionsState.deletedRows;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParcelDescriptions.pending, (state) => {
        state.requestStatus = RequestStatus.loading;
      })
      .addCase(fetchParcelDescriptions.fulfilled, (state, action) => {
        const responseData = action.payload.data?.data
          ?.getParcelDescriptionsBySiteId as IParcelDescriptionResponseDto;
        if (!responseData) {
          state.requestStatus = RequestStatus.failed;
        } else {
          state.currentPage = responseData.page;
          state.resultsPerPage = responseData.pageSize;
          state.totalResults = responseData.count;
          state.data = responseData.data;
          state.requestStatus = RequestStatus.success;
        }
      })
      .addCase(fetchParcelDescriptions.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
      });
  },
});

export const parcelDescriptions = (state: any): IParcelDescriptionsState =>
  state.parcelDescriptions;

export const {
  updateCurrentPage,
  updateResultsPerPage,
  updateSearchParam,
  updateSortBy,
  updateSortByDir,
  updateSortByInputValue,
  updateUpdatedRows,
  updateMergedRows,
  updateAddedRows,
  updateDeletedRows,
  resetAllDataForSite,
} = parcelDescriptionsSlice.actions;

export default parcelDescriptionsSlice.reducer;
