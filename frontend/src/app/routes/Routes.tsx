import React, { useEffect } from 'react';
// import Landing from "../features/landing/Landing"
import { Routes, Route, createBrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import Search from '../features/site/Search';
import SiteDetails from '../features/details/SiteDetails';
import Dashboard from '../features/dashboard/Dashboard';
import Cart from '../features/cart/Cart';
import Folios from '../features/folios/Folios';
import FolioContents from '../features/folios/FolioContent';
import App from '../../App';
import {
  getLoggedInUserType,
  getUser,
  isUserOfType,
  UserRoleType,
} from '../helpers/utility';
import MapView from '../features/map/MapView';
import SRUpdatesTables from '../features/details/srUpdates/srUpdatesTables';

const roleBasedRoutes: any = {
  client: [
    { path: '/', element: <Search /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/dashboard/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/folios', element: <Folios /> },
    { path: '/folios/:id', element: <FolioContents /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/site/cart', element: <Cart /> },
    { path: '/review', element: <SRUpdatesTables /> },
    { path: '/site/cart/site/details/:id', element: <SiteDetails /> },
  ],
  internal: [
    { path: '/', element: <Search /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    { path: '/dashboard/site/create', element: <SiteDetails /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/dashboard/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/folios', element: <Folios /> },
    { path: '/folios/:id', element: <FolioContents /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/review', element: <SRUpdatesTables /> },
  ],
  sr: [
    { path: '/', element: <Search /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/review', element: <SRUpdatesTables /> },
  ],
  public: [
    { path: '/', element: <Search /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/site/cart', element: <Cart /> },
    { path: '/folios/:id', element: <FolioContents /> },
  ],
};

// Create routes based on the user's role
const createRoutesForRole = (role: string) => [
  {
    element: (
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <App />
      </QueryParamProvider>
    ),
    errorElement: <h1>Page not found</h1>,
    children: roleBasedRoutes[role]?.map((route: any) => ({
      path: route.path,
      element: route.element,
      children: route.children,
    })),
  },
];

const userType = getLoggedInUserType();
const siteRouter = createBrowserRouter(createRoutesForRole(userType));

export default siteRouter;
