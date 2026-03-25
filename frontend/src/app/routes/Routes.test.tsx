import { Navigate } from 'react-router-dom';
import Search from '../features/site/Search';
import { roleBasedRoutes } from './Routes';

describe('roleBasedRoutes default entry behavior', () => {
  const getRoute = (role: string, path: string) =>
    roleBasedRoutes[role].find((route) => route.path === path);

  it('redirects internal root route to dashboard', () => {
    const route = getRoute('internal', '/');

    expect(route).toBeDefined();
    expect(route?.element.type).toBe(Navigate);
    expect(route?.element.props.to).toBe('/dashboard');
  });

  it('redirects SR root route to dashboard', () => {
    const route = getRoute('sr', '/');

    expect(route).toBeDefined();
    expect(route?.element.type).toBe(Navigate);
    expect(route?.element.props.to).toBe('/dashboard');
  });

  it('keeps client and public root routes on search', () => {
    const clientRoot = getRoute('client', '/');
    const publicRoot = getRoute('public', '/');

    expect(clientRoot).toBeDefined();
    expect(publicRoot).toBeDefined();
    expect(clientRoot?.element.type).toBe(Search);
    expect(publicRoot?.element.type).toBe(Search);
  });

  it('keeps /search route available for all roles', () => {
    const roles = ['client', 'internal', 'sr', 'public'];

    roles.forEach((role) => {
      const searchRoute = getRoute(role, '/search');

      expect(searchRoute).toBeDefined();
      expect(searchRoute?.element.type).toBe(Search);
    });
  });
});
