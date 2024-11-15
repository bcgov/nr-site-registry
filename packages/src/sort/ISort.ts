// Importing the IFormField interface from another module, which is used for form field definitions
import { IFormField } from '../inputControl/IFormField';

// Defining the interface ISort, which is used to describe the props for sorting functionality
export interface ISort {
  
  // Boolean flag to indicate whether the widget is in edit mode. 
  // If true, sorting functionality may allow modification.
  editMode: boolean;

  // `formData` holds the data used in the form (or table) that the sort functionality will act on.
  formData: any;

  // `formRows` is an optional property. 
  // It's a 2D array of `IFormField` objects, representing rows in a form or table.
  // Each row may contain multiple form fields.
  formRows?: IFormField[][];

  // `handleSortChange` is a callback function that will be triggered when the sorting changes.
  // It receives two parameters:
  // 1. `graphQLPropertyName` - The property name from a GraphQL query that the sorting is applied to.
  // 2. `value` - The new value for the sort. It can be either a single string (for a simple sort) 
  //    or a tuple representing a date range (for sorting by date).
  handleSortChange: (
    graphQLPropertyName: any,   // Name of the property to sort by (likely a GraphQL field name)
    value: string | [Date, Date],  // Sort value, either a string or a date range
  ) => void;
}
