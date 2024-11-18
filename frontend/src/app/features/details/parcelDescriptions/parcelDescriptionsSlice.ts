import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../helpers/requests/status';
import {
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
  needsUpdate: true,
};

export const fetchParcelDescriptions = createAsyncThunk(
  'parcelDescriptions/fetchParcelDescriptions',
  async (currentState: IParcelDescriptionsState) => {
    if (!currentState.needsUpdate) {
      return currentState;
    }
    const axios = getAxiosInstance();
    let response;
    try {
      response = await axios.post(GRAPHQL, {
        query: print(graphQLParcelDescriptionBySiteId()),
        variables: {
          siteId: currentState.siteId,
          page: currentState.currentPage,
          pageSize: currentState.resultsPerPage,
          searchParam: currentState.searchParam,
          sortBy: currentState.sortBy,
          sortByDir: currentState.sortByDir,
          pending: false, // This is only used for SR approval in the site details component.
        },
      });
    } catch (error) {
      throw error;
    }
    if (response?.status != 200) {
      return { ...currentState, requestStatus: RequestStatus.failed };
    }

    const responseData = response.data?.data
      ?.getParcelDescriptionsBySiteId as IParcelDescriptionResponseDto;

    if (!responseData) {
      return { ...currentState, requestStatus: RequestStatus.failed };
    }

    const newParcelDescriptionsState: IParcelDescriptionsState = {
      siteId: currentState.siteId,
      currentPage: responseData.page,
      resultsPerPage: responseData.pageSize,
      searchParam: currentState.searchParam,
      totalResults: responseData.count,
      data: responseData.data,
      sortBy: currentState.sortBy,
      sortByDir: currentState.sortByDir,
      sortByInputValue: currentState.sortByInputValue,
      requestStatus: RequestStatus.success,
      needsUpdate: false,
    };

    return newParcelDescriptionsState;
  },
);

export const parcelDescriptionsSlice = createSlice({
  name: 'parcelDescriptions',
  initialState: initialParcelDescriptionsState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParcelDescriptions.pending, (state) => {
        state.requestStatus = RequestStatus.loading;
      })
      .addCase(fetchParcelDescriptions.fulfilled, (state, action) => {
        state.siteId = action.payload.siteId;
        state.currentPage = action.payload.currentPage;
        state.resultsPerPage = action.payload.resultsPerPage;
        state.searchParam = action.payload.searchParam;
        state.totalResults = action.payload.totalResults;
        state.data = action.payload.data;
        state.sortBy = action.payload.sortBy;
        state.sortByDir = action.payload.sortByDir;
        state.sortByInputValue = action.payload.sortByInputValue;
        state.requestStatus = action.payload.requestStatus;
        state.needsUpdate = action.payload.needsUpdate;
      })
      .addCase(fetchParcelDescriptions.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
      });
  },
});

export default parcelDescriptionsSlice.reducer;
