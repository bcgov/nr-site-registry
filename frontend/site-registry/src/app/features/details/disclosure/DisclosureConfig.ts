import { DropdownItem } from "../../../components/action/IActions";
import { FormFieldType, IFormField } from "../../../components/input-controls/IFormField";
import { ColumnSize, TableColumn } from "../../../components/table/TableColumn";
import { SRVisibility } from "../../../helpers/requests/srVisibility";

export const disclosureStatementConfig: IFormField[][] = [
    [
        {
            type: FormFieldType.Date,
            label: 'Date Received',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName:'dateReceived',
            value: '',
            colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
        },
        {
            type: FormFieldType.Date,
            label: 'Date Completed',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName:'dateComplete',
            value: '',
            colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
        },
        {
            type: FormFieldType.Date,
            label: 'Local Authority Received',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName:'localAuthorityReceived',
            value: '',
            colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
        },
        {
            type: FormFieldType.Date,
            label: 'Date Registrar',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName:'dateRegistrar',
            value: '',
            colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
        },
        {
            type: FormFieldType.Date,
            label: 'Date Entered',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName:'dateEntered',
            value: '',
            colSize: 'col-xxl-2 col-xl-3 col-lg-4 col-md-5 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
        },
    ]
];

export const disclosureScheduleInternalConfig: TableColumn[] = [
    {
        id: 1,
        displayName: "Schedule 2 Reference",
        active: true,
        graphQLPropertyName: "reference",
        displayType:{
          type: FormFieldType.DropDown,
          label: '', 
          placeholder:'Select Schedule 2 reference.',       
          graphQLPropertyName: "reference",
          options: [
              {key:'F1', value:'F1*'},
              {key:'F2', value:'F2*'},
          ],
          value: "",
          colSize: "col-lg-6 col-md-6 col-sm-12",
          customInputTextCss: "custom-disclosure-input-text-tbl",
          tableMode: true,
         
         
        },
        columnSize: ColumnSize.Default
      },
      {
        id: 2,
        displayName: "Description",
        active: true,
        graphQLPropertyName: "discription",
        displayType:{
          type: FormFieldType.Text,
          label: "Description",
          placeholder: 'Enter Description.',
          graphQLPropertyName: "discription",
          value: "",
          colSize: "col-lg-6 col-md-6 col-sm-12",
          customInputTextCss: "custom-disclosure-input-text-tbl",
          tableMode: true,
        },
        columnSize: ColumnSize.Triple
      },
      {
        id: 3,
        displayName: "SR",
        active: true,
        graphQLPropertyName: "sr",
        displayType: {
          type: FormFieldType.Checkbox,
          label: "SR",
          placeholder: '',
          graphQLPropertyName: "sr",
          value: false,      
          tableMode: true,
        },
        columnSize: ColumnSize.Default
      },
];

export const disclosureScheduleExternalConfig: TableColumn[] = [
    {
        id: 1,
        displayName: "Schedule 2 Reference",
        active: true,
        graphQLPropertyName: "reference",
        displayType:{
          type: FormFieldType.DropDown,
          label: '', 
          placeholder:'Select Schedule 2 reference.',       
          graphQLPropertyName: "reference",
          options: [
              {key:'F1', value:'F1*'},
              {key:'F2', value:'F2*'},
          ],
          value: "",
          colSize: "col-lg-6 col-md-6 col-sm-12",
          customInputTextCss: "custom-disclosure-input-text-tbl",
          tableMode: true,
         
         
        },
        columnSize: ColumnSize.Default
      },
      {
        id: 2,
        displayName: "Description",
        active: true,
        graphQLPropertyName: "discription",
        displayType:{
          type: FormFieldType.Text,
          label: "Description",
          placeholder: 'Enter Description.',
          graphQLPropertyName: "discription",
          value: "",
          colSize: "col-lg-6 col-md-6 col-sm-12",
          customInputTextCss: "custom-disclosure-input-text-tbl",
          tableMode: true,
        },
        columnSize: ColumnSize.Triple
      },
];

export const disclosureCommentsConfig: IFormField[][] = [
    [
        {
            type: FormFieldType.TextArea,
            label: 'Provide a brief summary of the planned activity and proposed land use at the site.',
            placeholder: 'Provide a brief summary....',
            graphQLPropertyName:'summary',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
            textAreaRow:3
        },
    ],
    [
        {
            type: FormFieldType.TextArea,
            label: 'Indicate the information used to complete this site disclosure statement including a list of record searches completed.',
            placeholder: 'Provide site disclosure statement....',
            graphQLPropertyName:'statement',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
            textAreaRow:4
        },
    ],
    [
        {
            type: FormFieldType.TextArea,
            label: 'List any past or present government orders, permits, approvals, certificates or notifications pertaining to the environmental condition of the site.',
            placeholder: 'List goverment orders....',
            graphQLPropertyName:'governmentOrder',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss:'custom-disclosure-lbl-text',
            customInputTextCss:'custom-disclosure-input-text',
            customEditLabelCss:'custom-disclosure-edit-label',
            customEditInputTextCss:'custom-disclosure-edit-input',
            textAreaRow:1
        },
    ],

];

export const srVisibilityConfig: DropdownItem[] = [
  {
      label:'Show on SR',
      value: SRVisibility.ShowSR
  },
  {
      label:'Hide on SR',
      value: SRVisibility.HideSR
  },
]