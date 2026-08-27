import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import SiteDetailsIndexRedirect, {
  getIndexRedirectTarget,
} from './SiteDetailsIndexRedirect';

const OutletLocation = () => {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
};

const renderAt = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/site/details/:id" element={<Outlet />}>
          <Route index element={<SiteDetailsIndexRedirect />} />
          <Route path=":tab" element={<OutletLocation />} />
        </Route>
        <Route path="/search/site/details/:id" element={<Outlet />}>
          <Route index element={<SiteDetailsIndexRedirect />} />
          <Route path=":tab" element={<OutletLocation />} />
        </Route>
        <Route path="/dashboard/site/create" element={<Outlet />}>
          <Route index element={<SiteDetailsIndexRedirect />} />
          <Route path=":tab" element={<OutletLocation />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('getIndexRedirectTarget', () => {
  it('sends a bare site details URL to Summary', () => {
    expect(getIndexRedirectTarget('')).toEqual({
      pathname: 'summary',
      search: '',
    });
  });

  it('rewrites every known empty tab flag onto that path', () => {
    [
      'summary',
      'notations',
      'participants',
      'documents',
      'associated',
      'landuses',
      'parceldesc',
      'disclosure',
      'updates',
    ].forEach((tab) => {
      expect(getIndexRedirectTarget(`?${tab}`)).toEqual({
        pathname: tab,
        search: '',
      });
    });
  });

  it('keeps applicationId while dropping the tab flag', () => {
    expect(getIndexRedirectTarget('?notations&applicationId=abc')).toEqual({
      pathname: 'notations',
      search: '?applicationId=abc',
    });
  });

  it('leaves a query that is not a known empty tab flag alone and still defaults to Summary', () => {
    expect(getIndexRedirectTarget('?applicationId=abc')).toEqual({
      pathname: 'summary',
      search: '?applicationId=abc',
    });
    expect(getIndexRedirectTarget('?notations=1')).toEqual({
      pathname: 'summary',
      search: '?notations=1',
    });
    expect(getIndexRedirectTarget('?foo=bar')).toEqual({
      pathname: 'summary',
      search: '?foo=bar',
    });
  });
});

describe('SiteDetailsIndexRedirect', () => {
  it('replace-redirects a site details URL with no tab to Summary', () => {
    renderAt('/site/details/9');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/summary',
    );
  });

  it('preserves applicationId when redirecting the index to Summary', () => {
    renderAt('/site/details/9?applicationId=abc');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/summary?applicationId=abc',
    );
  });

  it('rewrites a legacy notations flag onto the canonical path', () => {
    renderAt('/site/details/9?notations');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations',
    );
  });

  it('rewrites a legacy flag under a prefixed site details URL', () => {
    renderAt('/search/site/details/9?documents&applicationId=abc');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/search/site/details/9/documents?applicationId=abc',
    );
  });

  it('rewrites create-site with no tab to Summary', () => {
    renderAt('/dashboard/site/create');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/dashboard/site/create/summary',
    );
  });
});
