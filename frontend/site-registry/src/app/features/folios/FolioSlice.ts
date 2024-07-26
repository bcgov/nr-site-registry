import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RequestStatus } from "../../helpers/requests/status";
import { Folio, FolioContentDTO, FolioMinDTO, FolioState } from "./dto/Folio"
import { getAxiosInstance } from "../../helpers/utility";
import { GRAPHQL } from "../../helpers/endpoints";
import { addFolioItemQL, addSiteToFolioQL, deleteFolioItemQL, deleteSitesInFolioQL, getFolioItemsForUserQL, getSitesForFolioQL, updateFolioItemQL } from "./graphql/Folio";
import { print } from "graphql";

const initialState: FolioState = {
  fetchRequestStatus: RequestStatus.idle,
  addRequestStatus : RequestStatus.idle,
  deleteRequestStatus: RequestStatus.idle,
  updateRequestStatus : RequestStatus.idle,
  folioItems: [],
  addSiteToFolioRequest : RequestStatus.idle,
  sitesArray: [],
  deleteSiteInFolioRequest : RequestStatus.idle
};


export const fetchFolioItems = createAsyncThunk(
    'Folio/fetchFolioItems',
    async (userId: string) => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(getFolioItemsForUserQL()),
            variables: {
                userId:userId
            }
        })     
        console.log("folion items response", response)
        return response.data.data.getFolioItemsForUser.data;
      }
      catch(error)
      {
        throw error
      }      
    }
  );

  export const getSiteForFolio = createAsyncThunk(
    'Folio/getSiteForFolio',
    async (inputDTO: FolioMinDTO) => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(getSitesForFolioQL()),
            variables: {
              folioDTO:inputDTO
            }
        })     
        console.log("folion items response", response)
        return response.data.data.getSitesForFolio.data;
      }
      catch(error)
      {
        throw error
      }      
    }
  );



  export const addFolioItem = createAsyncThunk(
    "addFolioItem",
    async (FolioInputDTO: Folio) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(addFolioItemQL()),
        variables: {
          FolioDTO: FolioInputDTO,
        },
      });
      return request.data;
    }
  );


  export const addSiteToFolio = createAsyncThunk(
    "addSiteToFolio",
    async (FolioInputDTO: FolioContentDTO[]) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(addSiteToFolioQL()),
        variables: {
          folioDTO: FolioInputDTO,
        },
      });
      return request.data;
    }
  );

  export const deleteSitesInFolio = createAsyncThunk(
    "deleteSitesInFolio",
    async (FolioInputDTO: FolioContentDTO[]) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(deleteSitesInFolioQL()),
        variables: {
          folioDTO: FolioInputDTO,
        },
      });
      return request.data;
    }
  );

  export const updateFolioItem = createAsyncThunk(
    "updateFolioItem",
    async (FolioInputDTO: Folio[]) => {
      console.log("FolioInputDTO",FolioInputDTO)
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(updateFolioItemQL()),
        variables: {
          FolioDTO: FolioInputDTO,
        },
      });
      return request.data;
    }
  );

  export const deleteFolioItem = createAsyncThunk(
    "deleteFolioItem",
    async (FolioId: string) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(deleteFolioItemQL()),
        variables: {
          folioId: parseInt(FolioId),
        },
      });
      return request.data;
    }
  );


const folioSlice = createSlice({
    name: 'folio',
    initialState,
    reducers: {
      resetFolioItemAddedStatus: (state, action) => {
        const newState = {
          ...state,
        };
  
        newState.addRequestStatus = RequestStatus.idle;
        return newState;
      },
      resetFolioItemDeleteStatus: (state, action) => {
        const newState = {
          ...state,
        };       
        newState.deleteRequestStatus = RequestStatus.pending;      
        return newState;
      },
      resetFolioSiteDeleteStatus: (state, action) => {
        const newState = {
          ...state,
        };       
        newState.deleteSiteInFolioRequest = RequestStatus.pending;      
        return newState;
      },
      resetFolioSiteUpdateStatus: (state, action) => {
        const newState = {
          ...state,
        };       
        newState.updateRequestStatus = RequestStatus.pending;      
        return newState;
      },
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchFolioItems.pending, (state) => {
            state.fetchRequestStatus = RequestStatus.loading;
          })
          .addCase(fetchFolioItems.fulfilled, (state, action) => {
            state.fetchRequestStatus = RequestStatus.success;        
            state.folioItems = action.payload;
          })
          .addCase(fetchFolioItems.rejected, (state, action) => {
            state.fetchRequestStatus = RequestStatus.failed;           
          })
          .addCase(addFolioItem.fulfilled, (state, action) => {
            state.addRequestStatus = RequestStatus.success;
          })
          .addCase(addFolioItem.rejected, (state, action) => {
            console.log("error", action);
            state.addRequestStatus = RequestStatus.failed;
          })
          .addCase(addSiteToFolio.fulfilled, (state, action) => {
            state.addSiteToFolioRequest = RequestStatus.success;
          })   
          .addCase(addSiteToFolio.rejected, (state, action) => {
            state.addSiteToFolioRequest = RequestStatus.failed;
          }) 
          .addCase(deleteSitesInFolio.fulfilled, (state, action) => {
            state.deleteSiteInFolioRequest = RequestStatus.success;
          })   
          .addCase(deleteSitesInFolio.rejected, (state, action) => {
            state.deleteSiteInFolioRequest = RequestStatus.failed;
          })       
          .addCase(updateFolioItem.fulfilled, (state, action) => {
            state.updateRequestStatus = RequestStatus.success;
          })
          .addCase(updateFolioItem.rejected, (state, action) => {
            console.log("error", action);
            state.updateRequestStatus = RequestStatus.failed;
          })
          .addCase(deleteFolioItem.fulfilled, (state, action) => {
            state.deleteRequestStatus = RequestStatus.success;
          })
          .addCase(getSiteForFolio.fulfilled, (state, action) => {
            console.log("action ", action)
            state.sitesArray = action.payload;
          })   
      },
  });


export const folioItems = (state: any) => state.folio.folioItems;
export const addFolioItemRequestStatus = (state: any) => state.folio.addRequestStatus;
export const deleteRequestStatus = (state: any) => state.folio.deleteRequestStatus;
export const deleteSiteInFolioStatus = (state: any) => state.folio.deleteSiteInFolioRequest;
export const updateRequestStatus =  (state: any) => state.folio.updateRequestStatus;
export const sitesInFolio = (state: any) => state.folio.sitesArray;

export const {

  resetFolioItemAddedStatus,
  resetFolioItemDeleteStatus,
  resetFolioSiteDeleteStatus,
  resetFolioSiteUpdateStatus
  
} = folioSlice.actions;

export default folioSlice.reducer;