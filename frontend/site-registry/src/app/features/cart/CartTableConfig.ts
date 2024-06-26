import { FormFieldType } from "../../components/input-controls/IFormField";
import { TableColumn } from "../../components/table/TableColumn";

const getLinkColumnType = (label:string, propertyName:string, value:string, href:string) =>
    {
      return   {
        type: FormFieldType.Link,
        label: label,       
        graphQLPropertyName: propertyName,
        value:value,      
        customLabelCss: "link-for-table",
        customInputTextCss: "link-for-table",
        tableMode: true,
        href: href
      }
    }

export const CartTableColumns: TableColumn[] = [
    {
      id: 1,
      displayName: "Site ID",
      active: true,
      graphQLPropertyName: "notation",
      displayType: {
        type: FormFieldType.Label,
        label: "Site ID",
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: "id",
        value: "",
        validation: {        
        },
        allowNumbersOnly: true,
        colSize: "col-lg-6 col-md-6 col-sm-12",
        customLabelCss: "custom-lbl-text",
        customInputTextCss: "custom-input-text",
        tableMode: true,
      },
    },
    {
      id: 2,
      displayName: "Site Address",
      active: true,
      graphQLPropertyName: "participants",
      displayType: {
        type: FormFieldType.Label,
        label: "Site ID",
        placeholder: 'Separate IDs by a comma (",")',
        graphQLPropertyName: "id",
        value: "",
        validation: {
        },
        allowNumbersOnly: true,
        colSize: "col-lg-6 col-md-6 col-sm-12",
        customLabelCss: "custom-lbl-text",
        customInputTextCss: "custom-input-text",
        tableMode: true,
      },
    },
    {
        id: 2,
        displayName: "City",
        active: true,
        graphQLPropertyName: "participants",
        displayType: {
          type: FormFieldType.Label,
          label: "Site ID",
          placeholder: 'Separate IDs by a comma (",")',
          graphQLPropertyName: "id",
          value: "",
          validation: {
          },
          allowNumbersOnly: true,
          colSize: "col-lg-6 col-md-6 col-sm-12",
          customLabelCss: "custom-lbl-text",
          customInputTextCss: "custom-input-text",
          tableMode: true,
        },
      },
      {
        id: 2,
        displayName: "Price",
        active: true,
        graphQLPropertyName: "participants",
        displayType: {
          type: FormFieldType.Label,
          label: "Site ID",
          placeholder: 'Separate IDs by a comma (",")',
          graphQLPropertyName: "id",
          value: "",
          validation: {
          },
          allowNumbersOnly: true,
          colSize: "col-lg-6 col-md-6 col-sm-12",
          customLabelCss: "custom-lbl-text",
          customInputTextCss: "custom-input-text",
          tableMode: true,
        },
      },
      new TableColumn(
        17,
        "View",
        true,
        "id",
        4,
        true,
        true,
        1,
        true,
        getLinkColumnType("Map","id","","site/map/") ,
        "site/map/",
        true
      ),
      new TableColumn(
        18,
        "Details",
        true,
        "id",
        4,
        true,
        true,
        1,
        true,
        getLinkColumnType("Details","id","","site/details/"),
        "site/details/",      
        true,      
      ),

  ];


