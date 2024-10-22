import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  IParcelDescriptionDto,
  IParcelDescriptionResponseDto,
} from './parcelDescriptionDto';
import { print } from 'graphql';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { format } from 'date-fns';
import { graphQLParcelDescriptionBySiteId } from '../../site/graphql/ParcelDescriptions';

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

export interface IFetchParcelDescriptionParams {
  siteId: number;
  page: number;
  pageSize: number;
  searchParam: string;
  sortBy: string;
  sortByDir: string;
  showPending: boolean;
}

const defaultValues = {
  siteId: 0,
  data: [],
  requestStatus: RequestStatus.loading,
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

export const fetchParcelDescriptions = createAsyncThunk(
  'parcelDescriptions/fetchParcelDescriptions',
  async (params: IFetchParcelDescriptionParams) => {
    const axios = getAxiosInstance();
    let response;
    try {
      response = await axios.post(GRAPHQL, {
        query: print(graphQLParcelDescriptionBySiteId()),
        variables: {
          siteId: params.siteId,
          page: params.page,
          pageSize: params.pageSize,
          searchParam: params.searchParam,
          sortBy: params.sortBy,
          sortByDir: params.sortByDir,
          pending: params.showPending,
        },
      });
    } catch (error) {
      throw error;
    }
    if (response?.status != 200) {
      return {} as IParcelDescriptionResponseDto;
    }
    let rawData = response.data?.data?.getParcelDescriptionsBySiteId;

    let formattedData: IParcelDescriptionDto[] = rawData?.data?.map(
      (parcelDescription: IParcelDescriptionDto) => {
        // This slices the Z (Zulu Time) designator off of the ISO8601 date string
        // preventing the browser from applying it's local timezone to the date
        // object when formatting. Since all of our date strings have a time of
        // 00:00:00, if a time zone with a negative value were applied it would
        // cause the resulting formatted date string to be one day lower than it
        // should be.
        let dateNoted = new Date(parcelDescription?.dateNoted.slice(0, -1));
        let formattedDateNoted = dateNoted
          ? format(new Date(dateNoted), 'PPP')
          : '';
        return {
          id: parcelDescription?.id,
          descriptionType: parcelDescription?.descriptionType,
          idPinNumber: parcelDescription?.idPinNumber,
          dateNoted: formattedDateNoted,
          landDescription: parcelDescription?.landDescription,
        };
      },
    );

    let formattedResponse: IParcelDescriptionResponseDto = {
      page: rawData.page,
      pageSize: rawData.pageSize,
      count: rawData.count,
      data: formattedData,
    };

    return formattedResponse;
  },
);

export const parcelDescriptionsSlice = createSlice({
  name: 'parcelDescriptions',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParcelDescriptions.pending, (state) => {
        state.requestStatus = RequestStatus.loading;
      })
      .addCase(fetchParcelDescriptions.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.success;
        state.data = action.payload.data;
        state.currentPage = action.payload.page;
        state.resultsPerPage = action.payload.pageSize;
        state.totalResults = action.payload.count;
      })
      .addCase(fetchParcelDescriptions.rejected, (state, action) => {
        state.requestStatus = RequestStatus.failed;
      });
  },
});

export default parcelDescriptionsSlice.reducer;
export const {
  setData,
  setCurrentPage,
  setTotalResults,
  setResultsPerPage,
  setSearchParam,
  setSortBy,
  setSortByDir,
  setSortByInputValue,
} = parcelDescriptionsSlice.actions;
