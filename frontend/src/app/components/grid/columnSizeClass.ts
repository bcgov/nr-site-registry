import { ColumnSize } from '../table/TableColumn';

export function columnSizeClass(columnSize: ColumnSize | undefined) {
  switch (columnSize) {
    case ColumnSize.Triple:
      return 'triple';
    case ColumnSize.Double:
      return 'double';
    case ColumnSize.Small:
      return 'custom-small';
    case ColumnSize.XtraSmall:
      return 'xtraSmall';
    case ColumnSize.w300:
      return 'w300';
    case ColumnSize.w200:
      return 'w200';
    case ColumnSize.w100:
      return 'w100';
    case ColumnSize.w50:
      return 'w50';
    default:
      return '';
  }
}
