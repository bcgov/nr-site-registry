import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../helpers/requests/status';
import { ISiteSearchState } from './ISiteSearchState';
import { getAxiosInstance } from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';
import { print } from 'graphql';
import { graphQlSiteQuery } from './graphql/Site';

const initialState: ISiteSearchState = {
  sites: [],
  searchParam: '',
  page: 1,
  pageSize: 5,
  count: 0,
  filter: {},
  error: '',
  status: RequestStatus.idle,
};

export const fetchSearchSites = createAsyncThunk(
  'site/fetchSearchSites',
  async (args: {
    searchParam?: string;
    page?: number;
    pageSize?: number;
    filter?: {};
  }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQlSiteQuery()),
        variables: {
          searchParam: args.searchParam,
          page: args.page || initialState.page,
          pageSize: args.pageSize || initialState.pageSize,
          filters: args.filter || initialState.filter,
        },
      });

      return {
        sites: response.data.data.searchSites.sites,
        count: response.data.data.searchSites.count,
        page: response.data.data.searchSites.page,
        pageSize: response.data.data.searchSites.pageSize,
      };
    } catch (error) {
      throw error;
    }
  },
);

const siteSearchSlice = createSlice({
  name: 'siteSearch',
  initialState,
  reducers: {
    resetSiteSearch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchSites.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchSearchSites.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.sites = action.payload.sites;
        state.count = action.payload.count;
        state.searchParam = action.meta.arg.searchParam || state.searchParam;
        state.page = action.payload.page || state.page;
        state.pageSize = action.payload.pageSize || state.pageSize;
        state.filter = action.meta.arg.filter || state.filter;
      })
      .addCase(fetchSearchSites.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action?.error?.message || '';
      });
  },
});

export const getSites = (state: any) => state.siteSearch;
export const { resetSiteSearch } = siteSearchSlice.actions;
export default siteSearchSlice.reducer;
