import { configureStore } from "@reduxjs/toolkit";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./helpers/sessionManager";
import commonDataReducer from "./features/common/CommonDataSlice";
import siteReducer from "./features/site/dto/SiteSlice";
import thunk from 'redux-thunk';
import dashboardReducer from "./features/dashboard/DashboardSlice";
import siteParticipantReducer from "./features/details/participants/ParticipantSlice";
import DropdownReducer from "./features/details/dropdowns/DropdownSlice";
import cartReducer from "./features/cart/CartSlice";
import folioReducer from "./features/folios/FolioSlice"


const persistedStore: any = loadFromLocalStorage();

export const store = configureStore({
  reducer: {  
    commonData: commonDataReducer,
    sites:siteReducer,
    dashboard: dashboardReducer,
    siteParticipant: siteParticipantReducer,
    dropdown: DropdownReducer,  
    cart: cartReducer,
    folio: folioReducer
  },
});

store.subscribe(() => {
// TODO
});

export type AppDispatch = typeof store.dispatch;
