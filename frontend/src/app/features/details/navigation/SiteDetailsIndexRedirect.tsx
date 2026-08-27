import { Navigate, useLocation } from 'react-router-dom';

import { DEFAULT_SITE_TAB, getLegacyTabFlag } from './siteTabCatalog';

export function getIndexRedirectTarget(search: string): {
  pathname: string;
  search: string;
} {
  const params = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`,
  );
  const flag = getLegacyTabFlag(params);
  if (flag) {
    params.delete(flag);
  }
  const remaining = params.toString();
  return {
    pathname: flag ?? DEFAULT_SITE_TAB,
    search: remaining ? `?${remaining}` : '',
  };
}

const SiteDetailsIndexRedirect = () => {
  const location = useLocation();
  const to = getIndexRedirectTarget(location.search);
  return <Navigate to={to} replace />;
};

export default SiteDetailsIndexRedirect;
