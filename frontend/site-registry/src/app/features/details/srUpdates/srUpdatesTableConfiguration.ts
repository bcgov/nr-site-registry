import { FormFieldType } from "../../../components/input-controls/IFormField";
import { TableColumn } from "../../../components/table/TableColumn";

const SRUpdatesTableConfiguration: TableColumn[] = [
    {
        id:1,
        displayName: 'Date',
        graphQLPropertyName: 'whenUpdated',
        active: true,        
        displayType: {
            type: FormFieldType.Date,
            graphQLPropertyName: 'whenUpdated',
            label: 'Date',
            placeholder: 'MM/DD/YY',
            value: '',
            colSize: '',
            customInputTextCss: '',
            tableMode: true,
          }, 
    },
    {
        id:2,
        displayName: 'Updated By',
        graphQLPropertyName: 'whoUpdated',
        active: true,
        displayType: {           
            type: FormFieldType.Text,
            label: 'Updated By',
            placeholder: '',
            graphQLPropertyName: 'whoUpdated',
            value: '',           
            tableMode: true,
          }, 
    },
    {
        id:3,
        displayName: 'Site ID',
        graphQLPropertyName: 'siteId',
        active: true,
        displayType: {           
            type: FormFieldType.Link,
            label: 'Site ID',
            placeholder: '',
            graphQLPropertyName: 'siteId',
            value: '',           
            tableMode: true,
            href: '/site/details/'
          }, 
    },
    {
        id:4,
        displayName: 'Site Address',
        graphQLPropertyName: 'address',
        active: true,
        displayType: {           
            type: FormFieldType.Text,
            label: 'Site Address',
            placeholder: 'address',
            graphQLPropertyName: 'siteId',
            value: '',           
            tableMode: true,
          },
    },
    {
        id:5,
        displayName: 'Updated Fields',
        graphQLPropertyName: 'changes',
        active: true,
        displayType: {           
            type: FormFieldType.Text,
            label: 'Changes',
            placeholder: '',
            graphQLPropertyName: 'changes',
            value: '',           
            tableMode: true,
          },
    },
    {
        id:6,
        displayName: 'Actions',
        graphQLPropertyName: 'siteId',
        active: true,
        displayType: {           
            type: FormFieldType.Link,
            label: 'View',
            placeholder: '',
            graphQLPropertyName: 'siteId',
            value: '',           
            tableMode: true,
            href: '/site/details/'
          },
    }
]

export default SRUpdatesTableConfiguration;