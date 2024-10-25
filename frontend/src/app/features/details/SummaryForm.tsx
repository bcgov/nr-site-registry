import React, { FC, useState } from 'react';
import {
  FormFieldType,
  IFormField,
} from '../../components/input-controls/IFormField';
import Form from '../../components/form/Form';
import { Sites } from '../site/dto/Site';
import './SummaryForm.css';

interface SummaryFormProps {
  sitesDetails: Sites;
  edit: boolean;
  srMode: boolean;
  changeHandler: (
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => void;
}

const SummaryForm: FC<SummaryFormProps> = ({
  sitesDetails,
  edit,
  srMode,
  changeHandler,
}) => {
  const formRows: IFormField[][] = [
    [
      {
        type: FormFieldType.Text,
        label: 'Site ID',
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: 'id',
        value: '',
        validation: {
          pattern: /^[0-9,\s]*$/,
          customMessage: 'Site ID can only contain numbers and commas',
        },
        allowNumbersOnly: true,
        colSize: 'col-lg-6 col-md-6 col-sm-12',
        customLabelCss: 'custom-summary-lbl-text',
        customInputTextCss: 'custom-summary-input-text',
      },
    ],
    [
      {
        type: FormFieldType.Group,
        label: 'Latitude (D, M, S)',
        value: '',
        isChildLabel: true,
        children: [
          {
            type: FormFieldType.Text,
            label: 'Degree',
            placeholder: 'Deg',
            graphQLPropertyName: 'latDegrees',
            value: '',
            suffix: 'd ',
            validation: {
              pattern: /^[0-9.\s]*$/,
              customMessage:
                'Latitude Degrees can only contain numbers and decimal points',
            },
            allowNumbersOnly: true,
            customLabelCss: 'custom-summary-lbl-text',
            customInputTextCss: 'custom-summary-input-text',
          },
          {
            type: FormFieldType.Text,
            label: 'Minutes',
            placeholder: 'Min',
            graphQLPropertyName: 'latMinutes',
            value: '',
            suffix: 'm ',
            validation: {
              pattern: /^[0-9.\s]*$/,
              customMessage:
                'Latitude Minutes can only contain numbers and decimal points',
            },
            allowNumbersOnly: true,
            customLabelCss: 'custom-summary-lbl-text',
            customInputTextCss: 'custom-summary-input-text',
          },
          {
            type: FormFieldType.Text,
            label: 'Seconds',
            placeholder: 'Sec',
            graphQLPropertyName: 'latSeconds',
            value: '',
            suffix: 's ',
            validation: {
              pattern: /^[0-9.\s]*$/,
              customMessage:
                'Latitude Seconds can only contain numbers and decimal points',
            },
            allowNumbersOnly: true,
            customLabelCss: 'custom-summary-lbl-text',
            customInputTextCss: 'custom-summary-input-text',
          },
        ],
      },

      {
        type: FormFieldType.Group,
        label: 'Longitude (D, M, S)',
        value: '',
        isChildLabel: true,
        children: [
          {
            type: FormFieldType.Text,
            label: 'Degree',
            placeholder: 'Deg',
            graphQLPropertyName: 'longDegrees',
            value: '',
            suffix: 'd ',
            validation: {
              pattern: /^[0-9.\s]*$/,
              customMessage:
                'Longitude Degrees can only contain numbers and decimal points',
            },
            allowNumbersOnly: true,
            customLabelCss: 'custom-summary-lbl-text',
            customInputTextCss: 'custom-summary-input-text',
          },
          {
            type: FormFieldType.Text,
            label: 'Minutes',
            placeholder: 'Min',
            graphQLPropertyName: 'longMinutes',
            suffix: 'm ',
            value: '',
            validation: {
              pattern: /^[0-9.\s]*$/,
              customMessage:
                'Longitude Minutes can only contain numbers and decimal points',
            },
            allowNumbersOnly: true,
          },
          {
            type: FormFieldType.Text,
            label: 'Seconds',
            placeholder: 'Sec',
            graphQLPropertyName: 'longSeconds',
            suffix: 's ',
            value: '',
            validation: {
              pattern: /^[0-9.\s]*$/,
              customMessage:
                'Longitude Seconds can only contain numbers and decimal points',
            },
            allowNumbersOnly: true,
          },
        ],
      },
    ],
    [
      {
        type: FormFieldType.Text,
        label: 'Site Address',
        placeholder: 'Site Address',
        graphQLPropertyName: 'addrLine_1',
        value: sitesDetails?.address,
        customLabelCss: 'custom-summary-lbl-text',
        customInputTextCss: 'custom-summary-input-text',
      },
      {
        type: FormFieldType.Text,
        label: 'Region',
        placeholder: 'Region',
        graphQLPropertyName: 'region',
        value: '',
        customLabelCss: 'custom-summary-lbl-text',
        customInputTextCss: 'custom-summary-input-text',
      },
    ],
    [
      {
        type: FormFieldType.Text,
        label: 'Common Name',
        placeholder: 'Common Name',
        graphQLPropertyName: 'commonName',
        value: '',
        customLabelCss: 'custom-summary-lbl-text',
        customInputTextCss: 'custom-summary-input-text',
      },
    ],
    [
      {
        type: FormFieldType.Text,
        label: 'Location Description',
        placeholder: 'Location Description',
        graphQLPropertyName: 'generalDescription',
        value: '',
        customLabelCss: 'custom-summary-lbl-text',
        customInputTextCss: 'custom-summary-input-text',
      },
    ],
    [
      {
        type: FormFieldType.Text,
        label: 'Site Risk Classification',
        placeholder: 'Site Risk Classification',
        graphQLPropertyName: 'siteRiskCode',
        value: '',
        customLabelCss: 'custom-summary-lbl-text',
        customInputTextCss: 'custom-summary-input-text',
      },
    ],
  ];

  const [formData, setFormData] = useState<{
    [key: string]: any | [Date, Date];
  }>({});

  return (
    <form onSubmit={() => {}}>
      <Form
        editMode={edit}
        srMode={srMode}
        formRows={formRows}
        formData={sitesDetails}
        handleInputChange={changeHandler}
      />
    </form>
  );
};

export default SummaryForm;
