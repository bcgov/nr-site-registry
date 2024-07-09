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
    displayName: "Folio ID",
    active: true,
    graphQLPropertyName: "id",
    displayType: getLinkColumnType("Map", "id", "", "site/map/", "View"),
  },
  {
    id: 2,
    displayName: "Description",
    active: true,
    graphQLPropertyName: "description",
    displayType: getColumnType(
      "Site Address",
      "addrLine_1,addrLine_2,addrLine_3",
      ""
    ),
    columnSize: ColumnSize.Triple
  },
  {
    id: 2,
    displayName: "Last Updated",
    active: true,
    graphQLPropertyName: "lastUpdated",
    displayType: getColumnType("City", "city", ""),
  }, 
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
    getLinkColumnType("Details", "id", "", "site/details/", "View"),
    "site/details/",
    true
  )  
];
