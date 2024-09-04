import { useSelector } from 'react-redux';
import {
  FormFieldType,
  IFormField,
} from '../../../components/input-controls/IFormField';
import { participantNameDrpdown } from '../dropdowns/DropdownSlice';

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
      },
    ],
    [
      {
        type: FormFieldType.DropDownWithSearch,
        label: 'Author',
        placeholder: 'Author....',
        graphQLPropertyName: 'psnorgId',
        options: [],
        value: '',
        colSize: 'col-lg-6 col-md-12 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss: 'custom-document-edit-input-text ',
        customPlaceholderCss: 'custom-document-search-placeholder',
      },
      {
        type: FormFieldType.Date,
        label: 'Document Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'documentDate',
        value: '',
        colSize: 'col-lg-3 col-md-6 col-sm-12',
        customLabelCss: 'custom-docuemnt-lbl-text',
        customEditLabelCss: 'custom-docuemnt-lbl-text',
        customInputTextCss: 'custom-document-input-text',
        customEditInputTextCss:
          'custom-document-edit-input-text .rs-input .rs-input-group-addon',
      },
      {
        type: FormFieldType.Date,
        label: 'Received Date',
        placeholder: 'MM/DD/YY',
        graphQLPropertyName: 'submissionDate',
        value: '',
        isDisabled: true,
        colSize: 'col-lg-3 col-md-6 col-sm-12',
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
