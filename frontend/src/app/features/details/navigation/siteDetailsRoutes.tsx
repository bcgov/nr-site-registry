import { RouteObject } from 'react-router-dom';

import SiteDetails from '../SiteDetails';
import SiteDetailsIndexRedirect from './SiteDetailsIndexRedirect';
import SiteDetailsTabRouter from './SiteDetailsTabRouter';

export const siteDetailsTabChildren: RouteObject[] = [
  { index: true, element: <SiteDetailsIndexRedirect /> },
  { path: ':tab', element: <SiteDetailsTabRouter /> },
];

export const siteDetailsPage = (path: string): RouteObject => ({
  path,
  element: <SiteDetails />,
  children: siteDetailsTabChildren,
});
