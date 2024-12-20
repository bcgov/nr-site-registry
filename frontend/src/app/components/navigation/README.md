# `Header`

A reusable and customizable header component for React applications. This component provides flexibility to customize the header with different logos, theme switches, mobile navigation icons, and more. It's designed for easy integration into various projects with a consistent layout.

## Features

- **Customizable Header**: Modify logos, theme icons, and more.
- **Responsive Design**: Adapts to mobile, tablet, and desktop screen sizes.
- **Flexibility**: Accepts custom components, such as language switchers and login dropdowns.
- **Theme Switcher**: Built-in theme switching functionality with custom icons.
- **Mobile-Friendly**: Mobile nav icon (hamburger menu) and mobile-friendly layout.
- **TypeScript Support**: Fully typed with TypeScript for better development experience.

## Installation

To install `nr-site` in your project, run the following command:

```bash
npm install nr-site.
```

## Usage
## Basic Usage
Here is an example of how to use the Header component in your React project:
```tsx
import React, { useState } from 'react';
import Header from 'nr-site/header';
const App: React.FC = () => {

  const [isToggled, setIsToggled] = useState(false);
  const handleToggle = (value: boolean) => {
    setIsToggled(value);
  };
  
  return (
    <div>
      <Header
        headerLogo="path/to/logo.png"   // Path to logo image
        headerName="Site Name"           // Header site name
        isToggled={isToggled}            // Manage toggle state (e.g., mobile menu open/close)
        onToggle={handleToggle}          // Callback for toggling the mobile menu
        customThemeIcon="path/to/theme-icon.png" // Path to custom theme icon (e.g., dark mode)
        customThemeSwitcher={/* Custom component */} // Optional: Custom theme switcher component
        customLanguageSwitcher={/* Custom language switcher component */}
        customMobileNav={/* Custom mobile nav component */}
      />
    </div>
  );
};
export default App;
```
## Props Overview

The `Header` component accepts the following props:

| **Prop Name**              | **Type**                   | **Description**                                                                                                                                 |
|----------------------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `headerLogo`                | `string`                   | Path to the logo image. This will be used as the logo displayed in the header.                                                                 |
| `headerLogoAnchorURL`       | `string`                   | URL for the logo. Specifies the URL to redirect to when the logo is clicked.                                                                   |
| `headerName`                | `string`                   | Header name. The name displayed in the header section of the site.                                                                             |
| `customHeaderCss`           | `string`                   | Custom CSS for the header. Allows passing custom styles for the header component.                                                              |
| `customHeaderNameCss`       | `string`                   | Custom CSS for the header name. Allows custom styling for the site name.                                                                       |
| `customHeaderLogoCss`       | `string`                   | Custom CSS for the logo. Allows custom styling for the logo.                                                                                   |
| `customHamBurgerIconCss`    | `string`                   | Custom CSS for the hamburger icon. Allows custom styling for the hamburger icon (mobile menu).                                                 |
| `customHamBurgerIconBtnCss` | `string`                   | Custom CSS for the hamburger button. Allows styling for the hamburger button.                                                                  |
| `customThemeIconCss`        | `string`                   | Custom CSS for the theme icon. Allows custom styling for the theme switcher icon.                                                              |
| `customThemeCss`            | `string`                   | Custom CSS for the theme switcher. Allows custom styling for the theme switcher button.                                                        |
| `customMobileMenuCss`       | `string`                   | Custom CSS for the mobile menu. Allows custom styles for the mobile navigation menu.                                                           |
| `customLanguageSwitcher`    | `ReactNode`                | Custom language switcher component. If you want to display a language switcher, pass it here.                                                  |
| `customUserAccount`         | `ReactNode`                | Custom user account component. Optionally include a custom user account dropdown.                                                              |
| `customLoginDropdown`       | `ReactNode`                | Custom login dropdown. Optionally include a custom login component or dropdown.                                                                |
| `customThemeSwitcher`       | `ReactNode`                | Custom theme switcher component. Pass a custom component for theme switching.                                                                  |
| `customMobileNav`           | `ReactNode`                | Custom mobile navigation. Use this prop to pass a custom mobile nav component.                                                                 |
| `customChildComponent`      | `ReactNode`                | Custom child component. For additional customization, use this prop to insert any other child component inside the header.                     |
| `customMobileNavIcon`       | `ReactNode`                | Custom mobile nav icon. You can pass a custom icon for the mobile navigation button.                                                           |
| `customThemeIcon`           | `ReactNode`                | Custom theme icon. Pass a custom icon for the theme switcher button.                                                                           |
| `isToggled`                 | `boolean`                  | State variable. Controls whether the mobile menu is open or closed.                                                                            |
| `onToggle`                  | `(value: boolean) => void` | Callback function. Allows you to manage the toggle state of the mobile menu.                                                                   |
| `onClickThemeSwitcher`      | `() => void`               | Callback function. A function triggered when the theme switcher is clicked (for dark/light mode toggle).                                       |


## CSS Customization
You can pass custom CSS classes to various parts of the header to match your project's branding. For example, you can customize the header logo or mobile menu button like so:
```tsx
<Header
  customHeaderCss="my-custom-header"
  customHeaderLogoCss="my-logo-class"
  customMobileMenuCss="my-mobile-menu-class"
/>
```
## Custom Theme Switcher
You can provide your own theme switcher component to toggle between light and dark modes:

```tsx
const CustomThemeSwitcher = () => (
  <button onClick={/* Your theme switching logic */}>Switch Theme</button>
);
<Header customThemeSwitcher={<CustomThemeSwitcher />} />
```

## Mobile Navigation Icon
By default, the component uses a hamburger menu for mobile devices. However, you can supply your own mobile navigation icon:

```tsx
const CustomMobileNavIcon = () => (
  <div>Custom Nav Icon</div>
);
<Header customMobileNavIcon={<CustomMobileNavIcon />} />
```

## Back
- [Main Page](../../../README.md)