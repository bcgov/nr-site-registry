import { keycloakRoleAliases } from './role';

describe('keycloakRoleAliases', () => {
  it('matches both client and realm forms of a role', () => {
    expect(keycloakRoleAliases('site-service-caller')).toEqual([
      'site-service-caller',
      'realm:site-service-caller',
    ]);
  });

  it('does not double-prefix an already-prefixed role', () => {
    expect(keycloakRoleAliases('realm:site-service-caller')).toEqual([
      'site-service-caller',
      'realm:site-service-caller',
    ]);
  });
});
