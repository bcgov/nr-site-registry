# Table Component Documentation

## Overview

The `Table` component is a highly flexible and feature-rich table component built with React. It provides the following features:
- **Dynamic Table Structure**: Customizable columns, sorting, and row selection.
- **Pagination Support**: Displays paginated data with configurable page options.
- **Editable Mode**: Supports row editing and event handlers for data changes.
- **Dynamic and Customizable Columns**: Allows dynamic column creation and customization.
- **Sorting**: Built-in sorting functionality with customizable sort handlers.

This table component is ideal for applications that require displaying structured data with customizable column properties, sorting, pagination, and row selection.

## Props

| Prop                      | Type                                      | Description                                                                                     | Default Value         | Optional  |
|---------------------------|-------------------------------------------|-------------------------------------------------------------------------------------------------|-----------------------|-----------|
| `label`                   | `string`                                  | The label for the table (e.g., "User Data")                                                       | -                     | Required  |
| `isLoading`               | `RequestStatus`                           | The loading status of the table (e.g., loading spinner)                                          | -                     | Required  |
| `columns`                 | `TableColumn[]`                           | Array of column definitions for the table                                                        | -                     | Required  |
| `data`                    | `any`                                     | The data to be displayed in the table                                                             | -                     | Required  |
| `totalResults`            | `number`                                  | The total number of records available in the data set                                            | -                     | Optional  |
| `selectPage`              | `(pageNumber: number) => void`            | Callback function to handle page selection in pagination                                         | -                     | Optional  |
| `changeResultsPerPage`    | `(pageNumber: number) => void`            | Callback function to handle changes in the number of results per page                           | -                     | Optional  |
| `currentPage`             | `number`                                  | The current page number in pagination                                                            | 1                     | Optional  |
| `resultsPerPage`          | `number`                                  | The number of results per page                                                                   | 10                    | Optional  |
| `showPageOptions`         | `boolean`                                 | Whether to display page options for pagination                                                    | `true`                | Optional  |
| `allowRowsSelect`         | `boolean`                                 | Whether to allow row selection                                                                    | `false`               | Optional  |
| `changeHandler`           | `(eventRecord: any) => void`              | Callback function to handle changes to a row's data (e.g., edit or delete)                      | -                     | Required  |
| `editMode`                | `boolean`                                 | Whether the table is in edit mode                                                                 | `false`               | Required  |
| `srMode`                  | `boolean`                                 | Accessibility mode for screen readers                                                            | `false`               | Optional  |
| `idColumnName`            | `string`                                  | The name of the column that represents the unique ID for each row (e.g., 'id')                  | -                     | Required  |
| `sortHandler`             | `(row: any, ascSort: boolean) => void`     | Callback function to handle column sorting                                                        | -                     | Optional  |
| `deleteHandler`           | `(eventRecord: any) => void`              | Callback function to handle row deletion                                                          | -                     | Optional  |

## `TableColumn` Class

The `TableColumn` class represents the definition of a single column in the table. It includes properties such as the column’s ID, display name, active status, and various configuration options like sorting order, column size, and whether it's sticky.

### Properties

| Property                | Type                      | Description                                                                                     |
|-------------------------|---------------------------|-------------------------------------------------------------------------------------------------|
| `id`                    | `number`                  | Unique identifier for the column                                                                 |
| `displayName`           | `string`                  | The name displayed in the table header for this column                                           |
| `active`                | `boolean`                 | Whether the column is active and should be displayed                                             |
| `graphQLPropertyName`   | `string`                  | The GraphQL property name for this column (used in queries)                                       |
| `groupId`               | `number` (optional)       | Optional group ID for grouping columns                                                            |
| `disabled`              | `boolean` (optional)      | Whether the column is disabled for interactions (e.g., sorting, editing)                         |
| `isDefault`             | `boolean` (optional)      | Whether the column is set as the default column                                                  |
| `sortOrder`             | `number` (optional)       | The default sorting order for the column (used for initial sorting)                              |
| `isChecked`             | `boolean` (optional)      | Whether the column is checked for display (used in user settings)                                |
| `displayType`           | `IFormField` (optional)   | The type of the column (e.g., text field, date picker) for form handling                         |
| `linkRedirectionURL`    | `string` (optional)       | URL to which the user can be redirected when clicking on a value in the column                   |
| `dynamicColumn`         | `boolean`                 | Whether the column is dynamic (can be shown/hidden programmatically)                             |
| `columnSize`            | `ColumnSize` (optional)   | The size of the column (can be `Default`, `Small`, `XtraSmall`, `Double`, or `Triple`)           |
| `stickyCol`             | `boolean` (optional)      | Whether the column is sticky and stays visible when scrolling horizontally                       |

## `ColumnSize` Enum

The `ColumnSize` enum is used to define the size of the table columns. It helps control the width of the columns to adapt to different content types and layouts.

- **Default**: Standard column width.
- **Small**: Small width for narrower content.
- **XtraSmall**: Extra small width for very narrow content.
- **Double**: Double width for wider content.
- **Triple**: Triple width for very wide content.

## Example Usage

```tsx
import React, { useState } from 'react';
import { Table, TableColumn, ColumnSize } from './Table';

const ExampleComponent = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: TableColumn[] = [
    new TableColumn(1, 'Name', true, 'name', undefined, false, true, 1),
    new TableColumn(2, 'Age', true, 'age', undefined, false, true, 2, undefined, undefined, ColumnSize.Small),
    new TableColumn(3, 'Location', true, 'location', undefined, false, true, 3, undefined, undefined, ColumnSize.Double),
  ];

  const changeHandler = (eventRecord: any) => {
    // Handle row changes (edit, delete, etc.)
  };

  return (
    <div>
      <Table
        label="User Table"
        isLoading={isLoading}
        columns={columns}
        data={data}
        changeHandler={changeHandler}
        editMode={false}
        idColumnName="id"
      />
    </div>
  );
};
```

## Explanation of Example

### Key Points:

- **State Management**: 
  - The `data` and `isLoading` states are managed within the component. These states control the data to be displayed in the table and indicate whether the table is in a loading state. 
  - The `Table` component receives the `data` as a prop and renders it accordingly. If the `isLoading` prop is `true`, the table will display a loading indicator.
  
- **Columns**:
  - Each column in the table is defined using the `TableColumn` class. 
  - Key properties of `TableColumn` include:
    - `id`: Unique identifier for the column.
    - `displayName`: The label to be shown in the table header.
    - `graphQLPropertyName`: The property name used in the GraphQL query.
    - `columnSize`: Determines the width of the column (e.g., `Small`, `Default`, `Double`).
    - Other properties like `active`, `disabled`, and `isChecked` can control whether a column is visible, editable, or checked for selection.
  
- **Change Handler**:
  - The `changeHandler` prop is passed to handle row changes, such as editing, updating, or deleting rows. It listens for any actions performed on the table rows (e.g., when the user edits or deletes a row).
  
### Behavior:

- **Table Rendering**: 
  - The `Table` component renders the table structure based on the columns and data passed to it. It dynamically adjusts the table content depending on the props like `columns`, `data`, `isLoading`, and pagination settings.
  - The table supports sorting, row selection, and pagination. The columns can be sorted by clicking on the header, and rows can be selected for editing or other actions.
  
- **Dynamic Columns**:
  - The `columns` array can be modified dynamically to show or hide specific columns based on user preferences or application logic.
  - You can control the visibility, sorting behavior, and display type of each column, allowing for a highly customizable table structure.
  
### Conclusion

The `Table` component is a powerful and flexible solution for displaying structured data in React applications. It offers a range of features, including:
- Dynamic column definitions.
- Sorting, pagination, and row selection.
- Editable rows with customizable handlers.

These features make the `Table` component highly adaptable to different use cases, from simple data display to more complex interactive grids.
