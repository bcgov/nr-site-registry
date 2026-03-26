import { Navigate } from 'react-router-dom';
import Search from '../features/site/Search';
import { roleBasedRoutes } from './Routes';
import { UserRoleType } from '../helpers/utility';

describe('roleBasedRoutes default entry behavior', () => {
  const getRoute = (role: UserRoleType, path: string) =>
    roleBasedRoutes[role].find((route) => route.path === path);

  it('redirects internal root route to dashboard', () => {
    const route = getRoute(UserRoleType.INTERNAL, '/');

    expect(route).toBeDefined();
    expect(route?.element.type).toBe(Navigate);
    expect(route?.element.props.to).toBe('/dashboard');
  });

  it('redirects SR root route to dashboard', () => {
    const route = getRoute(UserRoleType.SR, '/');

    expect(route).toBeDefined();
    expect(route?.element.type).toBe(Navigate);
    expect(route?.element.props.to).toBe('/dashboard');
  });

  it('keeps client and public root routes on search', () => {
    const clientRoot = getRoute(UserRoleType.CLIENT, '/');
    const publicRoot = getRoute(UserRoleType.PUBLIC, '/');

    expect(clientRoot).toBeDefined();
    expect(publicRoot).toBeDefined();
    expect(clientRoot?.element.type).toBe(Search);
    expect(publicRoot?.element.type).toBe(Search);
  });

  it('keeps /search route available for all roles', () => {
    const roles: UserRoleType[] = [
      UserRoleType.CLIENT,
      UserRoleType.INTERNAL,
      UserRoleType.SR,
      UserRoleType.PUBLIC,
    ];

    roles.forEach((role) => {
      const searchRoute = getRoute(role, '/search');

      expect(searchRoute).toBeDefined();
      expect(searchRoute?.element.type).toBe(Search);
    });
  });
});
