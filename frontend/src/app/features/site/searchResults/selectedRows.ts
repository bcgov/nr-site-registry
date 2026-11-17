export function isRowSelected<Row extends { id: string }>(
  selectedRows: Row[],
  row: Row,
): boolean {
  return selectedRows.some((item) => item.id === row.id);
}

export function toggleSelectedRow<Row extends { id: string }>(
  selectedRows: Row[],
  row: Row,
  selected: boolean,
): Row[] {
  if (!selected) {
    return selectedRows.filter((item) => item.id !== row.id);
  }
  if (isRowSelected(selectedRows, row)) {
    return selectedRows;
  }
  return [...selectedRows, row];
}
