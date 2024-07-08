import { FillEye, FillPinMapFill } from "../../components/common/icon";
import { FormFieldType, IFormField } from "../../components/input-controls/IFormField";
import { ColumnSize,  TableColumn } from "../../components/table/TableColumn";



const getColumnType = (label:string, propertyName:string, value:string) : IFormField =>
  {
    return   {
      type: FormFieldType.Label,
      label: label,       
      graphQLPropertyName: propertyName,
      value:value,      
      customLabelCss: "custom-lbl-text",
      customInputTextCss: "custom-input-text",
      tableMode: true,
    }
  }
  
  const getLinkColumnType = (label:string, propertyName:string, value:string, href:string) : IFormField =>
    {
      return   {
        type: FormFieldType.Link,
        label: label,       
        graphQLPropertyName: propertyName,
        value:value,      
        customLabelCss: "custom-lbl-text",
        customInputTextCss: "custom-input-text",
        tableMode: true,
        href: href
      }
    }
  


export const recentViewedColumns: TableColumn[] = [
  {
    id: 1,
    displayName: "Site ID",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Site ID',       
      graphQLPropertyName: 'siteId',
      value:'',
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
      href: 'site/details/',
    },
    linkRedirectionURL: 'site/details/',
  },
  {
    id: 2,
    displayName: "Site Address",
    active: true,
    graphQLPropertyName: "address",
    displayType: {
      type: FormFieldType.Label,
      label: 'Site Address',       
      graphQLPropertyName: 'address',
      value:'',      
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
  },
  {
    id: 3,
    displayName: "City",
    active: true,
    graphQLPropertyName: "city",
    displayType: {
      type: FormFieldType.Label,
      label: 'City',       
      graphQLPropertyName: 'city',
      value:'',      
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
  },
  {
    id: 4,
    displayName: "General Description",
    active: true,
    graphQLPropertyName: "generalDescription",
    displayType: {
      type: FormFieldType.Label,
      label: 'General Description',       
      graphQLPropertyName: 'generalDescription',
      value:'',      
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
    columnSize: ColumnSize.Triple
  },
  {
    id: 5,
    displayName: "Last Updates",
    active: true,
    graphQLPropertyName: "whenUpdated",
    displayType: {
      type: FormFieldType.Date,
      graphQLPropertyName: "whenUpdated",
      label: '',
      placeholder: 'MM/DD/YY',
      value:'',
      colSize: "col-lg-6 col-md-6 col-sm-12",
      customInputTextCss:'custom-dashboard-input-txt',
      tableMode:true,
  }
  },
  {
    id: 6,
    displayName: "Map",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Map',       
      graphQLPropertyName: 'siteId',
      value:'',      
      customLinkValue:'View',      
      customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: 'site/map/',
      customIcon: <FillPinMapFill/>,
    },
    linkRedirectionURL: 'site/map/',
  },
  {
    id: 7,
    displayName: "Details",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Details',       
      graphQLPropertyName: 'siteId',
      value:'',    
      customLinkValue:'View',
      customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: 'site/details/',
      customIcon: <FillEye/>,
    },
    linkRedirectionURL: 'site/details/',
  },
 
];

export const recentFoliosColumns: TableColumn[] = [
  {
    id: 1,
    displayName: "Folio ID",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Folio ID',       
      graphQLPropertyName: 'siteId',
      value:'',
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    }
  },
  {
    id: 2,
    displayName: "Description",
    active: true,
    graphQLPropertyName: "address",
    displayType: {
      type: FormFieldType.Link,
      label: 'Description',       
      graphQLPropertyName: 'address',
      value:'',
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
    columnSize: ColumnSize.Triple
  },
  {
    id: 3,
    displayName: "Last Modified",
    active: true,
    graphQLPropertyName: "whenUpdated",
    displayType: {
      type: FormFieldType.Date,
      graphQLPropertyName: "whenUpdated",
      label: '',
      placeholder: 'MM/DD/YY',
      value:'',
      colSize: "col-lg-6 col-md-6 col-sm-12",
      customInputTextCss:'custom-participant-input-text',
      tableMode:true,
  }
  },
  {
    id: 4,
    displayName: "Details",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Details',       
      graphQLPropertyName: 'siteId',
      value:'',      
      customLinkValue:'View',      
      customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: 'site/details/',
      customIcon: <FillEye/>,
    },
    linkRedirectionURL: 'site/details/',
  },
];

export const recentAssignedColumn: TableColumn[] = [
  {
    id: 1,
    displayName: "Site ID",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Site ID',       
      graphQLPropertyName: 'siteId',
      value:'',
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
      href: 'site/details/'
    },
    linkRedirectionURL: 'site/details/',
  },
  {
    id: 2,
    displayName: "Site Address",
    active: true,
    graphQLPropertyName: "address",
    displayType: {
      type: FormFieldType.Label,
      label: 'Site Address',       
      graphQLPropertyName: 'address',
      value:'',      
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
  },
  {
    id: 3,
    displayName: "City",
    active: true,
    graphQLPropertyName: "city",
    displayType: {
      type: FormFieldType.Label,
      label: 'City',       
      graphQLPropertyName: 'city',
      value:'',      
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
  },
  {
    id: 4,
    displayName: "General Description",
    active: true,
    graphQLPropertyName: "generalDescription",
    displayType: {
      type: FormFieldType.Label,
      label: 'General Description',       
      graphQLPropertyName: 'generalDescription',
      value:'',      
      customInputTextCss: "custom-dashboard-input-txt",
      tableMode: true,
    },
    columnSize: ColumnSize.Triple
  },
  {
    id: 5,
    displayName: "Last Updates",
    active: true,
    graphQLPropertyName: "whenUpdated",
    displayType: {
      type: FormFieldType.Date,
      graphQLPropertyName: "whenUpdated",
      label: '',
      placeholder: 'MM/DD/YY',
      value:'',
      colSize: "col-lg-6 col-md-6 col-sm-12",
      customInputTextCss:'custom-participant-input-text',
      tableMode:true,
  }
  },
  {
    id: 6,
    displayName: "Map",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Map',       
      graphQLPropertyName: 'siteId',
      value:'',      
      customLinkValue:'View',      
      customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: 'site/map/',
      customIcon: <FillPinMapFill/>,
    },
    linkRedirectionURL: 'site/map/',
  },
  {
    id: 7,
    displayName: "Details",
    active: true,
    graphQLPropertyName: "siteId",
    displayType: {
      type: FormFieldType.Link,
      label: 'Details',       
      graphQLPropertyName: 'siteId',
      value:'',    
      customLinkValue:'View',
      customInputTextCss: "custom-dashboard-link",
      tableMode: true,
      href: 'site/details/',
      customIcon: <FillEye/>,
    },
    linkRedirectionURL: 'site/details/',
  },
];
