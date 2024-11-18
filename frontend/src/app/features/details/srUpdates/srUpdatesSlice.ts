import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { SRUpdatesState } from './srUpdatesState';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphqlSiteDetailsQuery } from '../../site/graphql/Site';
import { print } from 'graphql';
import { updateSiteDetails } from '../graphql/SaveSiteDetails';
import { RequestStatus } from '../../../helpers/requests/status';
import { graphQLSiteNotationBySiteId } from '../../site/graphql/Notation';
import { graphQLSiteParticipantsBySiteId } from '../../site/graphql/Participant';
import { IParticipant } from '../participants/IParticipantState';
import { getLandHistoriesForSiteQuery } from '../landUses/graphql/LandUses';
import { graphQLSiteDocumentsBySiteId } from '../../site/graphql/Document';
import { graphQLSiteDisclosureBySiteId } from '../../site/graphql/Disclosure';
import { graphQLAssociatedSitesBySiteId } from '../../site/graphql/Associate';
import { IFetchParcelDescriptionParams } from '../parcelDescriptions/parcelDescriptionsInterfaces';
import { graphQLParcelDescriptionBySiteId } from '../../site/graphql/ParcelDescriptions';
import {
  IParcelDescriptionDto,
  IParcelDescriptionResponseDto,
} from '../parcelDescriptions/parcelDescriptionsInterfaces';
import { format } from 'date-fns';

const initialState: SRUpdatesState = {
  siteSummaryData: null,
  notation: null,
  updateRequestStatus: RequestStatus.idle,
  siteParticipants: null,
  landUsesData: null,
  documents: null,
  siteAssociations: null,
  disclosure: null,
  parcelDescriptionData: null,
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

export const fetchParcelDescriptionsForApproval = createAsyncThunk(
  'parcelDescriptions/fetchParcelDescriptionsForApproval',
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

export const fetchPendingAssociatedSites = createAsyncThunk(
  'associatedSites/fetchAssociatedSitesForSRApproval',
  async ({ siteId, showPending }: { siteId: string; showPending: boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLAssociatedSitesBySiteId()),
        variables: {
          siteId: siteId,
          pending: showPending,
        },
      });
      return response.data.data.getAssociatedSitesBySiteId;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchPendingSiteDisclosure = createAsyncThunk(
  'siteDisclosure/fetchPendingSiteDisclosure',
  async ({ siteId, showPending }: { siteId: string; showPending: boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteDisclosureBySiteId()),
        variables: {
          siteId: siteId,
          pending: showPending,
        },
      });
      const res = response.data.data.getSiteDisclosureBySiteId;
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
  async ({ siteId, showPending }: { siteId: string; showPending: boolean }) => {
    console.log('herer');
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteDocumentsBySiteId()),
        variables: {
          siteId: siteId,
          pending: showPending,
        },
      });
      return response.data.data.getSiteDocumentsBySiteId;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchPendingSiteParticipantsForApproval = createAsyncThunk(
  'siteParticipants/fetchPendingSiteParticipantsForApproval',
  async (args: { siteId: string; showPending: Boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteParticipantsBySiteId()),
        variables: {
          siteId: args.siteId,
          pending: args.showPending,
        },
      });
      const participants = response.data.data.getSiteParticipantBySiteId;
      return participants;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchPendingSitesDetailsFprApproval = createAsyncThunk(
  'sites/fetchPendingSitesDetailsFprApproval',
  async (args: { siteId: string; showPending: Boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphqlSiteDetailsQuery()),
        variables: {
          siteId: args.siteId,
          pending: args.showPending,
        },
      });
      return response.data.data.findSiteBySiteId;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchPendingSiteNotationBySiteId = createAsyncThunk(
  'notationParticipant/fetchPendingSiteNotationBySiteId',
  async (args: { siteId: string; showPending: Boolean }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLSiteNotationBySiteId()),
        variables: {
          siteId: args.siteId,
          pending: args.showPending,
        },
      });
      return response.data.data.getSiteNotationBySiteId;
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
    showPending,
  }: {
    siteId: string;
    searchTerm: string;
    sortDirection?: string;
    showPending: boolean;
  }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(getLandHistoriesForSiteQuery),
        variables: { siteId, searchTerm, sortDirection, pending: showPending },
      });

      return response.data.data.getLandHistoriesForSite;
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
    resetRequestStatus: (state, action) => {
      const newState = { ...state };
      newState.updateRequestStatus = RequestStatus.idle;
      return newState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingSitesDetailsFprApproval.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(
        fetchPendingSitesDetailsFprApproval.fulfilled,
        (state, action) => {
          const newState = { ...state };
          if (action.payload.httpStatusCode === 200) {
            newState.siteSummaryData = action.payload.data;
          } else {
            newState.siteSummaryData = null;
          }

          return newState;
        },
      )
      .addCase(
        fetchPendingSitesDetailsFprApproval.rejected,
        (state, action) => {
          const newState = { ...state };
          return newState;
        },
      );
    builder
      .addCase(fetchPendingSiteNotationBySiteId.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(fetchPendingSiteNotationBySiteId.fulfilled, (state, action) => {
        const newState = { ...state };
        if (action.payload.httpStatusCode === 200)
          newState.notation = action.payload.data;
        else newState.notation = [];
        return newState;
      })
      .addCase(fetchPendingSiteNotationBySiteId.rejected, (state, action) => {
        const newState = { ...state };
        return newState;
      });
    builder
      .addCase(
        fetchPendingSiteParticipantsForApproval.pending,
        (state, action) => {
          const newState = { ...state };
          return newState;
        },
      )
      .addCase(
        fetchPendingSiteParticipantsForApproval.fulfilled,
        (state, action) => {
          const newState = { ...state };
          if (action.payload.httpStatusCode === 200)
            newState.siteParticipants = action.payload.data;
          else newState.siteParticipants = [];
          return newState;
        },
      )
      .addCase(
        fetchPendingSiteParticipantsForApproval.rejected,
        (state, action) => {
          const newState = { ...state };
          return newState;
        },
      );
    builder
      .addCase(fetchPendingLandUses.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(fetchPendingLandUses.fulfilled, (state, action) => {
        const newState = { ...state };
        if (action.payload.httpStatusCode === 200)
          newState.landUsesData = action.payload;
        else newState.landUsesData = [];
        return newState;
      })
      .addCase(fetchPendingLandUses.rejected, (state, action) => {
        const newState = { ...state };
        return newState;
      });
    builder
      .addCase(fetchPendingDocumentsForApproval.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(fetchPendingDocumentsForApproval.fulfilled, (state, action) => {
        const newState = { ...state };
        if (action.payload.httpStatusCode === 200)
          newState.documents = action.payload.data;
        else newState.documents = [];
        return newState;
      })
      .addCase(fetchPendingDocumentsForApproval.rejected, (state, action) => {
        const newState = { ...state };
        return newState;
      });
    builder
      .addCase(fetchPendingSiteDisclosure.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(fetchPendingSiteDisclosure.fulfilled, (state, action) => {
        const newState = { ...state };
        if (action.payload.httpStatusCode === 200)
          newState.disclosure = action.payload.data[0];
        else newState.disclosure = null;
        return newState;
      })
      .addCase(fetchPendingSiteDisclosure.rejected, (state, action) => {
        const newState = { ...state };
        return newState;
      });
    builder
      .addCase(fetchParcelDescriptionsForApproval.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(
        fetchParcelDescriptionsForApproval.fulfilled,
        (state, action) => {
          const newState = { ...state };
          newState.parcelDescriptionData = action.payload;
          return newState;
        },
      )
      .addCase(fetchParcelDescriptionsForApproval.rejected, (state, action) => {
        const newState = { ...state };
        return newState;
      });
    builder
      .addCase(fetchPendingAssociatedSites.pending, (state, action) => {
        const newState = { ...state };
        return newState;
      })
      .addCase(fetchPendingAssociatedSites.fulfilled, (state, action) => {
        const newState = { ...state };
        if (action.payload.httpStatusCode === 200)
          newState.siteAssociations = action.payload.data;
        else newState.siteAssociations = [];
        return newState;
      })
      .addCase(fetchPendingAssociatedSites.rejected, (state, action) => {
        const newState = { ...state };
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
        return newState;
      })
      .addCase(updateSiteDetailsForApproval.rejected, (state, action) => {
        const newState = { ...state };
        newState.updateRequestStatus = RequestStatus.failed;
        return newState;
      });
  },
});

export const selectNotationData = (state: any) => state.srUpdates.notation;
export const selectSiteSummary = (state: any) =>
  state.srUpdates.siteSummaryData;
export const selectSiteParticipants = (state: any) =>
  state.srUpdates.siteParticipants;
export const selectLandUsesData = (state: any) => state.srUpdates.landUsesData;
export const selectDocuments = (state: any) => state.srUpdates.documents;
export const selectDisclosure = (state: any) => state.srUpdates.disclosure;
export const selectAssociatedSites = (state: any) =>
  state.srUpdates.siteAssociations;
export const selectParcelDescriptionData = (state: any) =>
  state.srUpdates.parcelDescriptionData;
export const updateRequestStatus = (state: any) =>
  state.srUpdates.updateRequestStatus;

export const hasNoPendingUpdates = (state: any) => {
  return (
    !state.srUpdates.disclosure &&
    (!state.srUpdates.parcelDescriptionData ||
      state.srUpdates.parcelDescriptionData?.data?.length === 0) &&
    (!state.srUpdates.landUsesData ||
      state.srUpdates.landUsesData.length === 0) &&
    (!state.srUpdates.siteAssociations ||
      state.srUpdates.siteAssociations.length === 0) &&
    (!state.srUpdates.documents || state.srUpdates.documents.length === 0) &&
    (!state.srUpdates.siteParticipants ||
      state.srUpdates.siteParticipants.length === 0) &&
    (!state.srUpdates.notation || state.srUpdates.notation.length === 0) &&
    !state.srUpdates.siteSummaryData
  );
};

export const { resetAllData, resetRequestStatus } = srUpdatesSlice.actions;

export default srUpdatesSlice.reducer;
