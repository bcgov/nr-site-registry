import { FormFieldType } from '../../../components/input-controls/IFormField';
import { getSiteSearchResultsColumns } from '../dto/Columns';
import { searchResultColumn } from './SearchResultColumn';
import {
  displayedSearchCellText,
  searchExportColumns,
} from './searchResultColumns';

describe('searchExportColumns', () => {
  const row = {
    id: '411',
    addrLine_1: '7477 6TH STREET',
    addrLine_2: '',
    addrLine_3: null,
    city: 'NEW WESTMINSTER',
    whenCreated: '1995-04-26T00:00:00.000Z',
  };

  it('exports the checked columns with the same labels and values as the results table', () => {
    const columns = getSiteSearchResultsColumns();
    const visible = columns.filter((column) => column.isChecked);
    const exported = searchExportColumns(columns);

    expect(exported.map((column) => column.label)).toEqual(
      visible.map((column) => column.displayName),
    );

    exported.forEach((column, index) => {
      expect(column.value(row)).toBe(
        displayedSearchCellText(visible[index], row),
      );
    });
  });

  it('omits a column that is hidden on the results table', () => {
    const columns = [
      searchResultColumn(1, 'Site ID', true, 'id', 1, false, true, 1, true, {
        type: FormFieldType.Label,
        label: 'Site ID',
        graphQLPropertyName: 'id',
        value: '',
      }),
      searchResultColumn(2, 'City', true, 'city', 1, false, true, 1, false, {
        type: FormFieldType.Label,
        label: 'City',
        graphQLPropertyName: 'city',
        value: '',
      }),
    ];

    const exported = searchExportColumns(columns);

    expect(exported.map((column) => column.label)).toEqual(['Site ID']);
    expect(exported[0].value({ id: '411', city: 'Victoria' })).toBe('411');
  });

  it('exports a visible link column as the text shown in the cell', () => {
    const columns = [
      searchResultColumn(1, 'Map', true, 'id', 4, true, true, 1, true, {
        type: FormFieldType.Link,
        label: 'Map',
        graphQLPropertyName: 'id',
        value: '',
        customLinkValue: 'View',
      }),
    ];

    expect(searchExportColumns(columns)[0].value({ id: '411' })).toBe('View');
  });
});
