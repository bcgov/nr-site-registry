import {
  FormFieldType,
  IFormField,
} from '../../../components/input-controls/IFormField';
import { RequestStatus } from '../../../helpers/requests/status';

export const GetDocumentsConfig = () => {
  const documentFirstChildFormRows: IFormField[][] = [
    [
      {
        type: FormFieldType.TextArea,
        label: 'Document Title',
        placeholder: 'Document title...',
        graphQLPropertyName: 'title',
        value: '',
        textAreaRow: 1,
        colSize: 'col-lg-7 col-md-7 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text ',
        validation: {
          required: true,
          customMessage: 'Document Title is required.',
        },
      },
      {
        type: FormFieldType.Date,
        label: 'Document Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'documentDate',
        value: '',
        colSize:
          'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss:
          'custom-document-edit-input-text .rs-input .rs-input-group-addon',
        validation: {
          required: true,
          customMessage: 'Document Date is required.',
        },
      },
    ],
  ];

  const documentFirstChildFormRowsForExternal: IFormField[][] = [
    [
      {
        type: FormFieldType.TextArea,
        label: 'Document Title',
        placeholder: 'Document title...',
        graphQLPropertyName: 'title',
        value: '',
        textAreaRow: 1,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text',
        validation: {
          required: true,
          customMessage: 'Document Title is required.',
        },
      },
      {
        type: FormFieldType.DropDownWithSearch,
        label: 'Author',
        placeholder: 'Author....',
        graphQLPropertyName: 'psnorgId',
        options: [],
        value: '',
        colSize:
          'col-lg-3 col-md-3 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text',
        customPlaceholderCss: 'custom-document-search-placeholder',
        validation: {
          required: true,
          customMessage: 'Author is required.',
        },
      },
      {
        type: FormFieldType.Date,
        label: 'Document Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'documentDate',
        value: '',
        colSize:
          'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss:
          'custom-document-edit-input-text .rs-input .rs-input-group-addon',
        validation: {
          required: true,
          customMessage: 'Document Date is required.',
        },
      },
    ],
  ];

  const documentFormRows: IFormField[][] = [
    [
      {
        type: FormFieldType.TextArea,
        label: 'Document Title',
        placeholder: 'Document title...',
        graphQLPropertyName: 'title',
        value: '',
        textAreaRow: 1,
        colSize: 'col-lg-12 col-md-12 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text',
        validation: {
          required: true,
          customMessage: 'Document Title is required.',
        },
      },
    ],
    [
      {
        type: FormFieldType.DropDownWithSearch,
        label: 'Author',
        placeholder: 'Author....',
        graphQLPropertyName: 'psnorgId',
        value: '',
        options: [],
        filteredOptions: [],
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text ',
        customPlaceholderCss: 'custom-document-search-placeholder',
        customMenuMessage: <span>Please select site participant name:</span>,
        handleSearch: () => {},
        isLoading: RequestStatus.idle,
        validation: {
          required: true,
          customMessage: 'Author is required.',
        },
      },
      {
        type: FormFieldType.Text,
        label: 'Organization',
        placeholder: 'Organization',
        graphQLPropertyName: 'organizationName',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text ',
        isDisabled: true,
      },
    ],
    [
      {
        type: FormFieldType.Date,
        label: 'Document Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'documentDate',
        value: '',
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss:
          'custom-document-edit-input-text .rs-input .rs-input-group-addon',
        validation: {
          required: true,
          customMessage: 'Document Date is required.',
        },
      },
      {
        type: FormFieldType.Date,
        label: 'Received Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'submissionDate',
        value: '',
        isDisabled: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss:
          'custom-document-edit-input-text .rs-input .rs-input-group-addon',
      },
    ],
  ];

  return {
    documentFirstChildFormRowsForExternal,
    documentFirstChildFormRows,
    documentFormRows,
  };
};
