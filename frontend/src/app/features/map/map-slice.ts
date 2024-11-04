import { useSelector } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MapSliceState {
  isMyLocationVisible: boolean;
}

export const initialState: MapSliceState = {
  isMyLocationVisible: false,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMyLocationVisible: (state, action: PayloadAction<boolean>) => {
      state.isMyLocationVisible = action.payload;
    },
  },
});

export const { setMyLocationVisible } = mapSlice.actions;

// Selectors
const selectMyLocationVisible = (state: any) => state.map.isMyLocationVisible;
export const useMyLocationVisible = () => useSelector(selectMyLocationVisible);

export default mapSlice.reducer;
