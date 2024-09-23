import { DropdownItem } from '../../../components/action/IActions';
import {
  FormFieldType,
  IFormField,
} from '../../../components/input-controls/IFormField';
import { ColumnSize, TableColumn } from '../../../components/table/TableColumn';
import { SRVisibility } from '../../../helpers/requests/srVisibility';
import { RequestStatus } from '../../../helpers/requests/status';

export const GetNotationConfig = () => {
  const notationFormRowsInternal: IFormField[][] = [
    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Type',
        placeholder: 'Notation Type',
        graphQLPropertyName: 'etypCode',
        options: [],
        value: '',
        colSize: 'col-lg-5 col-md-7 col-sm-11 col-10',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
      {
        type: FormFieldType.Date,
        label: 'Initiated Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementReceivedDate',
        value: '',
        colSize: 'col-lg-3 col-md-4 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Completed Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'completionDate',
        value: '',
        colSize: 'col-lg-3 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
    ],

    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Class',
        placeholder: 'Notation Class',
        graphQLPropertyName: 'eclsCode',
        options: [],
        value: '',
        colSize: 'col-lg-5 col-md-6 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
      {
        type: FormFieldType.Date,
        label: 'Required Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementDueDate',
        value: '',
        colSize: 'col-lg-3 col-md-6 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-dateInput',
      },
      {
        type: FormFieldType.DropDown,
        label: 'Ministry Contact',
        placeholder: 'Ministry Contact',
        graphQLPropertyName: 'psnorgId',
        options: [],
        value: '',
        isImage: true,
        colSize: 'col-lg-4 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],

    [
      {
        type: FormFieldType.Text,
        label: 'Required Actions',
        placeholder: 'Required Actions',
        graphQLPropertyName: 'requiredAction',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],

    [
      {
        type: FormFieldType.Text,
        label: 'Note',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
  ];

  const notationFormRowEditMode: IFormField[][] = [
    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Type',
        placeholder: 'Notation Type',
        graphQLPropertyName: 'etypCode',
        options: [],
        value: '',
        colSize: 'col-lg-11 col-md-11 col-sm-11 col-10',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Class',
        placeholder: 'Notation Class',
        graphQLPropertyName: 'eclsCode',
        options: [],
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
    [
      {
        type: FormFieldType.Date,
        label: 'Initiated Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementReceivedDate',
        value: '',
        colSize: 'col-lg-4 col-md-4 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Required Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementDueDate',
        value: '',
        colSize: 'col-lg-4 col-md-4 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Completed Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'completionDate',
        value: '',
        colSize: 'col-lg-4 col-md-4 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
    ],
    [
      {
        type: FormFieldType.Text,
        label: 'Required Actions',
        placeholder: 'Required Actions',
        graphQLPropertyName: 'requiredAction',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
    [
      {
        type: FormFieldType.Text,
        label: 'Note',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
    [
      {
        type: FormFieldType.DropDown,
        label: 'Ministry Contact',
        placeholder: 'Ministry Contact',
        graphQLPropertyName: 'psnorgId',
        options: [],
        value: '',
        isImage: true,
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
  ];

  // When user type is External
  const notationFormRowExternal: IFormField[][] = [
    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Type',
        placeholder: 'Notation Type',
        graphQLPropertyName: 'etypCode',
        options: [],
        value: '',
        colSize: 'col-xxl-11 col-xl-11 col-lg-11 col-md-11 col-sm-11 col-xs-11',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],

    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Class',
        placeholder: 'Notation Class',
        graphQLPropertyName: 'eclsCode',
        options: [],
        value: '',
        colSize: 'col-xxl-6 col-xl-6 col-lg-12 col-md-12 col-sm-12 col-xs-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
      {
        type: FormFieldType.Date,
        label: 'Initiated Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementReceivedDate',
        value: [],
        colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xs-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Required Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementDueDate',
        value: [],
        colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xs-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Completed Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'completionDate',
        value: [],
        colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-12 col-xs-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
    ],

    [
      {
        type: FormFieldType.Text,
        label: 'Required Actions',
        placeholder: 'Required Actions',
        graphQLPropertyName: 'requiredAction',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],

    [
      {
        type: FormFieldType.Text,
        label: 'Note',
        placeholder: 'Note',
        graphQLPropertyName: 'note',
        value: '',
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
    [
      {
        type: FormFieldType.DropDown,
        label: 'Ministry Contact',
        placeholder: 'Ministry Contact',
        graphQLPropertyName: 'psnorgId',
        options: [],
        value: '',
        isImage: true,
        colSize: 'col-lg-4 col-md-6 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
    ],
  ];

  const notationFormRowsFirstChild: IFormField[][] = [
    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Type',
        placeholder: 'Notation Type',
        graphQLPropertyName: 'etypCode',
        options: [],
        value: '',
        colSize: 'col-xxl-5 col-xl-5 col-lg-8 col-md-6 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
      {
        type: FormFieldType.Date,
        label: 'Initiated Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementReceivedDate',
        value: [],
        colSize: 'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Completed Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'completionDate',
        value: [],
        colSize:
          'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
    ],
  ];

  const notationFormRowsFirstChildIsRequired: IFormField[][] = [
    [
      {
        type: FormFieldType.DropDown,
        label: 'Notation Type',
        placeholder: 'Notation Type',
        graphQLPropertyName: 'etypCode',
        options: [],
        value: '',
        colSize: 'col-xxl-5 col-xl-5 col-lg-8 col-md-6 col-sm-12',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss: 'custom-notation-edit-input',
      },
      {
        type: FormFieldType.Date,
        label: 'Initiated Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'requirementReceivedDate',
        value: [],
        colSize: 'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Completed Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'completionDate',
        value: [],
        colSize:
          'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
        customLabelCss: 'custom-notation-lbl-text',
        customInputTextCss: 'custom-notation-input-text',
        customEditLabelCss: 'custom-notation-edit-label',
        customEditInputTextCss:
          'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
      },
    ],
  ];

  const notationColumnInternal: TableColumn[] = [
    {
      id: 1,
      displayName: 'Role',
      active: true,
      graphQLPropertyName: 'eprCode',
      displayType: {
        type: FormFieldType.DropDown,
        label: 'Text',
        graphQLPropertyName: 'eprCode',
        value: '',
        options: [],
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customInputTextCss: 'custom-notation-participant-input-text',
        customEditInputTextCss: 'custom-notation-participant-input-text',
        tableMode: true,
        placeholder: 'Please select the role',
      },
      columnSize: ColumnSize.Default,
    },
    {
      id: 2,
      displayName: 'Participant Name',
      active: true,
      graphQLPropertyName: 'psnorgId',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.DropDownWithSearch,
        label: '',
        isLabel: false,
        graphQLPropertyName: 'psnorgId',
        placeholder: 'Please enter participant name.',
        value: '',
        options: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customInputTextCss: 'custom-notation-participant-input-text',
        customEditInputTextCss: 'custom-notation-participant-input-text',
        customPlaceholderCss: 'custom-notation-search-placeholder',
        tableMode: true,
        customMenuMessage: <span>Please select site participant name:</span>,
        filteredOptions: [],
        isLoading: RequestStatus.idle,
        handleSearch: () => {},
      },
    },
    {
      id: 3,
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

  const notationColumnExternal: TableColumn[] = [
    {
      id: 1,
      displayName: 'Role',
      active: true,
      graphQLPropertyName: 'eprCode',
      displayType: {
        type: FormFieldType.DropDown,
        label: 'Text',
        graphQLPropertyName: 'eprCode',
        value: '',
        options: [],
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customInputTextCss: 'custom-notation-participant-input-text',
        customEditInputTextCss: 'custom-notation-participant-input-text',
        tableMode: true,
        placeholder: 'Please select the role',
      },
      columnSize: ColumnSize.Default,
    },
    {
      id: 2,
      displayName: 'Participant Name',
      active: true,
      graphQLPropertyName: 'psnorgId',
      columnSize: ColumnSize.Triple,
      displayType: {
        type: FormFieldType.DropDownWithSearch,
        label: '',
        isLabel: false,
        graphQLPropertyName: 'psnorgId',
        placeholder: 'Please enter participant name.',
        value: '',
        options: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customInputTextCss: 'custom-notation-participant-input-text',
        customEditInputTextCss: 'custom-notation-participant-input-text',
        customPlaceholderCss: 'custom-notation-search-placeholder',
        tableMode: true,
        customMenuMessage: <span>Please select site participant name:</span>,
        filteredOptions: [],
        isLoading: RequestStatus.idle,
        // handleSearch: () => {},
      },
    },
  ];

  const srVisibilityConfig: DropdownItem[] = [
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
    notationFormRowsInternal,
    notationFormRowEditMode,
    notationFormRowExternal,
    notationFormRowsFirstChild,
    notationFormRowsFirstChildIsRequired,
    notationColumnInternal,
    notationColumnExternal,
    srVisibilityConfig,
  };
};

export default GetNotationConfig;
