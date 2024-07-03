import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAxiosInstance } from "../../../helpers/utility";
import { GRAPHQL } from "../../../helpers/endpoints";
import { print } from "graphql";
import { graphQLParticipantRoleCd, graphQLPeopleOrgs } from "../../site/graphql/Dropdowns";
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
  

export const fetchPeopleOrgs = createAsyncThunk(
    'dropdowns/getPeopleOrgs',
    async () => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(graphQLPeopleOrgs())
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
          .addCase(fetchPeopleOrgs.pending, (state) => {
            state.status = RequestStatus.loading;
          })
          .addCase(fetchPeopleOrgs.fulfilled, (state, action) => {
            state.status = RequestStatus.success;
            state.dropdowns.participantNames = action.payload;
          })
          .addCase(fetchPeopleOrgs.rejected, (state, action) => {
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

  

export const participantNameDrpdown = (state: any) => state.dropdown.dropdowns.participantNames.getPeopleOrgs;
export const participantRoleDrpdown = (state: any) => state.dropdown.dropdowns.participantRoles.getParticipantRoleCd;

export default dropdowns.reducer;