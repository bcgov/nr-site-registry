import { Link as RouterLink } from 'react-router-dom';
import { columnSizeClass } from '../../components/grid/columnSizeClass';
import { GridColumn } from '../../components/grid/Grid';
import { FormFieldType } from '../../components/input-controls/IFormField';
import { TableColumn } from '../../components/table/TableColumn';
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
  column: TableColumn;
  row: RecentView;
}) {
  const field = column.displayType;
  const value = fieldValue(row, column.graphQLPropertyName);

  if (field?.type === FormFieldType.Link) {
    return (
      <RouterLink
        to={`${field.href ?? ''}${value}`}
        className={`d-flex pt-1 ${field.customInputTextCss ?? ''}`}
        aria-label={`${field.label} ${value}`}
        state={{
          fromPath: field.componentPath ?? '',
          fromLabel: field.componentName ?? '',
        }}
      >
        {field.customIcon ? field.customIcon : null}{' '}
        <span className="ps-1">{field.customLinkValue ?? value}</span>
      </RouterLink>
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
