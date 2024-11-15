# Navigation Pills Component

A flexible and customizable React component to display navigation pills with both desktop and mobile views. It supports dynamic rendering based on URL query parameters, navigation through pills, dropdown menus, and carousel-style navigation.

## Features

- **Dynamic Navigation Pills**: Display navigation pills in both desktop and mobile views.
- **Mobile Carousel Navigation**: Use left and right carousel icons to navigate through pills on mobile screens.
- **Dropdown Menu**: Optionally display a dropdown to select the active pill.
- **Customizable Styles**: Easily customize styles through props for different elements (e.g., pills, buttons, carousel icons).
- **Active Index Sync**: Sync the active pill with the URL query parameters using React Router.
- **Disable Pills**: Optionally disable pills and prevent interaction.

## Installation

To use this component in your React application, follow these steps:

1. Install dependencies:
   ```bash
   npm install react-router-dom
   ```
2. Add the `NavigationPills` component and its styles to your project.

3. Import and use the `NavigationPills` component:
```tsx
import NavigationPills from './path/to/NavigationPills';
import { INavigationPills } from './path/to/INavigationPills';

// Example usage
const items = ['Pill 1', 'Pill 2', 'Pill 3'];
const components = [
  { key: 'pill1', component: <div>Content for Pill 1</div> },
  { key: 'pill2', component: <div>Content for Pill 2</div> },
  { key: 'pill3', component: <div>Content for Pill 3</div> }
];

<NavigationPills
  items={items}
  components={components}
  dropdownItems={['Option 1', 'Option 2']}
  isDisable={false}
  customNavPillsCss="custom-css-class"
/>
```
## Props

The `NavigationPills` component accepts the following props:

| Prop                          | Type          | Description                                                                 |
|-------------------------------|---------------|-----------------------------------------------------------------------------|
| `items`                        | `string[]`    | Array of strings representing the text for each navigation pill.            |
| `components`                   | `object[]`    | Array of objects containing `key` (string) and `component` (JSX) for each pill. |
| `dropdownItems`                | `string[]?`   | Array of strings for dropdown items to be displayed in a dropdown menu (optional). |
| `isDisable`                    | `boolean?`    | A flag to disable pill navigation (optional). Defaults to `false`.           |
| `customNavPillsCss`            | `string?`     | Custom CSS class for the pills (optional).                                  |
| `customMobileNavPillsCss`      | `string?`     | Custom CSS class for pills in mobile view (optional).                       |
| `customDropdownMenuCss`        | `string?`     | Custom CSS class for the dropdown menu (optional).                          |
| `customDropdownToggleBtnCss`   | `string?`     | Custom CSS class for the dropdown toggle button (optional).                |
| `customNavCarouselLeftIconCss` | `string?`     | Custom CSS class for the left carousel icon (optional).                    |
| `customNavCarouselRightIconCss`| `string?`     | Custom CSS class for the right carousel icon (optional).                   |

## Example Usage
```tsx
import React from 'react';
import NavigationPills from './NavigationPills';

const items = ['Home', 'About', 'Services', 'Contact'];
const components = [
  { key: 'home', component: <div>Home Content</div> },
  { key: 'about', component: <div>About Content</div> },
  { key: 'services', component: <div>Services Content</div> },
  { key: 'contact', component: <div>Contact Content</div> }
];

const App = () => {
  return (
    <div>
      <NavigationPills
        items={items}
        components={components}
        dropdownItems={['Option 1', 'Option 2']}
        isDisable={false}
        customNavPillsCss="custom-nav-pill"
      />
    </div>
  );
};

export default App;
```

## CSS Customization
You can customize the appearance of the pills, carousel icons, and dropdown buttons by passing custom CSS classes as props. For example, to change the color of the active pill, use the `customNavPillsCss` prop.

```css
.custom-nav-pill {
  padding: 10px 20px;
  border-radius: 5px;
  background-color: #4CAF50; /* Green */
  color: white;
  font-weight: bold;
}

.custom-nav-pill.active {
  background-color: #ff5722; /* Orange */
}

.custom-nav-pill.disabled {
  background-color: #9e9e9e; /* Grey */
  color: #ccc;
}
```

## Responsive Design
- **Desktop View**: The pills are displayed horizontally.
- **Mobile View**: A carousel-style navigation allows users to scroll through the pills, with left and right arrows to navigate between pills.
The component automatically adjusts for different screen sizes using the following media queries:
```css
@media screen and (max-width: 786px) {
  /* Adjust styles for mobile view */
}
```
## Dependencies
- `react-router-dom`: For navigation and location management.
- `CSS Variables`: The component relies on CSS variables for theming and styling. Make sure your project supports CSS variables or define them as needed.
License