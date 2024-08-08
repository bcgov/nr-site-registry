import React from 'react';
// import Landing from "../features/landing/Landing"
import { Routes, Route, createBrowserRouter } from 'react-router-dom';
import Search from '../features/site/Search';
import MapSearch from '../features/map/MapSearch';
import SiteDetails from '../features/details/SiteDetails';
import Dashboard from '../features/dashboard/Dashboard';
import Cart from '../features/cart/Cart';
import Folios from '../features/folios/Folios';
import FolioContents from '../features/folios/FolioContent';
import App from '../../App';

const siteRouter = createBrowserRouter([
  {
    element: <App />,
    errorElement: <h1>Page not found</h1>,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/search/site/details/:id',
        element: <SiteDetails />,
      },
      {
        path: '/folios',
        element: <Folios />,
      },
      {
        path: '/folios/:id',
        element: <FolioContents />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/dashboard/site/details/:id',
        element: <SiteDetails />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
          {
            path: '/dashboard/site/details/:id',
            element: <SiteDetails />,
          },
        ],
      },

      {
        path: '/map',
        element: <MapSearch />,
        children: [
          {
            path: '/map/:id',
            element: <MapSearch />,
          },
        ],
      },
      {
        path: '/site/cart',
        element: <Cart />,
      },
    ],
  },
]);

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
