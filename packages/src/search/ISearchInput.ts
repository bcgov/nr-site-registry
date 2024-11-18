// Importing the ReactNode type from React to use for React component props
import { ReactNode } from 'react';

// Interface defining the expected properties for the SearchInput component
export interface ISearchInput {
  // Optional label to display next to the input field
  label?: string;

  // The current search term entered by the user
  searchTerm: string;

  // Handler function to manage changes to the search term input
  handleSearchChange: (event: any) => void;

  // Function to clear the current search term
  clearSearch: () => void;

  // Optional list of options to display in a dropdown or suggestions
  options?: string[];

  // Optional handler function for selecting an option from the dropdown
  optionSelectHandler?: (event: any) => void;

  // Optional label for creating a new item (e.g., a button text)
  createNewLabel?: string;

  // Optional handler for creating a new item when the user triggers the action
  createNewHandler?: (event: any) => void;

  // Optional placeholder text to show inside the search input field when empty
  placeHolderText?: string;

  // Optional custom left icon (e.g., a search icon) to display inside the input field
  customLeftIcon?: ReactNode;

  // Optional custom right icon (e.g., a clear icon) to display inside the input field
  customRightIcon?: ReactNode;
}
