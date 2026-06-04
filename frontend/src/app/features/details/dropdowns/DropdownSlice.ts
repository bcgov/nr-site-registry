import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAxiosInstance } from '../../../helpers/utility';
import { GRAPHQL } from '../../../helpers/endpoints';
import { print } from 'graphql';
import {
  getIDIRUserListForDropDownQL,
  graphQLBCeRegionCd,
  graphQLNotationClassCd,
  graphQLNotationParticipantRoleCd,
  graphQLNotationTypeCd,
  graphQLParticipantRoleCd,
  graphQLPeopleOrgsCd,
  graphQLSchedule2Ref,
  graphQLSiteRiskCd,
  graphQLSiteStatusCd,
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
    ministryContact: [],
    internalUserList: [],
    siteRiskCode: [],
    bceRegionCode: [],
    siteStatusCode: [],
    schedule2Ref: [],
  },
  status: RequestStatus.idle,
  error: '',
};

export const fetchPeopleOrgsCd = createAsyncThunk(
  'dropdowns/getPeopleOrgsCd',
  async (args?: { searchParam?: string; entityType?: string }) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getPeopleOrgsCd',
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
        operationName: 'getParticipantRoleCd',
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
        operationName: 'getNotationParticipantRoleCd',
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
        operationName: 'getNotationClassCd',
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
        operationName: 'getNotationTypeCd',
        query: print(graphQLNotationTypeCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchMinistryContact = createAsyncThunk(
  'dropdowns/getMinistryContact',
  async (entityType: string) => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getPeopleOrgsCd',
        query: print(graphQLPeopleOrgsCd()),
        variables: {
          entityType: entityType,
        },
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchInternalUserNameForDropdown = createAsyncThunk(
  'dropdowns/fetchInterUserNameForDropdown',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getIDIRUserListForDropDown',
        query: print(getIDIRUserListForDropDownQL()),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchSiteRiskCd = createAsyncThunk(
  'dropdowns/getSiteRiskCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getSiteRiskCd',
        query: print(graphQLSiteRiskCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchBceRegionCd = createAsyncThunk(
  'dropdowns/getBceRegionCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getBCeRegionCd',
        query: print(graphQLBCeRegionCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchSiteStatusCd = createAsyncThunk(
  'dropdowns/getSiteStatusCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getSiteStatusCd',
        query: print(graphQLSiteStatusCd()),
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
);

export const fetchSchedule2ReferenceCd = createAsyncThunk(
  'dropdowns/getSchedule2ReferenceCd',
  async () => {
    try {
      const response = await getAxiosInstance().post(GRAPHQL, {
        operationName: 'getSchedule2Ref',
        query: print(graphQLSchedule2Ref()),
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
      })
      .addCase(fetchMinistryContact.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchMinistryContact.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.ministryContact = action.payload;
      })
      .addCase(fetchMinistryContact.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(fetchInternalUserNameForDropdown.fulfilled, (state, action) => {
        if (
          action?.payload?.data?.getIDIRUserListForDropDown?.httpStatusCode ===
          200
        )
          state.dropdowns.internalUserList =
            action.payload.data.getIDIRUserListForDropDown.data;
      })
      .addCase(fetchSiteRiskCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchSiteRiskCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.siteRiskCode = action.payload;
      })
      .addCase(fetchSiteRiskCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(fetchBceRegionCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchBceRegionCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.bceRegionCode = action.payload;
      })
      .addCase(fetchBceRegionCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(fetchSiteStatusCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchSiteStatusCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.siteStatusCode = action.payload;
      })
      .addCase(fetchSiteStatusCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      })
      .addCase(fetchSchedule2ReferenceCd.pending, (state) => {
        state.status = RequestStatus.loading;
      })
      .addCase(fetchSchedule2ReferenceCd.fulfilled, (state, action) => {
        state.status = RequestStatus.success;
        state.dropdowns.schedule2Ref = action.payload;
      })
      .addCase(fetchSchedule2ReferenceCd.rejected, (state, action) => {
        state.status = RequestStatus.failed;
        state.error = action.error.message;
      });
  },
});

export const participantNameDrpdown = (state: any) =>
  state.dropdown.dropdowns.participantNames.getPeopleOrgsCd;
export const ministryContactDrpdown = (state: any) =>
  state.dropdown.dropdowns.ministryContact.getPeopleOrgsCd;
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

export const getInternalUserNameForDropdown = (state: any) =>
  state.dropdown.dropdowns.internalUserList;

export const siteRiskCodeDrpdown = (state: any) =>
  state.dropdown.dropdowns.siteRiskCode.getSiteRiskCd;

export const bceRegionCodeDrpdown = (state: any) =>
  state.dropdown.dropdowns.bceRegionCode.getBCeRegionCd;

export const siteStatusCodeDrpdown = (state: any) =>
  state.dropdown.dropdowns.siteStatusCode.getSiteStatusCd;

export const schedule2ReferenceCdDrpdown = (state: any) =>
  state.dropdown.dropdowns.schedule2Ref.getSchedule2Ref;

export default dropdowns.reducer;
