import { Navigate, createBrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import Search from '../features/site/Search';
import SiteDetails from '../features/details/SiteDetails';
import Dashboard from '../features/dashboard/Dashboard';
import Cart from '../features/cart/Cart';
import Folios from '../features/folios/Folios';
import FolioContents from '../features/folios/FolioContent';
import Purchases from '../features/purchases/Purchases';
import App from '../../App';
import MapView from '../features/map/MapView';
import SRUpdatesTables from '../features/details/srUpdates/srUpdatesTables';
import { UserRoleType } from '../helpers/utility';

type AppRoute = {
  path: string;
  element: JSX.Element;
  children?: AppRoute[];
};

export const roleBasedRoutes: Record<UserRoleType, AppRoute[]> = {
  [UserRoleType.CLIENT]: [
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
    { path: '/site-details', element: <Purchases /> },
    { path: '/site-details/site/details/:id', element: <SiteDetails /> },
    { path: '/review', element: <SRUpdatesTables /> },
    { path: '/site/cart/site/details/:id', element: <SiteDetails /> },
  ],
  [UserRoleType.INTERNAL]: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/search', element: <Search /> },
    { path: '/dashboard/site/create', element: <SiteDetails /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/dashboard/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/review', element: <SRUpdatesTables /> },
  ],
  [UserRoleType.SR]: [
    { path: '/', element: <Navigate to="/dashboard" replace /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
    { path: '/map', element: <MapView /> },
    { path: '/map/:id', element: <MapView /> },
    { path: '/review', element: <SRUpdatesTables /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/dashboard/site/create', element: <SiteDetails /> },
    { path: '/dashboard/site/details/:id', element: <SiteDetails /> },
  ],
  [UserRoleType.PUBLIC]: [
    { path: '/', element: <Search /> },
    { path: '/search', element: <Search /> },
    { path: '/site/details/:id', element: <SiteDetails /> },
    { path: '/search/site/details/:id', element: <SiteDetails /> },
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
    children: roleBasedRoutes[role].map((route: AppRoute) => ({
      path: route.path,
      element: route.element,
      children: route.children,
    })),
  },
];

const siteRouter = (userType: UserRoleType) => {
  return createBrowserRouter(createRoutesForRole(userType));
};
export default siteRouter;
