import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../helpers/requests/status';
import { ISiteSearchState } from './ISiteSearchState';
import { getAxiosInstance } from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';
import { print } from 'graphql';
import { graphQlSiteQuery } from './graphql/Site';
import { SiteSortBy, SortByDirection } from '../../../graphql/generated';

const initialState: ISiteSearchState = {
  sites: [],
  searchParam: '',
  page: 1,
  pageSize: 5,
  count: 0,
  sortBy: SiteSortBy.Id,
  sortByDir: SortByDirection.Asc,
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
    sortBy?: SiteSortBy;
    sortByDir?: SortByDirection;
    filter?: {};
  }) => {
    try {
      if (!args.searchParam || args.searchParam.trim() === '') {
        return initialState;
      }

      if (args.pageSize && args.pageSize > 100) {
        args.pageSize = 100; // enforce max page size of 100
      }

      if (args.page && args.page < 1) {
        args.page = 1; // enforce min page number of 1
      }

      if (args.filter) {
        const latitudeKeys = [
          'latdeg',
          'latDegrees',
          'latMinutes',
          'latSeconds',
        ];
        const longitudeKeys = [
          'longdeg',
          'longDegrees',
          'longMinutes',
          'longSeconds',
        ];
        const numericKeys = new Set([...latitudeKeys, ...longitudeKeys]);

        // Clone the filter before modifying
        const cleanedFilter: Record<string, any> = {};

        for (const [key, value] of Object.entries(args.filter)) {
          if (
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
          ) {
            continue; // skip empty
          }

          cleanedFilter[key] = numericKeys.has(key) ? Number(value) : value;
        }

        // Assign cleaned, mutable version
        args.filter = cleanedFilter;
      }

      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQlSiteQuery()),
        variables: {
          searchParam: args.searchParam,
          page: args.page || initialState.page,
          pageSize: args.pageSize || initialState.pageSize,
          sortBy: args.sortBy || initialState.sortBy,
          sortByDir: args.sortByDir || initialState.sortByDir,
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
        state.sortBy = action.meta.arg.sortBy || state.sortBy;
        state.sortByDir = action.meta.arg.sortByDir || state.sortByDir;
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
