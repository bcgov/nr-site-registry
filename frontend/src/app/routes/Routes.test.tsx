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

describe('roleBasedRoutes site details tab children', () => {
  const roles: UserRoleType[] = [
    UserRoleType.CLIENT,
    UserRoleType.INTERNAL,
    UserRoleType.SR,
    UserRoleType.PUBLIC,
  ];

  const isSiteDetailsOrCreatePath = (path?: string) =>
    Boolean(
      path &&
        (path.includes('/site/details/') || path.endsWith('/site/create')),
    );

  const hasIndexAndTabChildren = (
    route?: (typeof roleBasedRoutes)[UserRoleType][number],
  ) => {
    const children = route?.children ?? [];
    return (
      children.some((child) => child.index === true) &&
      children.some((child) => child.path === ':tab')
    );
  };

  it.each(roles)(
    'nests the same index and tab children on every site details and create-site route for %s',
    (role) => {
      const detailsRoutes = roleBasedRoutes[role].filter((route) =>
        isSiteDetailsOrCreatePath(route.path),
      );

      expect(detailsRoutes.length).toBeGreaterThan(0);
      detailsRoutes.forEach((route) => {
        expect(hasIndexAndTabChildren(route)).toBe(true);
      });
    },
  );

  it('registers known tab paths for anonymous visitors so they do not 404', () => {
    const publicDetails = roleBasedRoutes[UserRoleType.PUBLIC].find(
      (route) => route.path === '/site/details/:id',
    );
    const publicSearchDetails = roleBasedRoutes[UserRoleType.PUBLIC].find(
      (route) => route.path === '/search/site/details/:id',
    );

    expect(hasIndexAndTabChildren(publicDetails)).toBe(true);
    expect(hasIndexAndTabChildren(publicSearchDetails)).toBe(true);
  });

  it('uses the same nested children for cart, purchases, dashboard, and create prefixes', () => {
    const client = roleBasedRoutes[UserRoleType.CLIENT];
    const internal = roleBasedRoutes[UserRoleType.INTERNAL];
    const paths = [
      client.find((route) => route.path === '/site/cart/site/details/:id'),
      client.find((route) => route.path === '/site-details/site/details/:id'),
      internal.find((route) => route.path === '/dashboard/site/details/:id'),
      internal.find((route) => route.path === '/dashboard/site/create'),
    ];

    paths.forEach((route) => {
      expect(route).toBeDefined();
      expect(hasIndexAndTabChildren(route)).toBe(true);
    });
  });
});
