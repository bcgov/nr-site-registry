import { DropdownItem } from '../../../components/action/IActions';
import {
  FormFieldType,
  IFormField,
} from '../../../components/input-controls/IFormField';
import { ColumnSize, TableColumn } from '../../../components/table/TableColumn';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import { RequestStatus } from '../../../helpers/requests/status';

export const disclosureStatementConfig: IFormField[][] = [
  [
    {
      type: FormFieldType.Date,
      label: 'Date Received',
      placeholder: 'MM/DD/YY',
      graphQLPropertyName: 'siteRegDateRecd',
      value: '',
      colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss:
        'custom-disclosure-edit-input .rs-input .rs-input-group-addon',
    },
    {
      type: FormFieldType.Date,
      label: 'Date Completed',
      placeholder: 'MM/DD/YY',
      graphQLPropertyName: 'dateCompleted',
      value: '',
      colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss:
        'custom-disclosure-edit-input .rs-input .rs-input-group-addon',
    },
    {
      type: FormFieldType.Date,
      label: 'Local Authority Received',
      placeholder: 'MM/DD/YY',
      graphQLPropertyName: 'localAuthDateRecd',
      value: '',
      colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss:
        'custom-disclosure-edit-input .rs-input .rs-input-group-addon',
    },
    {
      type: FormFieldType.Date,
      label: 'Date Registrar',
      placeholder: 'MM/DD/YY',
      graphQLPropertyName: 'rwmDateDecision',
      value: '',
      colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss:
        'custom-disclosure-edit-input .rs-input .rs-input-group-addon',
    },
    {
      type: FormFieldType.Date,
      label: 'Date Entered',
      placeholder: 'MM/DD/YY',
      graphQLPropertyName: 'siteRegDateEntered',
      value: '',
      colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss:
        'custom-disclosure-edit-input .rs-input .rs-input-group-addon',
    },

    // Commenting the below method because I am not sure which dropdown type
    // we are going to use if it will be dropdown with search then uncomment the code otherwise delete it.

    // {
    //   type: FormFieldType.DropDownWithSearch,
    //   label: 'Internal Contact',
    //   isLabel: false,
    //   graphQLPropertyName: 'psnorgId',
    //   placeholder: 'Select Internal Contact.',
    //   isLoading: RequestStatus.idle,
    //   value: '',
    //   options: [],
    //   filteredOptions: [],
    //   colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
    //   customLabelCss: 'custom-disclosure-lbl-text',
    //   customInputTextCss: 'custom-disclosure-input-text',
    //   customEditLabelCss: 'custom-disclosure-edit-label',
    //   customEditInputTextCss: 'custom-disclosure-edit-input',
    //   customPlaceholderCss: 'custom-disclosure-search-placeholder',
    //   customMenuMessage: <span>Please select site participant name:</span>,
    //   handleSearch: () => {},
    // },
  ],
];

export const disclosureScheduleInternalConfig: TableColumn[] = [
  {
    id: 1,
    displayName: 'Schedule 2 Reference',
    active: true,
    graphQLPropertyName: 'reference',
    displayType: {
      type: FormFieldType.DropDown,
      label: '',
      placeholder: 'Select Schedule 2 reference.',
      graphQLPropertyName: 'reference',
      options: [
        { key: 'F1', value: 'F1*' },
        { key: 'F2', value: 'F2*' },
      ],
      value: '',
      colSize: 'col-lg-6 col-md-6 col-sm-12',
      customInputTextCss: 'custom-disclosure-input-text-tbl',
      tableMode: true,
    },
    columnSize: ColumnSize.Default,
  },
  {
    id: 2,
    displayName: 'Description',
    active: true,
    graphQLPropertyName: 'discription',
    displayType: {
      type: FormFieldType.Text,
      label: 'Description',
      isDisabled: true,
      placeholder: 'Enter Description.',
      graphQLPropertyName: 'discription',
      value: '',
      colSize: 'col-lg-6 col-md-6 col-sm-12',
      customInputTextCss: 'custom-disclosure-input-text-tbl',
      tableMode: true,
    },
    columnSize: ColumnSize.Triple,
  },
  {
    id: 3,
    displayName: 'SR',
    active: true,
    graphQLPropertyName: 'srAction',
    displayType: {
      type: FormFieldType.Checkbox,
      label: 'SR',
      placeholder: '',
      graphQLPropertyName: 'srAction',
      value: false,
      tableMode: true,
    },
    columnSize: ColumnSize.Default,
  },
];

export const disclosureScheduleExternalConfig: TableColumn[] = [
  {
    id: 1,
    displayName: 'Schedule 2 Reference',
    active: true,
    graphQLPropertyName: 'reference',
    displayType: {
      type: FormFieldType.DropDown,
      label: '',
      placeholder: 'Select Schedule 2 reference.',
      graphQLPropertyName: 'reference',
      options: [
        { key: 'F1', value: 'F1*' },
        { key: 'F2', value: 'F2*' },
      ],
      value: '',
      colSize: 'col-lg-6 col-md-6 col-sm-12',
      customInputTextCss: 'custom-disclosure-input-text-tbl',
      tableMode: true,
    },
    columnSize: ColumnSize.Default,
  },
  {
    id: 2,
    displayName: 'Description',
    active: true,
    graphQLPropertyName: 'discription',
    displayType: {
      type: FormFieldType.Text,
      label: 'Description',
      placeholder: 'Enter Description.',
      graphQLPropertyName: 'discription',
      isDisabled: true,
      value: '',
      colSize: 'col-lg-6 col-md-6 col-sm-12',
      customInputTextCss: 'custom-disclosure-input-text-tbl',
      tableMode: true,
    },
    columnSize: ColumnSize.Triple,
  },
];

export const disclosureCommentsConfig: IFormField[][] = [
  [
    {
      type: FormFieldType.TextArea,
      label:
        'Provide a brief summary of the planned activity and proposed land use at the site.',
      placeholder: 'Provide a brief summary....',
      graphQLPropertyName: 'plannedActivityComment',
      value: '',
      colSize: 'col-lg-12 col-md-12 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss: 'custom-disclosure-edit-input',
      textAreaRow: 3,
    },
  ],
  [
    {
      type: FormFieldType.TextArea,
      label:
        'Indicate the information used to complete this site disclosure statement including a list of record searches completed.',
      placeholder: 'Provide site disclosure statement....',
      graphQLPropertyName: 'siteDisclosureComment',
      value: '',
      colSize: 'col-lg-12 col-md-12 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss: 'custom-disclosure-edit-input',
      textAreaRow: 4,
    },
  ],
  [
    {
      type: FormFieldType.TextArea,
      label:
        'List any past or present government orders, permits, approvals, certificates or notifications pertaining to the environmental condition of the site.',
      placeholder: 'List goverment orders....',
      graphQLPropertyName: 'govDocumentsComment',
      value: '',
      colSize: 'col-lg-12 col-md-12 col-sm-12',
      customLabelCss: 'custom-disclosure-lbl-text',
      customInputTextCss: 'custom-disclosure-input-text',
      customEditLabelCss: 'custom-disclosure-edit-label',
      customEditInputTextCss: 'custom-disclosure-edit-input',
      textAreaRow: 1,
    },
  ],
];

export const srVisibilityConfig: DropdownItem[] = [
  {
    label: 'Show on SR',
    value: SRVisibility.ShowSR,
  },
  {
    label: 'Hide on SR',
    value: SRVisibility.HideSR,
  },
];
