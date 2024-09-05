import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import {
  graphQLNotationClassCd,
  graphQLNotationParticipantRoleCd,
  graphQLNotationTypeCd,
  graphQLParticipantRoleCd,
  graphQLPeopleOrgsCd,
} from '../../site/graphql/Dropdowns';
import { RequestStatus } from '../../../helpers/requests/status';
import { IDropdownsState } from './IDropdownState';

// Define the initial state
const initialState: IDropdownsState = {
  dropdowns: {
    participantNames: [],
    participantRoles: [],
    notationClass: [],
    notationType: [],
    notationParticipantRole: [],
  },
  status: RequestStatus.idle,
  error: '',
};

export const fetchPeopleOrgsCd = createAsyncThunk(
  'dropdowns/getPeopleOrgsCd',
  async (args?: { searchParam?: string; entityType?: string }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLPeopleOrgsCd()),
        variables: {
          searchParam: args?.searchParam ?? '',
          entityType: args?.entityType ?? '',
        },
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchParticipantRoleCd = createAsyncThunk(
  'dropdowns/getParticipantRoleCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLParticipantRoleCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchNotationParticipantRoleCd = createAsyncThunk(
  'dropdowns/getNotationParticipantRoleCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLNotationParticipantRoleCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchNotationClassCd = createAsyncThunk(
  'dropdowns/getNotationClassCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLNotationClassCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchNotationTypeCd = createAsyncThunk(
  'dropdowns/getNotationTypeCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        query: print(graphQLNotationTypeCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
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
      })
      .addCase(fetchNotationParticipantRoleCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchNotationParticipantRoleCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.notationParticipantRole = action.payload;
      })
      .addCase(fetchNotationParticipantRoleCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(fetchNotationClassCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchNotationClassCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.notationClass = action.payload;
      })
      .addCase(fetchNotationClassCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(fetchNotationTypeCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchNotationTypeCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.notationType = action.payload;
      })
      .addCase(fetchNotationTypeCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const participantNameDrpdown = (state: any) =>
  state.dropdown.dropdowns.participantNames.getPeopleOrgsCd;
export const participantRoleDrpdown = (state: any) =>
  state.dropdown.dropdowns.participantRoles.getParticipantRoleCd;
export const notationParticipantRoleDrpdown = (state: any) =>
  state.dropdown.dropdowns.notationParticipantRole.getNotationParticipantRoleCd;
export const notationClassDrpdown = (state: any) =>
  state.dropdown.dropdowns.notationClass.getNotationClassCd;
export const notationTypeDrpdown = (state: any) =>
  state.dropdown.dropdowns.notationType.getNotationTypeCd;
export const updatedNotationType = (state: any) =>
  state.dropdown.dropdowns.trackNotationType;
export const updateNotationClass = (state: any) =>
  state.dropdown.dropdowns.trackNotationClass;

export default dropdowns.reducer;
