import { print } from 'graphql';
import { GRAPHQL } from '../../../helpers/endpoints';
import { RequestStatus } from '../../../helpers/requests/status';
import { getAxiosInstance } from '../../../helpers/utility';
import { graphQLSiteDocumentsBySiteId } from '../../site/graphql/Document';
import { IDocumentsState } from './IDcoumentsState';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define the initial state
const initialState: IDocumentsState = {
  siteDocuments: [],
  status: RequestStatus.idle,
  error: '',
};

// Define the asynchronous thunk to fetch site documents from the backend
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (siteId: string) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteDocumentsBySiteId()),
        variables: {
          siteId: siteId,
        },
      });
      return response.data.data.getSiteDocumentsBySiteId.data;
    } catch (error) {
      throw error;
    }
  },
);

// Define the recent views slice
const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    updateSiteDocument: (state, action) => {
      state.siteDocuments = action.payload;
      state.status = RequestStatus.success;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.siteDocuments = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const documents = (state: any) => state.documents.siteDocuments;

export const { updateSiteDocument } = documentsSlice.actions;

export default documentsSlice.reducer;
