# LanguageSwitcher

A customizable React component for language selection, allowing users to switch between different languages with support for custom icons, styling, and accessibility.

## Features

- Displays a dropdown list of available languages.
- Customizable toggle button and icons.
- Support for a default language and dynamic language change.
- Click outside to close dropdown functionality.
- Fully accessible with `aria-*` attributes.
- Customizable styles and components via props.

## Installation

To install the `LanguageSwitcher` component, you can use npm or yarn:

### npm
```bash
npm install language-switcher
```

## Usage
To use the LanguageSwitcher component in your React project, import it and pass the required props. Below is an example usage:

```tsx
import React, { useState } from 'react';
import { LanguageSwitcher } from 'language-switcher'; // Adjust the import path if needed

const languages = [
  { key: 'en', value: 'English' },
  { key: 'fr', value: 'French' },
  { key: 'es', value: 'Spanish' },
];

const MyComponent = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = (languageKey: string) => {
    setCurrentLanguage(languageKey);
    // Handle language change logic here (e.g., change language context)
  };

  return (
    <div>
      <h1>Current Language: {currentLanguage}</h1>
      <LanguageSwitcher
        languages={languages}
        defaultLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        customPlaceholderText="Select a Language"
      />
    </div>
  );
};
```

## Component Props

The `LanguageSwitcher` component accepts the following props:

| Prop                        | Type                      | Description |
|-----------------------------|---------------------------|-------------|
| `languages`                 | `ILanguage[]`             | **Required**. An array of available languages. Each language should have a `key` (language code) and `value` (language name). |
| `defaultLanguage`           | `string`                  | **Required**. The key (code) of the default language (e.g., `'en'`). This will be the initially selected language. |
| `onLanguageChange`          | `(language: string) => void` | **Optional**. A callback function that is triggered when the language changes. It receives the language key as an argument. |
| `customToggleIcon`          | `ReactNode`               | **Optional**. A custom icon component for the language toggle button. If not provided, the default icon will be used. |
| `customToggleCss`           | `string`                  | **Optional**. A custom CSS class for the toggle button. |
| `customToggleIconCss`       | `string`                  | **Optional**. A custom CSS class for the toggle icon. |
| `customTickIconCss`         | `string`                  | **Optional**. A custom CSS class for the tick icon shown next to the selected language. |
| `customTickIcon`            | `ReactNode`               | **Optional**. A custom tick icon component, which is displayed next to the selected language. |
| `customPlaceholderText`     | `string`                  | **Optional**. Custom text to display in the dropdown when no language is selected (defaults to "Please select a language"). |
| `customPlaceholderTextCss`  | `string`                  | **Optional**. A custom CSS class for the placeholder text in the dropdown. |
| `customMenuCss`             | `string`                  | **Optional**. A custom CSS class for the dropdown menu. |
| `customMenu`                | `ReactNode`               | **Optional**. A custom component or JSX to replace the default dropdown menu. |
| `customMenuItemCss`         | `string`                  | **Optional**. A custom CSS class for individual items in the dropdown menu. |

### ILanguage Type

The `languages` prop is an array of objects where each object represents a language with the following structure:

| Field     | Type    | Description |
|-----------|---------|-------------|
| `key`     | `string`| **Required**. The unique identifier (usually the language code, e.g., `'en'`). |
| `value`   | `string`| **Required**. The display name of the language (e.g., `'English'`). |

### Example

```tsx
const languages = [
  { key: 'en', value: 'English' },
  { key: 'fr', value: 'French' },
  { key: 'de', value: 'German' },
];

<LanguageSwitcher
  languages={languages}
  defaultLanguage="en"
  onLanguageChange={(languageKey) => console.log(`Language changed to: ${languageKey}`)}
  customPlaceholderText="Select a language"
  customToggleCss="my-toggle-class"
  customMenuCss="my-menu-class"
/>
```

### Explanation:

- **Props Table**: The main table lists all the props the `LanguageSwitcher` component accepts, including their types, whether they are required or optional, and a description of each one.
  
- **ILanguage Type**: Since `languages` is an array of objects, I've included an additional section explaining the structure of each object in the `languages` array. This ensures that users know the expected shape of the data.

- **Example**: An example of how to use the `LanguageSwitcher` component with different props.

This structure is clean, easy to read, and provides all necessary information for developers using or contributing to the `LanguageSwitcher` component.

## Example with Customization
You can customize the appearance and behavior of the **LanguageSwitcher** by passing custom icons, text, and CSS classes:

```tsx
import React, { useState } from 'react';
import { LanguageSwitcher } from 'language-switcher'; // Adjust the import path if needed
import { CustomDropdownIcon, CustomTickIcon } from './icons'; // Your custom icons

const languages = [
  { key: 'en', value: 'English' },
  { key: 'fr', value: 'French' },
  { key: 'de', value: 'German' },
];

const MyComponent = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = (languageKey: string) => {
    setCurrentLanguage(languageKey);
    // Additional logic for language change (e.g., updating context or locale)
  };

  return (
    <div>
      <h1>Current Language: {currentLanguage}</h1>
      <LanguageSwitcher
        languages={languages}
        defaultLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        customToggleIcon={<CustomDropdownIcon />}
        customTickIcon={<CustomTickIcon />}
        customToggleCss="custom-toggle"
        customMenuCss="custom-menu"
        customMenuItemCss="custom-item"
        customPlaceholderText="Select a language"
      />
    </div>
  );
};
```

## Styling
The component uses several CSS classes for styling. You can override these styles by passing custom class names to the component via props:

- **customToggleCss**: Customize the toggle button.
- **customMenuCss**: Customize the dropdown menu.
- **customMenuItemCss**: Customize individual items in the dropdown.
- **customTickIconCss**: Customize the tick icon next to the selected language.

You can also define global styles for the component in your own CSS file or use the provided default styles (**LanguageSwitcher.css**).

## Accessibility
The **LanguageSwitcher** component uses ARIA attributes for improved accessibility:

- **aria-label** for the language toggle button and menu.
- **aria-current** for marking the currently selected language.
- **aria-labelledby** to associate the dropdown menu with the toggle button.

The component is fully navigable using the keyboard and includes focusable elements that work with **tabIndex**.

## Back
- [Main Page](../../../README.md)
