import React, { useEffect } from 'react';
// import Landing from "../features/landing/Landing"
import { Routes, Route, createBrowserRouter } from 'react-router-dom';
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

const roleBasedRoutes: any = {
  client: [
    { path: '/', element: <Dashboard /> },
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
    { path: '/site/cart/site/details/:id', element: <SiteDetails /> },
  ],
  internal: [
    { path: '/', element: <Dashboard /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/dashboard/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/folios', element: <Folios /> },
    { path: '/folios/:id', element: <FolioContents /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
  ],
  sr: [
    { path: '/', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
  ],
  public: [
    { path: '/', element: <Dashboard /> },
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
    element: <App />,
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

// const AppRoutes = () => {

//   // return (
//   //   <Routes>
//   //     <Route path="/" element={<Dashboard />}></Route>
//   //     <Route path="/search" element={<Search />}></Route>
//   //     <Route path="/folios" element={<Folios/>}></Route>
//   //     <Route path="" element={<FolioContents/>}></Route>
//   //     <Route path="/dashboard" element={<Dashboard />}></Route>
//   //     <Route path="/dashboard/site/details/:id" element={<SiteDetails/>}></Route>
//   //     <Route path="/search/site/details/:id" element={<SiteDetails/>}></Route>
//   //     <Route path="/site/map/:id" element={<MapSearch/>}></Route>
//   //     <Route path="/site/cart" element={<Cart/>}></Route>
//   //     <Route path="*" element={<h1>Page not found</h1>}></Route>
//   //   </Routes>
//   // );
// };

export default siteRouter;
