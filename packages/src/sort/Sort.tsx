// Importing the Form component from another module. This is likely a reusable form component used to build the sorting interface.
import Form from '../form/Form';

// Importing the ISort interface which defines the types for the props that the Sort component will accept.
import { ISort } from './ISort';

// Importing a configuration for sorting. `notationSortBy` is likely an array of form rows used to set up the form UI for sorting.
import { notationSortBy } from './SortConfig';

// Defining the Sort component as a functional component using TypeScript and React
const Sort: React.FC<ISort> = ({
  formRows,          // Prop for the form rows, which define the structure of the sorting form
  formData,          // Prop for the data to be used in the form (or table) that will be sorted
  editMode,          // Prop indicating whether the form is in "edit mode" (can the user edit the sorting?)
  handleSortChange,  // Prop for the function that will handle changes to the sort configuration
}) => {
  return (
    // Rendering the Form component. The Form component is passed various props for configuration.
    <Form
      // `formRows` is either the rows passed in from the parent (via props) or the default `notationSortBy` configuration.
      // `notationSortBy` is used when no form rows are provided.
      formRows={formRows ?? notationSortBy}  // Default value is `notationSortBy` from `SortConfig`, if no rows are passed

      // Passing the formData, which contains the data to be sorted (like a table or list of items).
      formData={formData}

      // Passing the `editMode` prop, which determines whether the user can modify the sorting configuration.
      // This will likely control whether the form fields are editable or read-only.
      editMode={editMode}

      // Passing the `handleSortChange` function to the Form component, which will be invoked when the user changes the sorting.
      handleInputChange={handleSortChange}

      // Setting the `aria-label` for accessibility purposes. This is important for screen readers to identify the purpose of this form.
      aria-label="Sort By Form"
    />
  );
};

// Exporting the Sort component to be used in other parts of the application.
export default Sort;
