// Importing ReactNode from 'react' to allow React components or elements to be passed as children.
import { ReactNode } from 'react';

// Importing a custom enum or type for request status
import { RequestStatus } from './RequestStatus';

// Enum defining the various types of form fields available.
export enum FormFieldType {
  // Input type for single-line text fields
  Text = 'text',
  
  // Input type for multi-line text areas
  TextArea = 'textarea',

  // Input type for search fields
  Search = 'search',

  // Input type for dropdown menus
  DropDown = 'dropdown',

  // Input type for dropdown menus with searchable options
  DropDownWithSearch = 'dropdownWithSearch',

  // Input type for date pickers
  Date = 'date',

  // Input type for date range pickers
  DateRange = 'daterange',

  // A group of related fields or components
  Group = 'group',

  // A label field, likely used for grouping or providing context
  Label = 'label',

  // A clickable link field
  Link = 'link',

  // A checkbox input
  Checkbox = 'checkbox',

  // Icon used to indicate deletion
  DeleteIcon = 'deleteIcon',

  // Button styled as an icon, commonly used for actions
  IconButton = 'iconbutton',
}

// Interface describing the properties of a form field.
export interface IFormField {
  // Type of the form field based on the FormFieldType enum
  type:
    | FormFieldType.Text        // Text field
    | FormFieldType.DropDown   // Dropdown field
    | FormFieldType.Date       // Date field
    | FormFieldType.Group      // Group of fields
    | FormFieldType.Label      // Label
    | FormFieldType.Link       // Link
    | FormFieldType.Checkbox   // Checkbox
    | FormFieldType.DateRange  // Date range picker
    | FormFieldType.TextArea   // Textarea
    | FormFieldType.DropDownWithSearch  // Dropdown with search
    | FormFieldType.DeleteIcon // Delete icon
    | FormFieldType.IconButton // Icon button
    | FormFieldType.Search;    // Search field
  
  // Label for the form field, typically displayed beside the input
  label: string;

  // Optional flag to indicate if the label should be displayed
  isLabel?: boolean;

  // Optional placeholder text for the input field
  placeholder?: string;

  // Optional property to define the column size in layouts (e.g., grid layout)
  colSize?: string;

  // Custom CSS class for the label
  customLabelCss?: string;

  // Custom CSS for the label when editing
  customEditLabelCss?: string;

  // Custom CSS for the input text
  customInputTextCss?: string;

  // Custom CSS for input text when editing
  customEditInputTextCss?: string;

  // Custom CSS for the placeholder text
  customPlaceholderCss?: string;

  // Custom CSS for the left icon (e.g., search icon)
  customLeftIconCss?: string;

  // Custom CSS for the right icon (e.g., clear icon)
  customRightIconCss?: string;

  // Custom CSS for error messages (e.g., validation errors)
  customErrorCss?: string;

  // Property name for the field when interacting with GraphQL
  graphQLPropertyName?: string;

  // Optional flag to only allow numbers in the input field
  allowNumbersOnly?: boolean;

  // Options for dropdowns, each option has a key-value pair, optionally with an image URL
  options?: { key: string; value: string; imageUrl?: any }[];

  // Filtered options for a dropdown, key-value pairs for display purposes
  filteredOptions?: { key: string; value: string }[];

  // Optional value for the form field (e.g., the value entered by the user)
  value?: any;

  // Custom value for the link field
  customLinkValue?: any;

  // Optional flag to indicate if the custom link value should be a prefix
  isPrefixcustomLinkValue?: boolean;

  // Custom icon for the field (e.g., a button with an icon)
  customIcon?: ReactNode;

  // Optional flag to indicate if the checkbox is checked
  isChecked?: boolean;

  // Optional flag to indicate if the field is a date range input
  isDateRange?: boolean;

  // Nested child form fields, useful for group fields
  children?: IFormField[];

  // Flag to indicate if the child fields have labels
  isChildLabel?: boolean;

  // Flag to disable the form field (prevents interaction)
  isDisabled?: boolean;

  // Optional suffix for the input value (e.g., currency symbol)
  suffix?: string;

  // Flag to indicate if the field contains an image (e.g., file upload)
  isImage?: boolean;

  // Optional loading state for the field (can be used to show loading indicators)
  isLoading?: RequestStatus;

  // Custom message to display information related to the field
  customInfoMessage?: ReactNode;

  // Custom message to display in a menu related to the field
  customMenuMessage?: ReactNode;

  // Validation rules for the field
  validation?: {
    required?: boolean;       // Whether the field is required
    minLength?: number;       // Minimum length of the input value
    maxLength?: number;       // Maximum length of the input value
    pattern?: RegExp;         // Regular expression pattern for validating the value
    customMessage?: string;   // Custom error message for validation failure
  };

  // Flag to indicate if the field should be displayed in table mode
  tableMode?: boolean;

  // Flag to make the field's column sticky in a table layout
  stickyCol?: boolean;

  // Optional hyperlink for link-type fields
  href?: string;

  // Row size for text area (i.e., how many rows the textarea should occupy)
  textAreaRow?: number;

  // Column size for text area (i.e., how many columns the textarea should span)
  textAreaColoum?: number;

  // Optional handler function for handling search events (e.g., when typing in a search field)
  handleSearch?: (event: any) => void;
}
