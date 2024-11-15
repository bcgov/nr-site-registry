// Importing the RequestStatus type from the '../inputControl/RequestStatus' module
import { RequestStatus } from '../inputControl/RequestStatus';

// Defining an interface for the widget component's props
export interface IWidget {
  // Optional title for the widget
  title?: string;
  
  // Status of the table loading process, using the RequestStatus type
  tableIsLoading?: RequestStatus;
  
  // Array of columns to define the structure of the table
  tableColumns?: any[];
  
  // Array of data to populate the table
  tableData?: any[];
  
  // Optional CSS class for custom styling of the label
  customLabelCss?: string;
  
  // Optional CSS class for custom styling of the widget container
  customWidgetContainerCss?: string;
  
  // Optional CSS class for custom styling of the widget table container
  customWidgetTableContainerCss?: string;
  
  // Optional children components that can be passed to the widget (React elements)
  children?: React.ReactNode;
  
  // Boolean flag to allow selection of rows in the table
  allowRowsSelect?: boolean;
  
  // Boolean flag to hide the table (useful for conditional rendering)
  hideTable?: boolean;
  
  // Boolean flag to hide the title of the widget
  hideTitle?: boolean;
  
  // Boolean flag to enable edit mode for the widget
  editMode?: boolean;
  
  // Boolean flag to enable screen reader mode for accessibility
  srMode?: boolean;
  
  // Current page number for pagination purposes
  currentPage?: number;
  
  // The name of the primary key column in the table (used for identifying unique rows)
  primaryKeycolumnName?: string;
  
  // Optional event handler for change events (e.g., form inputs or widget changes)
  changeHandler?: (event: any) => void;
  
  // Optional event handler for checkbox change events
  handleCheckBoxChange?: (event: any) => void;
  
  // Optional sorting handler to manage sorting of table rows
  sortHandler?: (row: any, ascSort: boolean) => void;
  
  // Boolean flag to show page options (e.g., for pagination controls)
  showPageOptions?: boolean;
}
