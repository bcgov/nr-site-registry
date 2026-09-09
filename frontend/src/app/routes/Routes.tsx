import { Navigate, createBrowserRouter, RouteObject } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import Search from '../features/site/Search';
import Dashboard from '../features/dashboard/Dashboard';
import Cart from '../features/cart/Cart';
import Folios from '../features/folios/Folios';
import FolioContents from '../features/folios/FolioContent';
import Purchases from '../features/purchases/Purchases';
import App from '../../App';
import MapView from '../features/map/MapView';
import SRUpdatesTables from '../features/details/srUpdates/srUpdatesTables';
import { UserRoleType } from '../helpers/utility';
import { siteDetailsPage } from '../features/details/navigation/siteDetailsRoutes';

export const roleBasedRoutes: Record<UserRoleType, RouteObject[]> = {
  [UserRoleType.CLIENT]: [
    { path: '/', element: <Search /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    siteDetailsPage('/site/details/:id'),
    siteDetailsPage('/dashboard/site/details/:id'),
    siteDetailsPage('/search/site/details/:id'),
    { path: '/folios', element: <Folios /> },
    { path: '/folios/:id', element: <FolioContents /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/site/cart', element: <Cart /> },
    { path: '/site-details', element: <Purchases /> },
    siteDetailsPage('/site-details/site/details/:id'),
    { path: '/review', element: <SRUpdatesTables /> },
    siteDetailsPage('/site/cart/site/details/:id'),
  ],
  [UserRoleType.INTERNAL]: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    siteDetailsPage('/dashboard/site/create'),
    siteDetailsPage('/site/details/:id'),
    siteDetailsPage('/dashboard/site/details/:id'),
    siteDetailsPage('/search/site/details/:id'),
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/review', element: <SRUpdatesTables /> },
  ],
  [UserRoleType.SR]: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/search', element: <Search /> },
    siteDetailsPage('/site/details/:id'),
    siteDetailsPage('/search/site/details/:id'),
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/review', element: <SRUpdatesTables /> },
    { path: '/dashboard', element: <Dashboard /> },
    siteDetailsPage('/dashboard/site/create'),
    siteDetailsPage('/dashboard/site/details/:id'),
  ],
  [UserRoleType.PUBLIC]: [
    { path: '/', element: <Search /> },
    { path: '/search', element: <Search /> },
    siteDetailsPage('/site/details/:id'),
    siteDetailsPage('/search/site/details/:id'),
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/site/cart', element: <Cart /> },
  ],
};

// Create routes based on the user's role
const createRoutesForRole = (role: UserRoleType) => [
  {
    element: (
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <App />
      </QueryParamProvider>
    ),
    errorElement: <h1>Page not found</h1>,
    children: roleBasedRoutes[role],
  },
];

const siteRouter = (userType: UserRoleType) => {
  return createBrowserRouter(createRoutesForRole(userType));
};
export default siteRouter;
