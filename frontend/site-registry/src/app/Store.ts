import { configureStore } from '@reduxjs/toolkit';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from './helpers/sessionManager';
import commonDataReducer from './features/common/CommonDataSlice';
import siteReducer from './features/site/dto/SiteSlice';
import thunk from 'redux-thunk';
import dashboardReducer from "./features/dashboard/DashboardSlice";
import siteParticipantReducer from "./features/details/participants/ParticipantSlice";
import notationParticipantReducer from "./features/details/notations/NotationSlice";
import DropdownReducer from "./features/details/dropdowns/DropdownSlice";
import siteDisclosureReducer from "./features/details/disclosure/DisclosureSlice";
import cartReducer from "./features/cart/CartSlice";
import documentsReducer from './features/details/documents/DocumentsSlice';
import snapshotsReducer from './features/details/snapshot/SnapshotSlice';

const persistedStore: any = loadFromLocalStorage();

export const store = configureStore({
  reducer: {
    commonData: commonDataReducer,
    sites: siteReducer,
    dashboard: dashboardReducer,
    siteParticipant: siteParticipantReducer,
    notationParticipant: notationParticipantReducer,
    siteDisclosure: siteDisclosureReducer,
    dropdown: DropdownReducer,
    cart: cartReducer,
    documents: documentsReducer,
    snapshots: snapshotsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  // TODO
});

export type AppDispatch = typeof store.dispatch;
