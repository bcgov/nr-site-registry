import { ReactNode } from "react";  // Importing ReactNode for custom components and elements

// Define the structure for individual language items
export interface ILanguage {
    key: string;  // Unique key for each language (e.g., "en", "fr", etc.)
    value: string;  // Display name of the language (e.g., "English", "French", etc.)
}

// Interface defining the props (input properties) for the LanguageSwitcher component
export interface ILanguageSwitcherProps {
    languages: ILanguage[]; // List of available languages, where each language is represented by an object with 'key' and 'value'
    defaultLanguage: string; // The key of the default language to be displayed initially
    onLanguageChange?: (language: string) => void; // Optional callback function that is triggered when the user selects a new language
    customToggleIcon?: ReactNode;  // Optional custom icon for the language switcher button
    customToggleCss?: string; // Optional custom CSS class for the toggle button
    customToggleIconCss?: string; // Optional custom CSS class for the toggle icon (if a custom icon is provided)
    customTickIconCss?: string;  // Optional custom CSS class for the tick icon (e.g., the icon that appears next to the selected language)
    customTickIcon?: ReactNode;   // Optional custom tick icon (e.g., the icon displayed next to the selected language)
    customPlaceholderText?: string;  // Optional custom text for the language placeholder (default text if no language is selected)
    customPlaceholderTextCss?: string;  // Optional custom CSS for the placeholder text
    customMenuCss?: string;  // Optional custom CSS for the dropdown menu where the languages are listed
    customMenu?: ReactNode;  // Optional custom menu component to replace the default language list dropdown
    customMenuItemCss?: string; // Optional custom CSS for individual menu items in the dropdown
    customDropdownIcon?:ReactNode;
    customOnSelectLangIcon?:ReactNode;
}
