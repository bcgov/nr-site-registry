import { FormFieldType } from '../../components/input-controls/IFormField';
import { ColumnSize, TableColumn } from '../../components/table/TableColumn';

export const PurchasesTableColumns: TableColumn[] = [
  {
    id: 1,
    displayName: 'Site ID',
    active: true,
    graphQLPropertyName: 'siteId',
    displayType: {
      type: FormFieldType.Link,
      label: 'Site ID',
      graphQLPropertyName: 'siteId',
      value: '',
      tableMode: true,
      href: '/site/details/',
    },
    columnSize: ColumnSize.Small,
  },
  {
    id: 2,
    displayName: 'Site Address',
    active: true,
    graphQLPropertyName: 'address',
    displayType: {
      type: FormFieldType.Text,
      label: 'Site Address',
      graphQLPropertyName: 'address',
      value: '',
      tableMode: true,
    },
    columnSize: ColumnSize.Double,
  },
  {
    id: 3,
    displayName: 'City',
    active: true,
    graphQLPropertyName: 'city',
    displayType: {
      type: FormFieldType.Text,
      label: 'City',
      graphQLPropertyName: 'city',
      value: '',
      tableMode: true,
    },
  },
  {
    id: 4,
    displayName: 'Purchase Date',
    active: true,
    graphQLPropertyName: 'purchaseDate',
    displayType: {
      type: FormFieldType.Label,
      label: 'Purchase Date',
      graphQLPropertyName: 'purchaseDate',
      value: '',
      tableMode: true,
    },
  },
  {
    id: 5,
    displayName: 'Status',
    active: true,
    graphQLPropertyName: 'status',
    displayType: {
      type: FormFieldType.Label,
      label: 'Status',
      graphQLPropertyName: 'status',
      value: '',
      tableMode: true,
    },
  },
];
