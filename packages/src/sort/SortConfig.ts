// Importing `FormFieldType` and `IFormField` from the '../inputControl/IFormField' module
// `FormFieldType` is likely an enum that defines the types of form fields (e.g., dropdowns, text fields, etc.)
// `IFormField` is an interface used to describe the properties of each form field.
import { FormFieldType, IFormField } from '../inputControl/IFormField';

// Defining `notationSortBy` as an array of form field rows. 
// Each element of the array represents a row of form fields (in this case, a single row).
// This array contains the field configurations for sorting options.
export const notationSortBy: IFormField[][] = [
  [
    {
      // Defining the first form field in the row, which is a dropdown for selecting a sorting option.
      type: FormFieldType.DropDown,  // The field type is a dropdown (using the `FormFieldType` enum).
      label: 'Sort By',              // The label that will be displayed for the field.
      placeholder: 'Sort by',        // The placeholder text shown when the field is empty.
      graphQLPropertyName: 'sortBy', // The property name used for GraphQL queries related to sorting.
      
      // The options available in the dropdown. These options define the sorting order.
      options: [
        { key: 'newToOld', value: 'Newest to Oldest' }, // Option to sort from newest to oldest.
        { key: 'oldTonew', value: 'Oldest to Newest' }, // Option to sort from oldest to newest.
      ],
      
      // The default value of the field (initially empty).
      value: '',

      // The CSS classes used to define the column size for responsive layouts.
      // This ensures the form field takes up the full width of the container on all screen sizes.
      colSize: 'col-lg-12 col-md-12 col-sm-12',
    },
  ],
];
