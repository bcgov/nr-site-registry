import { FormFieldType } from '../../components/input-controls/IFormField';
import { TableColumn } from '../../components/table/TableColumn';
import {
  convertRowsToCSV,
  convertSelectedColumnsToCSV,
  toExcelFriendlyCSVContent,
  escapeCSVValue,
  normalizeValue,
  neutralizeSpreadsheetFormula,
  getValueByPath,
  getColumnValue,
  downloadSelectedColumnsCSV,
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

describe('getColumnValue', () => {
  it('should return empty string for columns with empty property names', () => {
    const row = { name: 'test' };
    const column = new TableColumn(
      1,
      'Empty',
      true,
      '',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Label, label: 'Empty' },
    );

    expect(getColumnValue(row, column)).toBe('');
  });

  it('should return simple property value for non-date columns', () => {
    const row = { name: 'John' };
    const column = new TableColumn(
      1,
      'Name',
      true,
      'name',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Label, label: 'Name' },
    );

    expect(getColumnValue(row, column)).toBe('John');
  });

  it('should join multiple properties with space separator', () => {
    const row = { first: 'John', last: 'Doe', middle: 'Q' };
    const column = new TableColumn(
      1,
      'Full Name',
      true,
      'first,middle,last',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Label, label: 'Full Name' },
    );

    expect(getColumnValue(row, column)).toBe('John Q Doe');
  });

  it('should handle missing properties in multi-field columns', () => {
    const row = { first: 'John' };
    const column = new TableColumn(
      1,
      'Full Name',
      true,
      'first,middle,last',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Label, label: 'Full Name' },
    );

    expect(getColumnValue(row, column)).toBe('John');
  });

  it('should return empty for invalid Date objects', () => {
    const row = { whenCreated: new Date('invalid-date') };
    const column = new TableColumn(
      1,
      'Last Updated',
      true,
      'whenCreated',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Date, label: 'Last Updated' },
    );

    expect(getColumnValue(row, column)).toBe('');
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

describe('convertSelectedColumnsToCSV', () => {
  const selectedRows = [
    {
      id: 411,
      addrLine_1: '7477 6TH STREET',
      addrLine_2: '',
      addrLine_3: null,
      generalDescription: 'LOCATION DERIVED BY BC ENVIRONMENT, NAD 83 "ORTHO"',
      whenCreated: '1995-04-26T00:00:00.000Z',
      city: 'NEW WESTMINSTER',
    },
  ];

  const selectedColumns: TableColumn[] = [
    new TableColumn(1, 'Site ID', true, 'id', 1, false, true, 1, true, {
      type: FormFieldType.Link,
      label: 'Site ID',
    }),
    new TableColumn(
      2,
      'Site Address',
      true,
      'addrLine_1,addrLine_2,addrLine_3',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Label, label: 'Site Address' },
    ),
    new TableColumn(
      3,
      'General Description',
      true,
      'generalDescription',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Label, label: 'General Description' },
    ),
    new TableColumn(
      4,
      'Last Updated',
      true,
      'whenCreated',
      1,
      false,
      true,
      1,
      true,
      { type: FormFieldType.Date, label: 'Last Updated' },
    ),
    new TableColumn(5, 'City', true, 'city', 1, false, true, 1, false, {
      type: FormFieldType.Label,
      label: 'City',
    }),
    new TableColumn(
      6,
      'Map',
      true,
      'id',
      1,
      true,
      true,
      1,
      true,
      { type: FormFieldType.Link, label: 'Map' },
      '/map?site=',
      true,
    ),
  ];

  it('should export only selected data columns with friendly names and formatted values', () => {
    const expectedCSV =
      'Site ID,Site Address,General Description,Last Updated\n' +
      '411,7477 6TH STREET,"LOCATION DERIVED BY BC ENVIRONMENT, NAD 83 ""ORTHO""","April 26, 1995"';

    expect(convertSelectedColumnsToCSV(selectedRows, selectedColumns)).toBe(
      expectedCSV,
    );
  });

  it('should return empty string when no rows are selected', () => {
    expect(convertSelectedColumnsToCSV([], selectedColumns)).toBe('');
  });

  it('should resolve nested array index paths like items[0].name', () => {
    const rowsWithArrayPath = [
      {
        items: [{ name: 'Alpha' }, { name: 'Beta' }],
      },
    ];

    const columnsWithArrayPath: TableColumn[] = [
      new TableColumn(
        1,
        'First Item',
        true,
        'items[0].name',
        1,
        false,
        true,
        1,
        true,
        { type: FormFieldType.Label, label: 'First Item' },
      ),
    ];

    expect(
      convertSelectedColumnsToCSV(rowsWithArrayPath, columnsWithArrayPath),
    ).toBe('First Item\nAlpha');
  });

  it('should export empty value for invalid datetime values', () => {
    const rowsWithInvalidDate = [
      {
        whenCreated: 'not-a-date',
      },
    ];

    const dateColumns: TableColumn[] = [
      new TableColumn(
        1,
        'Last Updated',
        true,
        'whenCreated',
        1,
        false,
        true,
        1,
        true,
        { type: FormFieldType.Date, label: 'Last Updated' },
      ),
    ];

    expect(convertSelectedColumnsToCSV(rowsWithInvalidDate, dateColumns)).toBe(
      'Last Updated\n',
    );
  });

  it('should join multiple properties with spaces', () => {
    const rows = [
      {
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Q',
      },
    ];

    const columns: TableColumn[] = [
      new TableColumn(
        1,
        'Full Name',
        true,
        'firstName, middleName, lastName',
        1,
        false,
        true,
        1,
        true,
        { type: FormFieldType.Label, label: 'Full Name' },
      ),
    ];

    expect(convertSelectedColumnsToCSV(rows, columns)).toBe(
      'Full Name\nJohn Q Doe',
    );
  });

  it('should exclude action columns like Map and Details from export', () => {
    const rows = [
      {
        id: 1,
        name: 'Test',
      },
    ];

    const columns: TableColumn[] = [
      new TableColumn(1, 'ID', true, 'id', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'ID',
      }),
      new TableColumn(
        2,
        'Map',
        true,
        'id',
        1,
        true,
        true,
        1,
        true,
        { type: FormFieldType.Link, label: 'Map' },
        '/map?site=',
        true,
      ),
      new TableColumn(3, 'Name', true, 'name', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Name',
      }),
    ];

    expect(convertSelectedColumnsToCSV(rows, columns)).toBe('ID,Name\n1,Test');
  });

  it('should handle missing properties by returning empty values', () => {
    const rows = [
      {
        id: 1,
      },
    ];

    const columns: TableColumn[] = [
      new TableColumn(1, 'ID', true, 'id', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'ID',
      }),
      new TableColumn(
        2,
        'Missing Field',
        true,
        'nonexistent',
        1,
        false,
        true,
        1,
        true,
        { type: FormFieldType.Label, label: 'Missing Field' },
      ),
    ];

    expect(convertSelectedColumnsToCSV(rows, columns)).toBe(
      'ID,Missing Field\n1,',
    );
  });

  it('should handle null and undefined values in cells', () => {
    const rows = [
      {
        name: 'Test',
        value1: null,
        value2: undefined,
      },
    ];

    const columns: TableColumn[] = [
      new TableColumn(1, 'Name', true, 'name', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Name',
      }),
      new TableColumn(2, 'Value 1', true, 'value1', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Value 1',
      }),
      new TableColumn(3, 'Value 2', true, 'value2', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Value 2',
      }),
    ];

    expect(convertSelectedColumnsToCSV(rows, columns)).toBe(
      'Name,Value 1,Value 2\nTest,,',
    );
  });

  it('should handle numeric and special values', () => {
    const rows = [
      {
        id: 123,
        active: true,
        score: 45.67,
      },
    ];

    const columns: TableColumn[] = [
      new TableColumn(1, 'ID', true, 'id', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'ID',
      }),
      new TableColumn(2, 'Active', true, 'active', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Active',
      }),
      new TableColumn(3, 'Score', true, 'score', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Score',
      }),
    ];

    expect(convertSelectedColumnsToCSV(rows, columns)).toBe(
      'ID,Active,Score\n123,true,45.67',
    );
  });

  it('should handle multiple rows with mixed data', () => {
    const rows = [
      {
        id: 1,
        name: 'First',
        email: 'first@test.com',
      },
      {
        id: 2,
        name: 'Second',
        email: 'second@test.com',
      },
      {
        id: 3,
        name: 'Third',
        email: 'third@test.com',
      },
    ];

    const columns: TableColumn[] = [
      new TableColumn(1, 'ID', true, 'id', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'ID',
      }),
      new TableColumn(2, 'Name', true, 'name', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Name',
      }),
      new TableColumn(3, 'Email', true, 'email', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Email',
      }),
    ];

    const result = convertSelectedColumnsToCSV(rows, columns);
    expect(result).toContain('ID,Name,Email');
    expect(result).toContain('1,First,first@test.com');
    expect(result).toContain('2,Second,second@test.com');
    expect(result).toContain('3,Third,third@test.com');
  });
});

describe('downloadSelectedColumnsCSV', () => {
  const exportColumns: TableColumn[] = [
    new TableColumn(1, 'ID', true, 'id', 1, false, true, 1, true, {
      type: FormFieldType.Label,
      label: 'ID',
    }),
  ];

  it('should return early when there is no CSV content to export', () => {
    const originalCreateObjectURL = globalThis.URL.createObjectURL;
    const createObjectURLMock = jest.fn(() => 'blob:mock');

    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURLMock,
    });

    downloadSelectedColumnsCSV([], exportColumns);

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

    const rows = [{ id: 123 }];
    downloadSelectedColumnsCSV(rows, exportColumns, 'sites.csv');
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
