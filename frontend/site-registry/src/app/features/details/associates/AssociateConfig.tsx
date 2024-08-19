import { useLocation } from 'react-router-dom';
import { DropdownItem } from '../../../components/action/IActions';
import {
  CircleXMarkIcon,
  MagnifyingGlassIcon,
} from '../../../components/common/icon';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { ColumnSize, TableColumn } from '../../../components/table/TableColumn';
import { SRVisibility } from '../../../helpers/requests/srVisibility';

export const GetAssociateConfig = () => {
  const location = useLocation();
  // Get the current path
  const currentPath = location.pathname;

  // Remove the last segment from the path
  const parentPath = currentPath.split('/').slice(0, -1).join('/');

  const associateColumnInternal: TableColumn[] = [
    {
      id: 1,
      displayName: 'Site ID',
      active: true,
      graphQLPropertyName: 'siteIdAssociatedWith',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Search,
        label: 'Search',
        isLabel: false,
        graphQLPropertyName: 'siteIdAssociatedWith',
        placeholder: 'Search Site ID',
        value: '',
        options: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss: 'custom-associate-edit-input',
        customPlaceholderCss: 'custom-associate-search-placeholder',
        customRightSearchIcon: <MagnifyingGlassIcon />,
        customLeftSearchIcon: <CircleXMarkIcon />,
        customInfoMessage: null,
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers.',
        },
        allowNumbersOnly: true,
        tableMode: true,
      },
    },
    {
      id: 2,
      displayName: 'Date Noted',
      active: true,
      graphQLPropertyName: 'effectiveDate',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'effectiveDate',
        label: 'Date Noted',
        placeholder: 'Enter Date',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss:
          'custom-associate-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 3,
      displayName: 'Note',
      active: true,
      graphQLPropertyName: 'note',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.Text,
        label: 'Note',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss: 'custom-associate-edit-input',
        tableMode: true,
      },
    },
    {
      id: 4,
      displayName: 'SR',
      active: true,
      graphQLPropertyName: 'sr',
      displayType: {
        type: FormFieldType.Checkbox,
        label: 'SR',
        placeholder: '',
        graphQLPropertyName: 'sr',
        value: false,
        tableMode: true,
      },
      columnSize: ColumnSize.Default,
    },
  ];

  const associateColumnInternalSRandViewMode: TableColumn[] = [
    {
      id: 1,
      displayName: 'Site ID',
      active: true,
      graphQLPropertyName: 'siteIdAssociatedWith',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Link,
        label: 'Site ID',
        isLabel: false,
        graphQLPropertyName: 'siteIdAssociatedWith',
        placeholder: 'Search Site ID',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss: 'custom-associate-edit-input',
        tableMode: true,
        href: `${parentPath}/`,
      },
      linkRedirectionURL: `${parentPath}/`,
    },
    {
      id: 2,
      displayName: 'Date Noted',
      active: true,
      graphQLPropertyName: 'effectiveDate',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'effectiveDate',
        label: 'Date Noted',
        placeholder: 'Enter Date',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss:
          'custom-associate-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 3,
      displayName: 'Note',
      active: true,
      graphQLPropertyName: 'note',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.Text,
        label: 'Note',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss: 'custom-associate-edit-input',
        tableMode: true,
      },
    },
    {
      id: 4,
      displayName: 'SR',
      active: true,
      graphQLPropertyName: 'sr',
      displayType: {
        type: FormFieldType.Checkbox,
        label: 'SR',
        placeholder: '',
        graphQLPropertyName: 'sr',
        value: false,
        tableMode: true,
      },
      columnSize: ColumnSize.Default,
    },
  ];

  const associateColumnExternal: TableColumn[] = [
    {
      id: 1,
      displayName: 'Site ID',
      active: true,
      graphQLPropertyName: 'siteIdAssociatedWith',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Link,
        label: 'Site ID',
        isLabel: false,
        graphQLPropertyName: 'siteIdAssociatedWith',
        placeholder: 'Search Site ID',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss: 'custom-associate-edit-input',
        tableMode: true,
        href: `${parentPath}/`,
      },
      linkRedirectionURL: `${parentPath}/`,
    },
    {
      id: 2,
      displayName: 'Date Noted',
      active: true,
      graphQLPropertyName: 'effectiveDate',
      columnSize: ColumnSize.Default,
      displayType: {
        type: FormFieldType.Date,
        graphQLPropertyName: 'effectiveDate',
        label: 'Date Noted',
        placeholder: 'Enter Date',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss:
          'custom-associate-edit-input .rs.input .rs-input-group-addon',
        tableMode: true,
      },
    },
    {
      id: 3,
      displayName: 'Note',
      active: true,
      graphQLPropertyName: 'note',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.Text,
        label: 'Note',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-associate-lbl-text',
        customInputTextCss: 'custom-associate-input-text',
        customEditLabelCss: 'custom-associate-edit-label',
        customEditInputTextCss: 'custom-associate-edit-input',
        tableMode: true,
      },
    },
  ];

  const srVisibilityAssocConfig: DropdownItem[] = [
    {
      label: 'Show on SR',
      value: SRVisibility.ShowSR,
    },
    {
      label: 'Hide on SR',
      value: SRVisibility.HideSR,
    },
  ];

  return {
    associateColumnInternal,
    associateColumnInternalSRandViewMode,
    associateColumnExternal,
    srVisibilityAssocConfig,
  };
};
