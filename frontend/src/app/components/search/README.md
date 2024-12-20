# SearchInput Component

The `SearchInput` component is a flexible and customizable React input field designed for handling search functionality. It supports dynamic search term input, option selection from a dropdown, and the ability to create new items. This component is highly reusable and can be easily integrated into various forms or search interfaces.

## Features
- Customizable label, placeholder text, and icons.
- Handles search term input and provides options for selection.
- Allows the user to create new items when no option matches the search term.
- Supports both controlled and uncontrolled component behavior.
- Fully accessible with proper ARIA labels.

## Installation

To use the `SearchInput` component, you need to have React and ReactDOM installed in your project. If you don't already have it, you can install it using npm or yarn:

```bash
npm install react react-dom
```

## Usage
### Importing the Component
To use the SearchInput component in your project, import it like this:
```tsx
import SearchInput from './SearchInput';  // Adjust the path accordingly
```
## Props Table

The `SearchInput` component accepts the following props:

| Prop                   | Type                    | Description                                                                 |
|------------------------|-------------------------|-----------------------------------------------------------------------------|
| `label`                | `string?`               | **Optional**. The label for the input field. If provided, it will be displayed above the input. |
| `searchTerm`           | `string`                | **Required**. The current search term entered by the user.                   |
| `handleSearchChange`   | `(event: any) => void`  | **Required**. Function to handle changes in the search input field. It should update the `searchTerm`. |
| `clearSearch`          | `() => void`            | **Required**. Function to clear the search input field when called.          |
| `options`              | `string[]?`             | **Optional**. An array of strings representing the options to be displayed in a dropdown for selection. |
| `optionSelectHandler`  | `(event: any) => void`  | **Optional**. A function to handle the selection of an option from the dropdown. |
| `createNewLabel`       | `string?`               | **Optional**. A string representing the label for creating a new item (e.g., "Category"). Displayed below the options when available. |
| `createNewHandler`     | `(event: any) => void`  | **Optional**. Function to handle the creation of a new item when the user opts to create a new item. |
| `placeHolderText`      | `string?`               | **Optional**. Placeholder text that appears inside the search input field when it is empty. |
| `customLeftIcon`       | `ReactNode?`            | **Optional**. A custom icon (React component or element) to display inside the search input on the left side (e.g., a search icon). |
| `customRightIcon`      | `ReactNode?`            | **Optional**. A custom icon (React component or element) to display inside the search input on the right side (e.g., a clear icon). |

### Notes:
- All props marked with `?` are optional and can be omitted if not needed.
- `ReactNode` for `customLeftIcon` and `customRightIcon` means you can pass any valid React component, such as an `<svg>`, `<img>`, or any other React element.


## Example Usage
```tsx
import React, { useState } from 'react';
import SearchInput from './SearchInput';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options] = useState(['Apple', 'Banana', 'Orange']); // Example options

  // Handler to update the search term
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handler to clear the search term
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handler to select an option from the dropdown
  const handleOptionSelect = (option: string) => {
    console.log('Selected option:', option);
    setSearchTerm(option);
  };

  // Handler to create a new item (e.g., a new fruit)
  const createNewHandler = (newItem: string) => {
    console.log('Creating new item:', newItem);
  };

  return (
    <div>
      <SearchInput
        label="Search for a fruit"
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        clearSearch={clearSearch}
        options={options}
        optionSelectHandler={handleOptionSelect}
        createNewLabel="Fruit"
        createNewHandler={createNewHandler}
        placeHolderText="Type a fruit name..."
      />
    </div>
  );
};

export default App;
```

### State Management

The `SearchInput` component relies on React's `useState` hook to manage and control the state of the search input (`searchTerm`). This ensures that the component behaves as a **controlled component**, meaning its value is controlled by React state.

- **`searchTerm` State**: 
  - This state holds the current value of the search input field. Initially, it's set to an empty string (`useState('')`), but as the user types in the input, this state updates in real-time to reflect the current value of the search field.
  - The `searchTerm` is passed down to the `SearchInput` component as a prop, which allows the input field to display the correct value.
  - The search term is updated by the `handleSearchChange` function, which is invoked on the `onChange` event of the input field.

- **`setSearchTerm` Function**:
  - This function is used to update the `searchTerm` state whenever the user types something in the search field. It's called inside the `handleSearchChange` function, which takes the event from the input field as a parameter and updates the state accordingly.
  - Example:
    ```tsx
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value); // Update the search term to the current value of the input field
    };
    ```
## Explanation of Example

### State Management

The `SearchInput` component utilizes React's `useState` hook to manage the `searchTerm` and store the user's input. This state is passed down to the `SearchInput` component as a prop, making the input field **controlled**. A controlled input means the value of the input is determined by React state, and the component will re-render whenever the state changes.

- **`searchTerm`**: This state holds the value of the current search term entered by the user. As the user types, this state is updated, and the input field reflects the updated value.
  
- **`options`**: The `options` array holds predefined options (e.g., `["Apple", "Banana", "Orange"]`) that will be shown in the dropdown below the search input. These options are passed as a prop to the `SearchInput` component, and the component filters them based on the `searchTerm` to display relevant matches.

### Props

The `SearchInput` component accepts the following props:

- **`label`**: The label for the search input field. In the example, the label is `"Search for a fruit"`, which is displayed above the input field to describe its purpose.
  
- **`searchTerm`**: The current value of the search term, stored in the component's state. This value is passed to the `SearchInput` as a controlled prop to ensure that the input field's value is always in sync with the state.

- **`handleSearchChange`**: This function is responsible for updating the `searchTerm` state whenever the user types in the search input. It is passed as a prop and is called on every `onChange` event in the input field.
  
- **`clearSearch`**: This function clears the search term when invoked (e.g., when the user clicks the clear icon). It is triggered by clicking the clear icon in the input field.

- **`options`**: An array of search options (e.g., `["Apple", "Banana", "Orange"]`) that will be displayed in a dropdown below the input field. These options will be filtered dynamically as the user types the search term.

- **`optionSelectHandler`**: When the user selects an option from the dropdown, this function is called. It updates the `searchTerm` with the selected option and can log or perform any other action with the selected value.

- **`createNewLabel`**: The label for the "Create New" option (e.g., `"Fruit"`). If no matching option exists based on the `searchTerm`, the user will see a prompt to create a new item, like "Create New Fruit."

- **`createNewHandler`**: This function is triggered when the user clicks on the "Create New" option. It allows the user to create a new item based on the current search term (e.g., adding a new fruit). This function can log the new item or execute any custom logic.

- **`placeHolderText`**: The placeholder text displayed inside the search input field when it is empty. For example, `"Type a fruit name..."`.

### Behavior

The `SearchInput` component behaves as follows:

- **Search Input**: As the user types into the search input, the `searchTerm` is updated in real-time. The `handleSearchChange` function updates the state, and the input field is re-rendered with the new value.

- **Option Selection**: If the `searchTerm` matches any items in the `options` array, those options are displayed in a dropdown below the input field. The user can select an option, which will update the `searchTerm` with the selected value, and the dropdown will be hidden.

- **Create New Option**: If no matching options exist in the `options` array, a "Create New" option is displayed. This option allows the user to create a new item based on the current search term (e.g., "Create New Fruit"). Clicking this option sets the component into **create mode**, where the user can add a new item.

### Example Flow

1. The user types `"Grape"` in the search input.
2. Since `"Grape"` doesn't match any options in the `options` array, the "Create New Fruit" option appears.
3. The user clicks on "Create New Fruit."
4. The `createNewHandler` function is called with the value `"Grape"`, allowing the user to create a new fruit or perform another action with the input.

## Summary

In this example:

- The `SearchInput` component is fully controlled by the `searchTerm` state, meaning the value of the input field is tied to React state, and any change to the input updates the state, which in turn re-renders the component.
  
- The component supports:
  - **Search Option Selection**: As the user types in the search input, matching options from the predefined list (e.g., `['Apple', 'Banana', 'Orange']`) are displayed in a dropdown. When an option is selected, the search term is updated with the selected value, and the dropdown is hidden.
  
  - **Create New Item**: If no options match the search term, a "Create New" option (e.g., "Create New Fruit") is shown. This allows the user to create a new item based on the current search term. Upon selecting this option, the component enters "create mode," triggering a handler function to create the new item.

Overall, the `SearchInput` component is highly flexible, allowing for both standard option selection from a list and the creation of new entries if no matches are found.
