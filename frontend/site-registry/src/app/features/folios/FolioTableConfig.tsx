import { FillEye, FolderIcon, RegFloppyDisk } from "../../components/common/icon";
import { FormFieldType, IFormField } from "../../components/input-controls/IFormField";
import { ColumnSize, TableColumn } from "../../components/table/TableColumn";


const getLinkColumnType = (
  label: string,
  propertyName: string,
  value: string,
  href: string,
  customLabel: string
): IFormField => {
  return {
    type: FormFieldType.Link,
    label: label,
    graphQLPropertyName: propertyName,
    value: value,
    customLabelCss: "link-for-table",
    customInputTextCss: "link-for-table",
    tableMode: true,
    href: href,
    customLinkValue: customLabel
  };
};

const getColumnType = (label: string, propertyName: string, value: string) : IFormField => {
  return {
    type: FormFieldType.Label,
    label: label,
    graphQLPropertyName: propertyName,
    value: value,
    customLabelCss: "custom-lbl-text",
    customInputTextCss: "custom-input-text",
    tableMode: true,
  };
};

export const FolioTableColumns: TableColumn[] = [
  {
    id: 1,
    displayName: "Folio Name",
    active: true,
    graphQLPropertyName: "folioId",
    displayType: {
      type: FormFieldType.Text,
      label: 'View',       
      graphQLPropertyName: 'folioId',
      value:'',      
     
      // customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: '',       
    },
    columnSize: ColumnSize.Small
  },
  {
    id: 2,
    displayName: "Description",
    active: true,
    graphQLPropertyName: "description",
    displayType: {
      label: "",
      type: FormFieldType.Text,
      tableMode:true,
       graphQLPropertyName: "description"
  },
    columnSize: ColumnSize.Triple
  },
  {
    id: 2,
    displayName: "Last Updated",
    active: true,
    graphQLPropertyName: "whenUpdated",
    displayType: {
      label: "",
      type: FormFieldType.Text,
      tableMode:true,
      graphQLPropertyName: "whenUpdated"
  },
  columnSize: ColumnSize.Small
  }, 
  // {
  //   id: 1,
  //   displayName: "",
  //   active: true,
  //   graphQLPropertyName: "id",
  //   displayType: getLinkColumnType("Details","","","","View"),
  //   columnSize: ColumnSize.Small
  // },
  {
    id: 6,
    displayName: "Actions",
    active: true,
    graphQLPropertyName: "id",
    displayType: {
      type: FormFieldType.Link,
      label: 'View',       
      graphQLPropertyName: 'id',
      value:'',      
      customLinkValue:'View',      
      customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: '',
      customIcon: <FillEye/> ,      
    },
    linkRedirectionURL: '',
  },
  // {
  //   id: 6,
  //   displayName: "Actions",
  //   active: true,
  //   graphQLPropertyName: "id",
  //   displayType: {
  //     type: FormFieldType.IconButton,
  //     label: 'Save',       
  //     graphQLPropertyName: 'save',
  //     value:'',      
  //     customLinkValue:'Save',      
  //     customInputTextCss: "custom-dashboard-link",
  //     tableMode: true,
  //     href: '',
  //     customIcon: <FolderIcon/> ,      
  //   },
  //   linkRedirectionURL: '',
  // },
];
