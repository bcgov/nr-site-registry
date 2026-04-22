import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../helpers/requests/status';
import { getAxiosInstance } from '../../helpers/utility';
import { GRAPHQL } from '../../helpers/endpoints';
import { getPurchasedSitesQL } from '../site/graphql/Snapshot';
import { print } from 'graphql';

export interface PurchasedSite {
  siteId: string;
  address: string;
  city: string;
  purchaseDate: string;
  status: string;
}

interface PurchasesState {
  fetchStatus: RequestStatus;
  purchasedSites: PurchasedSite[];
  totalRecords: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortByDir: string;
}

const initialState: PurchasesState = {
  fetchStatus: RequestStatus.idle,
  purchasedSites: [],
  totalRecords: 0,
  page: 1,
  pageSize: 10,
  sortBy: 'purchaseDate',
  sortByDir: 'DESC',
};

export const fetchPurchasedSites = createAsyncThunk(
  'purchases/fetchPurchasedSites',
  async (args: {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortByDir?: string;
  }) => {
    const response = await getAxiosInstance().post(GRAPHQL, {
      query: print(getPurchasedSitesQL()),
      variables: {
        page: args.page,
        pageSize: args.pageSize,
        sortBy: args.sortBy ?? 'purchaseDate',
        sortByDir: args.sortByDir ?? 'DESC',
      },
    });
    return response.data;
  },
);

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchasedSites.pending, (state) => {
        state.fetchStatus = RequestStatus.loading;
      })
      .addCase(fetchPurchasedSites.fulfilled, (state, action) => {
        const response = action?.payload?.data?.getPurchasedSites;
        const args = action.meta.arg;
        if (args.sortBy !== undefined) state.sortBy = args.sortBy;
        if (args.sortByDir !== undefined) state.sortByDir = args.sortByDir;
        state.page = args.page;
        state.pageSize = args.pageSize;

        if (
          response?.httpStatusCode === 200 ||
          response?.httpStatusCode === 404
        ) {
          state.fetchStatus = RequestStatus.success;
          state.purchasedSites = response?.data ?? [];
          state.totalRecords = response?.totalRecords ?? 0;
        } else {
          state.fetchStatus = RequestStatus.failed;
        }
      })
      .addCase(fetchPurchasedSites.rejected, (state) => {
        state.fetchStatus = RequestStatus.failed;
      });
  },
});

export const selectPurchasedSites = (state: any) =>
  state.purchases.purchasedSites;
export const selectPurchasesTotalRecords = (state: any) =>
  state.purchases.totalRecords;
export const selectPurchasesFetchStatus = (state: any) =>
  state.purchases.fetchStatus;
export const selectPurchasesPage = (state: any) => state.purchases.page;
export const selectPurchasesPageSize = (state: any) => state.purchases.pageSize;
export const selectPurchasesSortBy = (state: any) => state.purchases.sortBy;
export const selectPurchasesSortByDir = (state: any) =>
  state.purchases.sortByDir;

export default purchasesSlice.reducer;
