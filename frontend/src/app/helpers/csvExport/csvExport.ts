import { FormFieldType } from '../../components/input-controls/IFormField';
import { TableColumn } from '../../components/table/TableColumn';
import { formatDate } from '../utility';

function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null;
}

const EXCLUDED_COLUMN_NAMES = new Set(['Map', 'Details']);

// Excel follows CSV quoting rules for cells containing commas, quotes, or line breaks.
// Wrap those values in quotes and double any inner quotes so the cell is parsed correctly.
function escapeCSVValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

// Normalize null/undefined to empty cells and coerce other values to strings,
// which keeps CSV output stable for Excel import and display.
function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
}

// Excel on Windows is most reliable with UTF-8 BOM + CRLF line endings.
// Add BOM for character encoding detection and normalize line breaks to CRLF.
export function toExcelFriendlyCSVContent(csvString: string): string {
  if (!csvString) {
    return '';
  }

  const normalizedLineEndings = csvString.replace(/\r\n|\r|\n/g, '\r\n');
  return `\uFEFF${normalizedLineEndings}`;
}

function getValueByPath(
  record: Record<string, unknown>,
  path: string,
): unknown {
  // Pathsegments handles the case where the path includes array indexing, e.g. "items[0].name".
  // This will determine whether to use the key as an object property or an array index.
  const pathSegments = path.match(/[^.[\]]+/g) ?? [];

  return pathSegments.reduce<unknown>((currentValue: unknown, key: string) => {
    if (Array.isArray(currentValue)) {
      const index = Number(key);
      return Number.isInteger(index) ? currentValue[index] : undefined;
    }

    if (isObject(currentValue)) {
      return currentValue[key];
    }
    return undefined;
  }, record);
}

function getExportableColumns(columns: TableColumn[]): TableColumn[] {
  return columns.filter(
    (column) =>
      Boolean(column.isChecked) &&
      Boolean(column.graphQLPropertyName) &&
      !column.dynamicColumn &&
      !EXCLUDED_COLUMN_NAMES.has(column.displayName),
  );
}

function getColumnValue(
  row: Record<string, unknown>,
  column: TableColumn,
): string {
  const propertyNames = column.graphQLPropertyName
    .split(',')
    .map((propertyName) => propertyName.trim())
    .filter((propertyName) => propertyName.length > 0);

  if (propertyNames.length === 0) {
    return '';
  }

  if (column.displayType?.type === FormFieldType.Date) {
    const rawDate = getValueByPath(row, propertyNames[0]);
    if (rawDate instanceof Date) {
      if (Number.isNaN(rawDate.getTime())) {
        return '';
      }
      return formatDate(rawDate);
    }

    if (typeof rawDate === 'string') {
      const parsedDate = new Date(rawDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return '';
      }
      return formatDate(rawDate);
    }

    return '';
  }

  if (propertyNames.length === 1) {
    return normalizeValue(getValueByPath(row, propertyNames[0]));
  }

  return propertyNames
    .map((propertyName) => normalizeValue(getValueByPath(row, propertyName)))
    .filter((value) => value.length > 0)
    .join(' ');
}

export function convertRowsToCSV(
  rows: Record<string, unknown>[],
  headers: string[],
): string {
  if (rows.length === 0 || headers.length === 0) {
    return '';
  }

  const escapedHeader = headers.map(escapeCSVValue).join(',');
  const escapedRows = rows
    .map((row) =>
      headers
        .map((header) => escapeCSVValue(normalizeValue(row[header])))
        .join(','),
    )
    .join('\n');

  return `${escapedHeader}\n${escapedRows}`;
}

export function downloadSelectedColumnsCSV(
  selectedRows: Record<string, unknown>[],
  columns: TableColumn[],
  filename: string = 'export.csv',
) {
  const csvString = convertSelectedColumnsToCSV(selectedRows, columns);
  if (!csvString) {
    return;
  }

  const excelFriendlyCSV = toExcelFriendlyCSVContent(csvString);
  const blob = new Blob([excelFriendlyCSV], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function convertSelectedColumnsToCSV(
  selectedRows: Record<string, unknown>[],
  columns: TableColumn[],
) {
  const exportColumns = getExportableColumns(columns);
  if (selectedRows.length === 0 || exportColumns.length === 0) {
    return '';
  }

  const headers = exportColumns.map((column) => column.displayName);
  const formattedRows = selectedRows.map((row) => {
    return exportColumns.reduce<Record<string, unknown>>((acc, column) => {
      acc[column.displayName] = getColumnValue(row, column);
      return acc;
    }, {});
  });

  return convertRowsToCSV(formattedRows, headers);
}
