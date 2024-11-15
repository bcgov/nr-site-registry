// Import necessary types and components
import { IActions } from './IActions'; // Interface that defines the expected props for the Actions component
// Import Dropdown component from react-bootstrap
import Dropdown from 'react-bootstrap/Dropdown';
// Import the CSS specific to this component
import './Actions.css';

// Actions component definition: renders a customizable dropdown menu
const Actions: React.FC<IActions> = ({
  label, // Label to display on the dropdown button
  items, // List of items to display in the dropdown menu
  disable, // Boolean to disable the dropdown toggle button
  customCssMenu, // Optional custom CSS class for the dropdown menu
  customCssMenuItem, // Optional custom CSS class for each item in the dropdown menu
  customCssToggleBtn, // Optional custom CSS class for the dropdown toggle button
  customDropdownIcon, // Optional custom icon to display beside the dropdown label
  onItemClick, // Callback function to handle item click events
}) => {
  return (
    <Dropdown> {/* Dropdown component from react-bootstrap to create the dropdown menu */}
      {/* Dropdown toggle button: when clicked, it opens the dropdown menu */}
      <Dropdown.Toggle
        variant="" // No specific styling variant for the button
        id="dropdown-action" // Unique ID for the dropdown button
        className={`${customCssToggleBtn ?? 'custom-action-btn'} d-flex align-items-center gap-1`} // Apply custom CSS class or default 'custom-action-btn', along with flex classes for layout
        disabled={disable} // If 'disable' is true, the button is disabled
      >
        {label} {/* Display the label for the button */}
        {/* Conditionally render a custom dropdown icon if provided */}
        {customDropdownIcon && customDropdownIcon}
      </Dropdown.Toggle>

      {/* Dropdown menu: displays the list of items */}
      <Dropdown.Menu
        className={`${customCssMenu ?? 'custom-action-menu'}`} // Apply custom CSS class or default 'custom-action-menu'
        align={'end'} // Align the menu to the right side of the button
      >
        {/* Map over 'items' array to render each item as a dropdown item */}
        {items.map((item, index) => (
          <Dropdown.Item
            key={index} // Key for each dropdown item to ensure proper rendering
            onClick={() => onItemClick(item.value, index)} // Handle item click and pass the item value and index to the callback
            className={`disable ${customCssMenuItem ?? 'custom-action-item'}`} // Apply custom CSS class or default 'custom-action-item'
          >
            {item.label} {/* Display the label for each item */}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Export the Actions component as the default export
export default Actions;

// Alternatively, you could export the component as a named export (commented out here)
// export { Actions };
