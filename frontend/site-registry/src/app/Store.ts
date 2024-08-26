import { configureStore } from '@reduxjs/toolkit';
import { loadFromLocalStorage } from './helpers/sessionManager';
import commonDataReducer from './features/common/CommonDataSlice';
import siteReducer from './features/site/dto/SiteSlice';
import dashboardReducer from './features/dashboard/DashboardSlice';
import siteParticipantReducer from './features/details/participants/ParticipantSlice';
import notationParticipantReducer from './features/details/notations/NotationSlice';
import DropdownReducer from './features/details/dropdowns/DropdownSlice';
import siteDisclosureReducer from './features/details/disclosure/DisclosureSlice';
import cartReducer from './features/cart/CartSlice';
import landUsesReducer from './features/details/landUses/LandUsesSlice';
import documentsReducer from './features/details/documents/DocumentsSlice';
import snapshotsReducer from './features/details/snapshot/SnapshotSlice';
import folioReducer from './features/folios/FolioSlice';
import associatedSitesReducer from './features/details/associates/AssociateSlice';

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
    landUses: landUsesReducer,
    documents: documentsReducer,
    folio: folioReducer,
    snapshots: snapshotsReducer,
    associatedSites: associatedSitesReducer,
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
