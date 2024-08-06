import {
  FormFieldType,
  IFormField,
} from '../../components/input-controls/IFormField';
import { TableColumn } from '../../components/table/TableColumn';

const getLinkColumnType = (
  label: string,
  propertyName: string,
  value: string,
  href: string,
  customLabel: string,
): IFormField => {
  return {
    type: FormFieldType.Link,
    label: label,
    graphQLPropertyName: propertyName,
    value: value,
    customLabelCss: 'link-for-table',
    customInputTextCss: 'link-for-table',
    tableMode: true,
    href: href,
    customLinkValue: customLabel,
  };
};

const getColumnType = (
  label: string,
  propertyName: string,
  value: string,
): IFormField => {
  return {
    type: FormFieldType.Label,
    label: label,
    graphQLPropertyName: propertyName,
    value: value,
    customLabelCss: 'custom-lbl-text',
    customInputTextCss: 'custom-input-text',
    tableMode: true,
  };
};

export const FolioContentTableColumns: TableColumn[] = [
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
      href: '/search/site/details/',
    },
  },
  {
    id: 2,
    displayName: 'Site Address',
    active: true,
    graphQLPropertyName: 'addrLine_1,addrLine_2,addrLine_3',
    displayType: getColumnType(
      'Site Address',
      'addrLine_1,addrLine_2,addrLine_3',
      '',
    ),
  },
  {
    id: 2,
    displayName: 'City',
    active: true,
    graphQLPropertyName: 'city',
    displayType: getColumnType('City', 'city', ''),
  },
  {
    id: 2,
    displayName: 'Last Updated Date',
    active: true,
    graphQLPropertyName: 'whenUpdated',
    displayType: {
      type: FormFieldType.Label,
      label: 'Last Updated Date',
      graphQLPropertyName: 'whenUpdated',
      value: '',
      tableMode: true,
    },
  },
  {
    id: 2,
    displayName: 'Purchased',
    active: true,
    graphQLPropertyName: '',
    displayType: {
      type: FormFieldType.Label,
      label: 'Last Updated Date',
      graphQLPropertyName: '',
      value: '',
      tableMode: true,
    },
  },
  new TableColumn(
    17,
    'Map',
    true,
    'siteId',
    4,
    true,
    true,
    1,
    true,
    getLinkColumnType('Map', 'siteId', '', 'site/map/', 'View'),
    'site/map/',
    true,
  ),
  new TableColumn(
    18,
    'Details',
    true,
    'siteId',
    4,
    true,
    true,
    1,
    true,
    getLinkColumnType('Details', 'siteId', '', '/search/site/details/', 'View'),
    '/search/site/details/',
    true,
  ),
  // new TableColumn(
  //   18,
  //   "Actions",
  //   true,
  //   "id",
  //   4,
  //   true,
  //   true,
  //   1,
  //   true,
  //   {
  //     type : FormFieldType.DeleteIcon,
  //     label: "",
  //     graphQLPropertyName: "id",
  //     value: "",
  //     customLabelCss: "link-for-table",
  //     customInputTextCss: "link-for-table",
  //     tableMode: true,
  //   },
  //   "/search/site/details/",
  //   true
  // ),
];
