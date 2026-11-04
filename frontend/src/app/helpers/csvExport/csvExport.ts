import { formatDate } from '../utility';

function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null;
}

// Excel follows CSV quoting rules for cells containing commas, quotes, or line breaks.
// Wrap those values in quotes and double any inner quotes so the cell is parsed correctly.
export function escapeCSVValue(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

// Normalize null/undefined to empty cells and coerce other values to strings,
// which keeps CSV output stable for Excel import and display.
export function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  // Objects are intentionally returned as empty — passing one to String() would
  // silently produce "[object Object]", which is never a useful CSV cell value.
  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

// Prevent spreadsheet formula interpretation when CSV is opened in Excel/Sheets.
// If the first non-whitespace character is one of = + - @, prefix with a single quote.
// This is probably overkill for our use case but provides a strong safeguard against CSV injection and accidental
// formula parsing.
export function neutralizeSpreadsheetFormula(value: string): string {
  if (!value) {
    return value;
  }

  if (value.startsWith("'")) {
    return value;
  }

  return /^[\t ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

// Excel on Windows is most reliable with UTF-8 BOM + CRLF line endings.
// Add BOM for character encoding detection and normalize line breaks to CRLF.
export function toExcelFriendlyCSVContent(csvString: string): string {
  if (!csvString) {
    return '';
  }

  const normalizedLineEndings = csvString
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replaceAll('\n', '\r\n');
  return `\uFEFF${normalizedLineEndings}`;
}

export function getValueByPath(
  record: Record<string, unknown>,
  path: string,
): unknown {
  // Pathsegments handles the case where the path includes array indexing, e.g. "items[0].name".
  // This will determine whether to use the key as an object property or an array index.
  const pathSegments: string[] = path.match(/[^.[\]]+/g) || [];
  let currentValue: unknown = record;

  for (const key of pathSegments) {
    if (Array.isArray(currentValue)) {
      const index = Number(key);
      currentValue = Number.isInteger(index) ? currentValue[index] : undefined;
      continue;
    }

    if (isObject(currentValue)) {
      currentValue = currentValue[key];
      continue;
    }

    return undefined;
  }

  return currentValue;
}

export function propertyText(
  row: Record<string, unknown>,
  property: string,
  options?: { date?: boolean },
): string {
  const propertyNames = property
    .split(',')
    .map((propertyName) => propertyName.trim())
    .filter((propertyName) => propertyName.length > 0);

  if (propertyNames.length === 0) {
    return '';
  }

  if (options?.date) {
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
        .map((header) =>
          escapeCSVValue(
            neutralizeSpreadsheetFormula(normalizeValue(row[header])),
          ),
        )
        .join(','),
    )
    .join('\n');

  return `${escapedHeader}\n${escapedRows}`;
}

export function downloadCsvDocument(
  csvString: string,
  filename: string = 'export.csv',
) {
  if (!csvString) {
    return;
  }

  const excelFriendlyCSV = toExcelFriendlyCSVContent(csvString);
  const blob = new Blob([excelFriendlyCSV], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = globalThis.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  globalThis.setTimeout(() => {
    globalThis.URL.revokeObjectURL(url);
  }, 0);
  document.body.removeChild(a);
}

export type LabeledCsvColumn = {
  label: string;
  value: (row: Record<string, unknown>) => string;
};

export function downloadLabeledValues(
  rows: Record<string, unknown>[],
  columns: LabeledCsvColumn[],
  filename: string = 'export.csv',
) {
  if (rows.length === 0 || columns.length === 0) {
    return;
  }

  const headers = columns.map((column) => column.label);
  const formattedRows = rows.map((row) =>
    columns.reduce<Record<string, unknown>>((record, column) => {
      record[column.label] = column.value(row);
      return record;
    }, {}),
  );

  downloadCsvDocument(convertRowsToCSV(formattedRows, headers), filename);
}
