import {
  convertRowsToCSV,
  toExcelFriendlyCSVContent,
  escapeCSVValue,
  normalizeValue,
  neutralizeSpreadsheetFormula,
  getValueByPath,
  propertyText,
  downloadLabeledValues,
} from './csvExport';

describe('escapeCSVValue', () => {
  it('should not quote simple alphanumeric values', () => {
    expect(escapeCSVValue('simple')).toBe('simple');
  });

  it('should quote values containing commas', () => {
    expect(escapeCSVValue('a,b')).toBe('"a,b"');
  });

  it('should quote and escape values containing quotes', () => {
    expect(escapeCSVValue('a"b')).toBe('"a""b"');
  });

  it('should quote values containing line breaks', () => {
    expect(escapeCSVValue('a\nb')).toBe('"a\nb"');
  });

  it('should quote values containing carriage returns', () => {
    expect(escapeCSVValue('a\rb')).toBe('"a\rb"');
  });
});

describe('normalizeValue', () => {
  it('should convert null to empty string', () => {
    expect(normalizeValue(null)).toBe('');
  });

  it('should convert undefined to empty string', () => {
    expect(normalizeValue(undefined)).toBe('');
  });

  it('should convert numbers to strings', () => {
    expect(normalizeValue(123)).toBe('123');
  });

  it('should convert booleans to strings', () => {
    expect(normalizeValue(true)).toBe('true');
    expect(normalizeValue(false)).toBe('false');
  });

  it('should keep strings as-is', () => {
    expect(normalizeValue('hello')).toBe('hello');
  });

  it('should return empty string for object values', () => {
    expect(normalizeValue({ a: 1 })).toBe('');
  });
});

describe('neutralizeSpreadsheetFormula', () => {
  it('should leave safe values unchanged', () => {
    expect(neutralizeSpreadsheetFormula('hello')).toBe('hello');
  });

  it('should neutralize leading equals', () => {
    expect(neutralizeSpreadsheetFormula('=SUM(A1)')).toBe("'=SUM(A1)");
  });

  it('should neutralize leading plus', () => {
    expect(neutralizeSpreadsheetFormula('+SUM(A1)')).toBe("'+SUM(A1)");
  });

  it('should neutralize leading minus', () => {
    expect(neutralizeSpreadsheetFormula('-10')).toBe("'-10");
  });

  it('should neutralize leading at sign', () => {
    expect(neutralizeSpreadsheetFormula('@cmd')).toBe("'@cmd");
  });

  it('should not neutralize if already prefixed with quote', () => {
    expect(neutralizeSpreadsheetFormula("'=SUM(A1)")).toBe("'=SUM(A1)");
  });

  it('should handle empty string', () => {
    expect(neutralizeSpreadsheetFormula('')).toBe('');
  });

  it('should neutralize after leading whitespace', () => {
    expect(neutralizeSpreadsheetFormula('  =SUM(A1)')).toBe("'  =SUM(A1)");
  });
});

describe('getValueByPath', () => {
  it('should retrieve simple property values', () => {
    const obj = { name: 'John', age: 30 };
    expect(getValueByPath(obj, 'name')).toBe('John');
    expect(getValueByPath(obj, 'age')).toBe(30);
  });

  it('should retrieve nested property values', () => {
    const obj = { user: { name: 'John', email: 'john@example.com' } };
    expect(getValueByPath(obj, 'user.name')).toBe('John');
    expect(getValueByPath(obj, 'user.email')).toBe('john@example.com');
  });

  it('should retrieve array element values', () => {
    const obj = { items: ['a', 'b', 'c'] };
    expect(getValueByPath(obj, 'items.0')).toBe('a');
    expect(getValueByPath(obj, 'items.2')).toBe('c');
  });

  it('should retrieve nested array element properties', () => {
    const obj = { items: [{ name: 'first' }, { name: 'second' }] };
    expect(getValueByPath(obj, 'items.0.name')).toBe('first');
    expect(getValueByPath(obj, 'items.1.name')).toBe('second');
  });

  it('should return undefined for non-existent properties', () => {
    const obj = { name: 'John' };
    expect(getValueByPath(obj, 'nonexistent')).toBeUndefined();
  });

  it('should return undefined for non-integer array indices', () => {
    const obj = { items: ['a', 'b', 'c'] };
    expect(getValueByPath(obj, 'items.abc')).toBeUndefined();
  });

  it('should return the original record when path has no segments', () => {
    const obj = { name: 'John' };
    expect(getValueByPath(obj, '[]')).toEqual(obj);
  });
});

describe('propertyText', () => {
  it('should return empty string for an empty property path', () => {
    expect(propertyText({ name: 'test' }, '')).toBe('');
  });

  it('should return simple property value for non-date columns', () => {
    expect(propertyText({ name: 'John' }, 'name')).toBe('John');
  });

  it('should join multiple properties with space separator', () => {
    expect(
      propertyText(
        { first: 'John', last: 'Doe', middle: 'Q' },
        'first,middle,last',
      ),
    ).toBe('John Q Doe');
  });

  it('should handle missing properties in multi-field columns', () => {
    expect(propertyText({ first: 'John' }, 'first,middle,last')).toBe('John');
  });

  it('should return empty for invalid Date objects', () => {
    expect(
      propertyText({ whenCreated: new Date('invalid-date') }, 'whenCreated', {
        date: true,
      }),
    ).toBe('');
  });

  it('should format a valid date string', () => {
    expect(
      propertyText({ whenCreated: '1995-04-26T00:00:00.000Z' }, 'whenCreated', {
        date: true,
      }),
    ).toBe('April 26, 1995');
  });

  it('should return empty for an invalid date string', () => {
    expect(
      propertyText({ whenCreated: 'not-a-date' }, 'whenCreated', {
        date: true,
      }),
    ).toBe('');
  });

  it('should resolve nested array index paths like items[0].name', () => {
    expect(
      propertyText(
        { items: [{ name: 'Alpha' }, { name: 'Beta' }] },
        'items[0].name',
      ),
    ).toBe('Alpha');
  });

  it('should return an empty cell for a missing property', () => {
    expect(propertyText({ id: 1 }, 'nonexistent')).toBe('');
  });

  it('should treat null and undefined as empty cells', () => {
    expect(propertyText({ value1: null, value2: undefined }, 'value1')).toBe(
      '',
    );
    expect(propertyText({ value1: null, value2: undefined }, 'value2')).toBe(
      '',
    );
  });

  it('should stringify numbers and booleans', () => {
    expect(propertyText({ id: 123, active: true, score: 45.67 }, 'id')).toBe(
      '123',
    );
    expect(
      propertyText({ id: 123, active: true, score: 45.67 }, 'active'),
    ).toBe('true');
    expect(propertyText({ id: 123, active: true, score: 45.67 }, 'score')).toBe(
      '45.67',
    );
  });
});

describe('convertRowsToCSV', () => {
  it('should return an empty string when headers are missing', () => {
    expect(convertRowsToCSV([{ a: 'x' }], [])).toBe('');
  });

  it('should return an empty string when rows are empty', () => {
    expect(convertRowsToCSV([], ['A'])).toBe('');
  });

  it('should convert rows using explicit header order', () => {
    const rows = [
      { A: 'one', B: 'two' },
      { A: 'three', B: 'four' },
    ];

    expect(convertRowsToCSV(rows, ['B', 'A'])).toBe('B,A\ntwo,one\nfour,three');
  });

  it('should not quote values that do not contain special characters', () => {
    const rows = [{ A: 'simple-value' }];

    expect(convertRowsToCSV(rows, ['A'])).toBe('A\nsimple-value');
  });

  it('should quote and escape values that contain double quotes', () => {
    const rows = [{ A: 'He said "hello"' }];

    expect(convertRowsToCSV(rows, ['A'])).toBe('A\n"He said ""hello"""');
  });

  it('should quote values that contain commas', () => {
    const rows = [{ A: 'value, with, commas' }];

    expect(convertRowsToCSV(rows, ['A'])).toBe('A\n"value, with, commas"');
  });

  it('should quote values that contain carriage return characters', () => {
    const rows = [{ A: 'line1\rline2' }];

    expect(convertRowsToCSV(rows, ['A'])).toBe('A\n"line1\rline2"');
  });

  it('should preserve embedded CRLF/LF inside quoted cells', () => {
    const rows = [{ A: 'first\r\nsecond\nthird' }];

    expect(convertRowsToCSV(rows, ['A'])).toBe('A\n"first\r\nsecond\nthird"');
  });

  it('should neutralize formula-like prefixes for spreadsheet safety', () => {
    const rows = [
      {
        A: '=1+1',
        B: '+SUM(A1:A2)',
        C: '-10+2',
        D: '@cmd',
      },
    ];

    expect(convertRowsToCSV(rows, ['A', 'B', 'C', 'D'])).toBe(
      "A,B,C,D\n'=1+1,'+SUM(A1:A2),'-10+2,'@cmd",
    );
  });

  it('should neutralize formula-like values even with leading spaces', () => {
    const rows = [{ A: '   =HYPERLINK("http://example.com")' }];

    expect(convertRowsToCSV(rows, ['A'])).toBe(
      `A\n"'   =HYPERLINK(""http://example.com"")"`,
    );
  });
});

describe('downloadLabeledValues', () => {
  const columns = [
    {
      label: 'ID',
      value: (row: Record<string, unknown>) => String(row.id ?? ''),
    },
  ];

  it('should return early when there is no CSV content to export', () => {
    const originalCreateObjectURL = globalThis.URL.createObjectURL;
    const createObjectURLMock = jest.fn(() => 'blob:mock');

    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURLMock,
    });

    downloadLabeledValues([], columns);

    expect(createObjectURLMock).not.toHaveBeenCalled();

    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL,
    });
  });

  it('should create and revoke a blob URL when exporting', () => {
    jest.useFakeTimers();

    const originalCreateObjectURL = globalThis.URL.createObjectURL;
    const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;

    const createObjectURLMock = jest.fn(() => 'blob:mock');
    const revokeObjectURLMock = jest.fn();

    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURLMock,
    });

    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectURLMock,
    });

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');

    downloadLabeledValues([{ id: 123 }], columns, 'sites.csv');
    jest.runAllTimers();

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock');
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);

    appendSpy.mockRestore();
    removeSpy.mockRestore();

    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL,
    });

    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: originalRevokeObjectURL,
    });

    jest.useRealTimers();
  });
});

describe('toExcelFriendlyCSVContent', () => {
  it('should return empty string for empty input', () => {
    expect(toExcelFriendlyCSVContent('')).toBe('');
  });

  it('should add BOM and normalize line endings to CRLF', () => {
    const content = 'A,B\n1,2\r3,4\r\n5,6';
    expect(toExcelFriendlyCSVContent(content)).toBe(
      '\uFEFFA,B\r\n1,2\r\n3,4\r\n5,6',
    );
  });
});
