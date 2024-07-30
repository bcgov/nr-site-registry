import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../helpers/requests/status';
import { IParcelDescriptionDto } from './parcelDescriptionDto';

export interface IParcelDescriptionState {
  siteId: number;
  data: IParcelDescriptionDto[];
  requestStatus: RequestStatus;
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
  searchParam: string;
  sortBy: string;
  sortByDir: string;
  sortByInputValue: { [key: string]: any };
}

const defaultValues = {
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
};

const initialState: IParcelDescriptionState = {
  siteId: defaultValues.siteId,
  data: defaultValues.data,
  requestStatus: defaultValues.requestStatus,
  totalResults: defaultValues.totalResults,
  currentPage: defaultValues.currentPage,
  resultsPerPage: defaultValues.resultsPerPage,
  searchParam: defaultValues.searchParam,
  sortBy: defaultValues.sortBy,
  sortByDir: defaultValues.sortByDir,
  sortByInputValue: defaultValues.sortByInputValue,
};

export const parcelDescriptionsSlice = createSlice({
  name: 'parcelDescriptions',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setRequestStatus: (state, action) => {
      state.requestStatus = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setTotalResults: (state, action) => {
      state.totalResults = action.payload;
    },
    setResultsPerPage: (state, action) => {
      state.resultsPerPage = action.payload;
    },
    setSearchParam: (state, action) => {
      state.searchParam = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortByDir: (state, action) => {
      state.sortByDir = action.payload;
    },
    setSortByInputValue: (state, action) => {
      state.sortByInputValue = action.payload;
    },
    resetStateForNewSiteId: (state, action) => {
      state.siteId = action.payload;
      state.data = defaultValues.data;
      state.requestStatus = defaultValues.requestStatus;
      state.totalResults = defaultValues.totalResults;
      state.currentPage = defaultValues.currentPage;
      state.resultsPerPage = defaultValues.resultsPerPage;
      state.searchParam = defaultValues.searchParam;
      state.sortBy = defaultValues.sortBy;
      state.sortByDir = defaultValues.sortByDir;
      state.sortByInputValue = defaultValues.sortByInputValue;
    },
  },
});

export default parcelDescriptionsSlice.reducer;
export const {
  setData,
  setRequestStatus,
  setCurrentPage,
  setTotalResults,
  setResultsPerPage,
  setSearchParam,
  setSortBy,
  setSortByDir,
  setSortByInputValue,
  resetStateForNewSiteId,
} = parcelDescriptionsSlice.actions;
