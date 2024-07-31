import { get } from './index';

describe('get function', () => {
  const obj = {
    a: {
      b: {
        c: 42,
        d: null,
      },
    },
    e: [1, 2, 3],
  };

  it('should return the value for a valid path', () => {
    expect(get(obj, 'a.b.c')).toBe(42);
  });

  it('should return the default value for an invalid path', () => {
    expect(get(obj, 'a.b.x', 'default')).toBe('default');
  });

  it('should return undefined for an invalid path without default value', () => {
    expect(get(obj, 'a.b.x')).toBeUndefined();
  });

  it('should handle array paths', () => {
    expect(get(obj, ['a', 'b', 'c'])).toBe(42);
  });

  it('should handle array indeces', () => {
    expect(get(obj, 'e[1]')).toBe(2);
  });

  it('should return null for a path that leads to null', () => {
    expect(get(obj, 'a.b.d')).toBeNull();
  });

  it('should return undefined when the object to query is nullish without default value', () => {
    expect(get(null, 'a')).toBe(undefined);
  });

  it('should handle should return default value when the object to query is nullish', () => {
    expect(get(null, 'a', 'default')).toBe('default');
  });
});
