# Sorting Widget Component

This repository provides a `Sort` component that enables users to sort data based on selected criteria. The component is highly configurable and supports dynamic form rendering using a dropdown for sorting options. The component can be integrated into any React application that requires sorting functionality.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Component Overview](#component-overview)
- [Props Table](#props)
- [CSS Variables](#css-variables)
- [Form Configuration](#form-configuration)
- [License](#license)

---

## Installation

To use the `Sort` component in your React project, you can install it via npm or yarn. If the package is hosted on a registry, you can install it as follows:

```bash
npm install <your-package-name>
```

### Usage
Here’s an example of how you can use the Sort component within your React app:
```tsx
import React, { useState } from 'react';
import Sort from './components/Sort';
import { ISort } from './components/ISort';
import { IFormField } from './inputControl/IFormField';

const MyComponent = () => {
  const [formData, setFormData] = useState<any>([]);
  
  // Handler for sorting change
  const handleSortChange = (graphQLPropertyName: any, value: string | [Date, Date]) => {
    console.log(`Sorting by: ${graphQLPropertyName} with value: ${value}`);
    // You can perform data fetching or sorting logic here
  };

  return (
    <div>
      <Sort
        formRows={[]}
        formData={formData}
        editMode={true}
        handleSortChange={handleSortChange}
      />
    </div>
  );
};
```
---

## Component Overview
### Sort Component
The `Sort` component provides a form for sorting data. It renders a dropdown with sorting options and handles user interaction with the sorting options. The component can be configured for editable modes and customized through various props.

- **Props**: The Sort component accepts the following props:
- formRows: The rows of form fields to render (defaults to predefined sorting options if not provided).
- formData: The data to be used in the sorting operation (e.g., an array or dataset).
- editMode: A boolean flag to control whether the form is in "edit mode" (default is false).
- handleSortChange: A callback function triggered when the user changes the sorting option.

## Props

The `Sort` component accepts the following props. These allow you to configure the sorting functionality, form appearance, and data handling.

| Prop               | Type                               | Description                                                                                                     | Default Value |
|--------------------|------------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------|
| `formRows`         | `IFormField[][]`                   | Defines the structure of the form rows. This is where you can customize the form fields (e.g., dropdowns for sorting). | `[]`          |
| `formData`         | `any`                              | The data to be sorted. This could be a list, array, or any dataset that needs to be sorted by the user.            | `[]`          |
| `editMode`         | `boolean`                          | Controls whether the form is editable. If set to `true`, the user can modify the sorting options.                 | `false`       |
| `handleSortChange` | `(graphQLPropertyName: any, value: string | [Date, Date]) => void` | A callback function to handle the sort change event. It receives the `graphQLPropertyName` (e.g., `sortBy`) and the new `value`. | `() => {}`    |

---

## CSS Variables

The appearance of the `Sort` component can be customized by overriding the default CSS variables. Below is a table of the available CSS variables you can modify:

| CSS Variable                   | Default Value   | Description                                                                                     |
|---------------------------------|-----------------|-------------------------------------------------------------------------------------------------|
| `--max-height`                  | `700px`         | Maximum height of the table container.                                                          |
| `--overflow`                    | `auto`          | Defines the overflow behavior for scrolling content.                                            |
| `--font-size`                   | `16px`          | Default font size for text in the widget.                                                       |
| `--font-weight`                 | `700`           | Font weight for text in the widget (set to bold by default).                                    |
| `--line-height`                 | `18px`          | Line height for text content.                                                                   |
| `--layout-padding-small`        | `8px`           | Padding used for inner elements. Can be adjusted to control spacing.                           |
| `--layout-margin-small`         | `10px`          | Margin for spacing between elements in the layout.                                              |
| `--surface-border-light`        | `#d8d8d8`       | Border color for elements, typically used for borders and dividers.                             |
| `--typography-color-primary`    | `#333`          | Primary text color for labels, titles, and other text content in the widget.                    |

You can customize these variables either globally (in your main CSS or SCSS files) or locally (for specific components). This allows for flexible theming and style management across your application.

## Form Configuration (`notationSortBy`)

The `notationSortBy` array defines the structure of the form fields used in the sorting widget. It contains the configuration for the dropdown field where users can select the sorting criteria (e.g., "Newest to Oldest" or "Oldest to Newest").

### Example of `notationSortBy` Configuration

```typescript
import { FormFieldType, IFormField } from '../inputControl/IFormField';

export const notationSortBy: IFormField[][] = [
  [
    {
      type: FormFieldType.DropDown,    // Dropdown field for sorting
      label: 'Sort By',                 // Label to be displayed next to the field
      placeholder: 'Sort by',           // Placeholder text for the dropdown
      graphQLPropertyName: 'sortBy',    // GraphQL property name associated with this field
      options: [
        { key: 'newToOld', value: 'Newest to Oldest' },  // Sorting option 1
        { key: 'oldTonew', value: 'Oldest to Newest' },  // Sorting option 2
      ],                                // Options for the dropdown menu
      value: '',                        // Default value for the dropdown field
      colSize: 'col-lg-12 col-md-12 col-sm-12',  // CSS grid size for responsive design
    },
  ],
];
```

### Description:
- **Field Type**: The form contains a dropdown field (FormFieldType.DropDown).
- **Label**: The field is labeled as "Sort By".
- **Options**: Users can choose between "Newest to Oldest" or "Oldest to Newest" sorting.
- **Column Size**: The dropdown takes up the full width of the form, even on smaller screens.
This configuration can be customized to add more fields or change the available options.