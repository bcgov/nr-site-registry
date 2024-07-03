import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAxiosInstance } from "../../../helpers/utility";
import { GRAPHQL } from "../../../helpers/endpoints";
import { print } from "graphql";
import { graphQLParticipantRoleCd, graphQLPeopleOrgsCd } from "../../site/graphql/Dropdowns";
import { RequestStatus } from "../../../helpers/requests/status";
import { IDropdownsState } from "./IDropdownState";


// Define the initial state
const initialState : IDropdownsState = {
    dropdowns: { 
        participantNames: [],
        participantRoles: [],
    },
    status: RequestStatus.idle,
    error: '',
  };
  

export const fetchPeopleOrgsCd = createAsyncThunk(
    'dropdowns/getPeopleOrgsCd',
    async () => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(graphQLPeopleOrgsCd())
        })
        return response.data.data;
      }
      catch(error)
      {
        throw error
      }
      
    }
  );


  export const fetchParticipantRoleCd = createAsyncThunk(
    'dropdowns/getParticipantRoleCd',
    async () => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(graphQLParticipantRoleCd())
        })
        return response.data.data;
      }
      catch(error)
      {
        throw error
      }
      
    }
  );


   // Define the recent views slice
const dropdowns = createSlice({
    name: 'dropdowns',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
          .addCase(fetchPeopleOrgsCd.pending, (state) => {
            state.status = RequestStatus.loading;
          })
          .addCase(fetchPeopleOrgsCd.fulfilled, (state, action) => {
            state.status = RequestStatus.success;
            state.dropdowns.participantNames = action.payload;
          })
          .addCase(fetchPeopleOrgsCd.rejected, (state, action) => {
            state.status = RequestStatus.failed;
            state.error = action.error.message;
          })
          .addCase(fetchParticipantRoleCd.pending, (state) => {
            state.status = RequestStatus.loading;
          })
          .addCase(fetchParticipantRoleCd.fulfilled, (state, action) => {
            state.status = RequestStatus.success;
            state.dropdowns.participantRoles = action.payload;
          })
          .addCase(fetchParticipantRoleCd.rejected, (state, action) => {
            state.status = RequestStatus.failed;
            state.error = action.error.message;
          });
      },
  });

  

export const participantNameDrpdown = (state: any) => state.dropdown.dropdowns.participantNames.getPeopleOrgsCd;
export const participantRoleDrpdown = (state: any) => state.dropdown.dropdowns.participantRoles.getParticipantRoleCd;

export default dropdowns.reducer;