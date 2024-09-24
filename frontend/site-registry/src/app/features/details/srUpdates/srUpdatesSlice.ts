import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SRUpdatesState } from "./srUpdatesState";
import { getAxiosInstance } from "../../../helpers/utility";
import { GRAPHQL } from "../../../helpers/endpoints";
import { graphqlSiteDetailsQuery } from "../../site/graphql/Site";
import { print } from 'graphql';
import { updateSiteDetails } from "../graphql/SaveSiteDetails";
import { RequestStatus } from "../../../helpers/requests/status";
import { graphQLSiteNotationBySiteId } from "../../site/graphql/Notation";
import { graphQLSiteParticipantsBySiteId } from "../../site/graphql/Participant";
import { IParticipant } from "../participants/IParticipantState";
import { getLandHistoriesForSiteQuery } from "../landUses/graphql/LandUses";
import { graphQLSiteDocumentsBySiteId } from "../../site/graphql/Document";
import { graphQLSiteDisclosureBySiteId } from "../../site/graphql/Disclosure";
import { graphQLAssociatedSitesBySiteId } from "../../site/graphql/Associate";


const initialState: SRUpdatesState = {
    siteSummaryData: null,
    notation: null,
    updateRequestStatus: RequestStatus.idle,
    siteParticipants: null,
    landUsesData: null,
    documents: null,
    siteAssociations: null,
    disclosure: null
};


export const updateSiteDetailsForApproval = createAsyncThunk(
    'updateSiteDetailsForApproval',
    async (siteDetailsDTO: any, { getState }) => {
      const saveDTO = siteDetailsDTO;
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(updateSiteDetails()),
        variables: {
          siteDetailsDTO: saveDTO,
        },
      });
      return request.data;
    },
  );

  export const fetchPendingAssociatedSites = createAsyncThunk(
    'associatedSites/fetchAssociatedSites',
    async ({siteId,showPending}:{siteId: string, showPending: boolean}) => {
      try {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLAssociatedSitesBySiteId()),
          variables: {
            siteId: siteId,
            pending: showPending
          },
        });
        return response.data.data.getAssociatedSitesBySiteId.data;
      } catch (error) {
        throw error;
      }
    },
  );


  export const fetchPendingSiteDisclosure = createAsyncThunk(
    'siteDisclosure/fetchPendingSiteDisclosure',
    async ({siteId, showPending}:{siteId: string,showPending: boolean}) => {
      try {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLSiteDisclosureBySiteId()),
          variables: {
            siteId: siteId,
            pending: showPending
          },
        });
        const res = response.data.data.getSiteDisclosureBySiteId.data[0];
        if (res) {
          return res;
        }
        return [{}];
      } catch (error) {
        throw error;
      }
    },
  );


  export const fetchPendingDocumentsForApproval = createAsyncThunk(
    'documents/fetchPendingDocumentsForApproval',
    async ({siteId,showPending}:{siteId: string, showPending: boolean}) => {
      console.log('herer')
      try {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLSiteDocumentsBySiteId()),
          variables: {
            siteId: siteId,
            pending: showPending
          },
        });
        return response.data.data.getSiteDocumentsBySiteId.data;
      } catch (error) {
        throw error;
      }
    },
  );


  export const  fetchPendingSiteParticipantsForApproval = createAsyncThunk(
    'siteParticipants/fetchPendingSiteParticipantsForApproval',
    async (args: {siteId: string, showPending: Boolean}) => {
      try {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLSiteParticipantsBySiteId()),
          variables: {
            siteId: args.siteId,
            pending: args.showPending
          },
        });
        const participants: IParticipant[] =
          response.data.data.getSiteParticipantBySiteId.data;
        return participants;
      } catch (error) {
        throw error;
      }
    },
  );


export const fetchPendingSitesDetailsFprApproval = createAsyncThunk(
    'sites/fetchPendingSitesDetailsFprApproval',
    async (args: { siteId: string, showPending: Boolean }) => {
      try {       
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphqlSiteDetailsQuery()),
          variables: {
            siteId: args.siteId,
            pending: args.showPending
          },
        });
        return response.data.data.findSiteBySiteId.data;
      } catch (error) {
        throw error;
      }
    },
  );

  export const fetchPendingSiteNotationBySiteId = createAsyncThunk(
    'notationParticipant/fetchNotationParticipants',
    async ( args: {siteId: string, showPending: Boolean}) => {
      try {
        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLSiteNotationBySiteId()),
          variables: {
            siteId: args.siteId,
            pending: args.showPending
          },
        });
        return response.data.data.getSiteNotationBySiteId.data;
      } catch (error) {
        throw error;
      }
    },
  );

  
export const fetchPendingLandUses = createAsyncThunk(
  'landUses/fetchPendingLandUses',
  async ({
    siteId,
    searchTerm,
    sortDirection,
    showPending
  }: {
    siteId: string;
    searchTerm: string;
    sortDirection?: string;
    showPending: boolean
  }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(getLandHistoriesForSiteQuery),
        variables: { siteId, searchTerm, sortDirection, pending: showPending },
      });

      return response.data.data.getLandHistoriesForSite.data;
    } catch (error) {
      throw error;
    }
  },
);

const srUpdatesSlice = createSlice({
  name: 'srUpdates',
  initialState,
  reducers: {   
    resetAllData: (state, action) => {
        const newState = { ...state };
        newState.siteSummaryData = null;
        return newState;
    },
    resetRequestStatus : (state,action) => {
        const newState = { ...state };
        newState.updateRequestStatus = RequestStatus.idle;
        return newState;
    },    
  },
  extraReducers: (builder) => {   
    builder.addCase(fetchPendingSitesDetailsFprApproval.pending, (state, action) => {
        const newState = { ...state };
        console.log('Failed To Fetch Site Details - Pending')
        return newState;
      })
      .addCase(fetchPendingSitesDetailsFprApproval.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.siteSummaryData = action.payload;       
        console.log('sitesSummary Updated',action.payload)
        return newState;
      })
      .addCase(fetchPendingSitesDetailsFprApproval.rejected, (state, action) => {
        const newState = { ...state };
        console.log('Failed To Fetch Site Details - Rejected')
        return newState;
      })
      builder.addCase(fetchPendingSiteNotationBySiteId.pending, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingSiteNotationBySiteId - Pending')
        return newState;
      })
      .addCase(fetchPendingSiteNotationBySiteId.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.notation = action.payload;       
        return newState;
      })
      .addCase(fetchPendingSiteNotationBySiteId.rejected, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingSiteNotationBySiteId - Rejected')
        return newState;
      })
      builder.addCase(fetchPendingSiteParticipantsForApproval.pending, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingSiteParticipantsForApproval - Pending')
        return newState;
      })
      .addCase(fetchPendingSiteParticipantsForApproval.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.siteParticipants = action.payload;       
        return newState;
      })
      .addCase(fetchPendingSiteParticipantsForApproval.rejected, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingSiteParticipantsForApproval - Rejected')
        return newState;
      })
      builder.addCase(fetchPendingLandUses.pending, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingLandUses - Pending')
        return newState;
      })
      .addCase(fetchPendingLandUses.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.landUsesData = action.payload;       
        return newState;
      })
      .addCase(fetchPendingLandUses.rejected, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingLandUses - Rejected')
        return newState;
      })
      builder.addCase(fetchPendingDocumentsForApproval.pending, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingDocumentsForApproval - Pending')
        return newState;
      })
      .addCase(fetchPendingDocumentsForApproval.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.documents = action.payload;       
        return newState;
      })
      .addCase(fetchPendingDocumentsForApproval.rejected, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingDocumentsForApproval - Rejected')
        return newState;
      })
      builder.addCase(fetchPendingSiteDisclosure.pending, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingSiteDisclosure - Pending')
        return newState;
      })
      .addCase(fetchPendingSiteDisclosure.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.disclosure = action.payload;       
        return newState;
      })
      .addCase(fetchPendingSiteDisclosure.rejected, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingSiteDisclosure - Rejected')
        return newState;
      })
      builder.addCase(fetchPendingAssociatedSites.pending, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingAssociatedSites - Pending')
        return newState;
      })
      .addCase(fetchPendingAssociatedSites.fulfilled, (state, action) => {
        const newState = { ...state };
        console.log("data here",action.payload)
        newState.siteAssociations = action.payload;       
        return newState;
      })
      .addCase(fetchPendingAssociatedSites.rejected, (state, action) => {
        const newState = { ...state };
        console.log('fetchPendingAssociatedSites - Rejected')
        return newState;
      })
      .addCase(updateSiteDetailsForApproval.pending, (state, action) => {
        const newState = { ...state };
        newState.updateRequestStatus = RequestStatus.pending;
        return newState;
      })
      .addCase(updateSiteDetailsForApproval.fulfilled, (state, action) => {
        const newState = { ...state };
        newState.updateRequestStatus = RequestStatus.success;
        console.log('updateRequestStatus',newState.updateRequestStatus)
        return newState;
      })
      .addCase(updateSiteDetailsForApproval.rejected, (state, action) => {
        const newState = { ...state };
        newState.updateRequestStatus = RequestStatus.failed;
        return newState;
      })
  },
});

export const selectNotationData = (state: any) => state.srUpdates.notation;
export const selectSiteSummary = (state: any) => state.srUpdates.siteSummaryData;
export const selectSiteParticipants = (state: any) => state.srUpdates.siteParticipants;
export const selectLandUsesData = (state: any) => state.srUpdates.landUsesData;
export const selectDocuments = (state: any) => state.srUpdates.documents;
export const selectDisclosure = (state: any) => state.srUpdates.disclosure;
export const selectAssociatedSites = (state: any) => state.srUpdates.siteAssociations;
export const updateRequestStatus = (state: any) => state.srUpdates.updateRequestStatus;

export const {
    resetAllData,
    resetRequestStatus
} = srUpdatesSlice.actions;

export default srUpdatesSlice.reducer;
