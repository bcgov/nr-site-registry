import { SectionColumn } from '../../components/grid/SectionColumn';
import { TableLink } from '../../components/grid/TableLink';
import { columnSizeClass } from '../../components/grid/columnSizeClass';
import { GridColumn } from '../../components/grid/Grid';
import { FormFieldType } from '../../components/input-controls/IFormField';

import { formatDate } from '../../helpers/utility';
import { recentViewedColumns } from './DashboardConfig';
import { RecentView } from './recentViews';

function fieldValue(row: RecentView, propertyName: string): string {
  const value = row[propertyName as keyof RecentView];
  return value == null ? '' : String(value);
}

function RecentViewCell({
  column,
  row,
}: {
  column: SectionColumn;
  row: RecentView;
}) {
  const field = column.displayType;
  const value = fieldValue(row, column.graphQLPropertyName);

  if (field?.type === FormFieldType.Link) {
    return (
      <TableLink
        to={`${field.href ?? ''}${value}`}
        label={field.label}
        value={value}
        text={field.customLinkValue ?? value}
        icon={field.customIcon}
        className={field.customInputTextCss}
        state={{
          fromPath: field.componentPath ?? '',
          fromLabel: field.componentName ?? '',
        }}
      />
    );
  }

  const shown =
    field?.type === FormFieldType.Date ? formatDate(value || null) : value;

  return (
    <span
      aria-label={column.displayName}
      className={`d-flex pt-1 ${field?.customInputTextCss ?? ''}`}
    >
      {shown}
    </span>
  );
}

export function buildRecentViewColumns(): GridColumn<RecentView>[] {
  return recentViewedColumns.map((column) => {
    const sizeClass = columnSizeClass(column.columnSize);
    return {
      id: String(column.id),
      label: column.displayName,
      sortable: false,
      headerClassName: sizeClass,
      cellClassName:
        `table-border-light align-content-center ${sizeClass}`.trim(),
      cell: (row: RecentView) => <RecentViewCell column={column} row={row} />,
    };
  });
}
