// Import ReactNode from react to support any type of React element as part of the props
import { ReactNode } from 'react';
import { ButtonSize, ButtonVariant } from '../button/Button';

// Interface for individual dropdown items
export interface DropdownItem {
  // The label to display for the dropdown item (string)
  label: string;

  // The value associated with the dropdown item (can be any data type)
  value: any;
}

// Interface for the props expected by the Actions component
export interface IActions {
  // The label to display on the dropdown button
  label: string;

  // An array of DropdownItem objects that will be displayed as the menu items
  items: DropdownItem[];

  // Optional: Boolean to disable the dropdown button
  disable?: boolean;

  // Optional: Custom CSS class for the dropdown toggle button
  customCssToggleBtn?: string;

  // Optional: Custom CSS class for the dropdown menu
  customCssMenu?: string;

  // Optional: Custom CSS class for each dropdown menu item
  customCssMenuItem?: string;

  // Optional: Custom React element (e.g., an icon) to be displayed next to the label in the dropdown toggle button
  customDropdownIcon?: ReactNode;

  // Callback function to handle the click event of a dropdown item
  // It receives the value of the clicked item and optionally its index
  onItemClick: (value: string, index?: any) => void;
  toggleButtonVariant?: ButtonVariant;
  toggleButtonSize?: ButtonSize;
}
