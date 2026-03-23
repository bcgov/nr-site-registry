import { FormFieldType } from '../../components/input-controls/IFormField';
import { TableColumn } from '../../components/table/TableColumn';
import {
  convertRowsToCSV,
  convertSelectedColumnsToCSV,
  toExcelFriendlyCSVContent,
} from './csvExport';

describe('convertRowsToCSV', () => {
  it('should return an empty string when headers are missing', () => {
    expect(convertRowsToCSV([{ a: 'x' }], [])).toBe('');
  });

  it('should convert rows using explicit header order', () => {
    const rows = [
      { A: 'one', B: 'two' },
      { A: 'three', B: 'four' },
    ];

    expect(convertRowsToCSV(rows, ['B', 'A'])).toBe('B,A\ntwo,one\nfour,three');
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
      '411,7477 6TH STREET,"LOCATION DERIVED BY BC ENVIRONMENT, NAD 83 ""ORTHO""","April 26th, 1995"';

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
