import { FormFieldType, IFormField } from "../../components/input-controls/IFormField";
import { TableColumn } from "../../components/table/TableColumn";

const getLinkColumnType = (
  label: string,
  propertyName: string,
  value: string,
  href: string
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

export const CartTableColumns: TableColumn[] = [
  {
    id: 1,
    displayName: "Site ID",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: getColumnType("Site ID","siteId","")
  },
  {
    id: 2,
    displayName: "Site Address",
    active: true,
    graphQLPropertyName: "addrLine_1,addrLine_2,addrLine_3",
    displayType: getColumnType(
      "Site Address",
      "addrLine_1,addrLine_2,addrLine_3",
      ""
    ),
  },
  {
    id: 2,
    displayName: "City",
    active: true,
    graphQLPropertyName: "city",
    displayType: getColumnType("City", "city", ""),
  },
  {
    id: 2,
    displayName: "Price",
    active: true,
    graphQLPropertyName: "price",
    displayType: getColumnType("Price", "price", ""),
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
    getLinkColumnType("Map", "id", "", "site/map/"),
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
    getLinkColumnType("Details", "id", "", "site/details/"),
    "site/details/",
    true
  ),
  new TableColumn(
    18,
    "Actions",
    true,
    "id",
    4,
    true,
    true,
    1,
    true,
    {
      type : FormFieldType.DeleteIcon,
      label: "",
      graphQLPropertyName: "id",
      value: "",
      customLabelCss: "link-for-table",
      customInputTextCss: "link-for-table",
      tableMode: true,    
    },
    "site/details/",
    true
  ),
];
