function formatLocalDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalDateTime(value: Date): string {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  const seconds = String(value.getSeconds()).padStart(2, '0');
  return `${formatLocalDate(value)}T${hours}:${minutes}:${seconds}`;
}

function canonicalNumber(value: number): string | null {
  if (!Number.isFinite(value)) return null;
  if (Number.isSafeInteger(value)) return String(value);
  return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

/** Drop nulls and other control characters Oracle keeps and Postgres does not. */
function cleanText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

/**
 * Stored-value equality: blank and null match, text is trimmed, control
 * characters are ignored, and dates compare as calendar days.
 */
export function norm(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return formatLocalDate(value);
  }
  if (typeof value === 'number') return canonicalNumber(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  const text = cleanText(String(value));
  if (text === '') return null;
  const datePrefix = text.match(/^(\d{4}-\d{2}-\d{2})(?:[T ].*)?$/);
  if (datePrefix?.[1]) return datePrefix[1];
  if (/^-?\d+\.\d+$/.test(text)) {
    return text.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  }
  return text;
}

/** Primary-key identity keeps the time of day so same-day rows stay distinct. */
export function keyNorm(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return formatLocalDateTime(value);
  }
  if (typeof value === 'number') return canonicalNumber(value) ?? '';
  if (typeof value === 'bigint') return value.toString();
  const text = cleanText(String(value));
  const timestamp = text.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
  if (timestamp?.[1] && timestamp[2]) return `${timestamp[1]}T${timestamp[2]}`;
  return norm(value) ?? '';
}

export function canonicalWkt(value: unknown): string | null {
  const text = norm(value);
  if (text === null) return null;
  const rounded = text.replace(
    /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (raw) => {
      const num = Number(raw);
      if (!Number.isFinite(num)) return raw;
      return num.toFixed(6);
    },
  );
  return rounded.replace(/\s+/g, '').toUpperCase();
}

export function oracleIdent(name: string): string {
  return `"${name.toUpperCase().replace(/"/g, '""')}"`;
}

export function pgIdent(name: string): string {
  return `"${name.toLowerCase().replace(/"/g, '""')}"`;
}

export function lowerRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.toLowerCase()] = value;
  }
  return out;
}

export function numericIds(ids: readonly number[]): string {
  return ids
    .map((id) => {
      if (!Number.isSafeInteger(id)) {
        throw new Error(`Refusing non-numeric id ${String(id)}`);
      }
      return String(id);
    })
    .join(', ');
}

export function chunks<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    out.push(items.slice(index, index + size));
  }
  return out;
}
