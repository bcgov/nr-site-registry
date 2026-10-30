import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SiteSearchFilterState } from './ISiteSearchState';

const initialState: SiteSearchFilterState = {
  filter: {},
};

const siteSearchSlice = createSlice({
  name: 'siteSearch',
  initialState,
  reducers: {
    setSearchFilter(
      state,
      action: PayloadAction<SiteSearchFilterState['filter']>,
    ) {
      state.filter = action.payload;
    },
  },
});

export const selectSearchFilter = (state: {
  siteSearch: SiteSearchFilterState;
}) => state.siteSearch.filter;

export const { setSearchFilter } = siteSearchSlice.actions;
export default siteSearchSlice.reducer;
