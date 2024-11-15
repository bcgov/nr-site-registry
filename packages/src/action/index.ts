// Export the default export from './Actions' as a named export 'Actions'
// This allows importing it either as a named or default import in other files
export { default as Actions } from './Actions';

// Export the types 'DropdownItem' and 'IActions' from './IActions'.
// This makes the types available for type-checking when using the 'Actions' component in other files.
export type { DropdownItem, IActions } from './IActions';

// Import the default export 'Actions' from './Actions' and assign it to the variable 'Actions'.
// This is essentially importing the component to use or re-export it within this file.
import Actions from './Actions';

// Default export the 'Actions' component.
// This ensures that the 'Actions' component can be imported using the default import syntax in other files.
export default Actions;
