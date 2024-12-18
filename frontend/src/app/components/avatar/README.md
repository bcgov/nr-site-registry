# `Avatar` Component

The `Avatar` component is a simple, reusable component for displaying user profile avatars. It supports displaying user initials derived from the `firstName` and `lastName` props or showing a fallback question mark (`?`) if no names are provided. It can be customized with CSS classes for both the image container and the text (initials) inside the avatar.

## Features

- **Customizable Avatar**: Display initials or fallback text (`?`).
- **Flexible Styling**: Customizable CSS for the avatar container and text.
- **Supports Optional Props**: Includes options for first and last name to generate initials.
- **TypeScript Support**: Fully typed with TypeScript for better development experience.

## Installation

To install the `Avatar` component into your project, use the following command:

```bash
npm install avatar-component-package
```

## Usage
Here is an example of how to use the `Avatar` component in your React project:

```tsx
import React from 'react';
import Avatar from 'path-to-avatar-component';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      {/* Using the Avatar component */}
      <Avatar
        firstName="John"             // First name of the user
        lastName="Doe"               // Last name of the user
        customImageCss="custom-avatar-image" // Custom CSS for the avatar container
        customTextCss="custom-avatar-text"   // Custom CSS for the initials text
      />
    </div>
  );
};

export default App;
```

## Props Overview
The `Avatar` component accepts the following props:


| **Prop Name**       | **Type**              | **Description**                                                                                             |
|---------------------|-----------------------|-------------------------------------------------------------------------------------------------------------|
| `firstName`         | `string` (optional)   | The user's first name. Used to generate the first initial for the avatar.                                   |
| `lastName`          | `string` (optional)   | The user's last name. Used to generate the second initial for the avatar.                                   |
| `customImageCss`    | `string` (optional)   | Custom CSS class for the avatar image container. Defaults to 'avatar-image'.                               |
| `customTextCss`     | `string` (optional)   | Custom CSS class for the initials text inside the avatar. Defaults to 'avatar-txt'.                        |

## Prop Details:
- `firstName` **(optional)**:
The first name of the user, which is used to generate the first initial. If provided, the first letter will be capitalized and used as part of the avatar's initials.

- `lastName` **(optional)**:
The last name of the user, which is used to generate the second initial. If provided, the first letter will be capitalized and used as part of the avatar's initials.

- `customImageCss` **(optional)**:
A custom CSS class that can be passed to the avatar's image container to apply custom styles. If not provided, the default class 'avatar-image' will be used.

- `customTextCss` **(optional)**:
A custom CSS class for the text (initials) inside the avatar. This can be used to style the initials. If not provided, the default class 'avatar-txt' will be used.

## Component Logic
#### `getInitials` Function
The `Avatar` component includes a helper function `getInitials`, which generates the initials based on the provided `firstName` and `lastName` props.

- If both `firstName` and `lastName` are provided, it returns the first letter of each, capitalized.
- If only one of the names is provided, it uses the first letter of that name.
- If neither `firstName` nor `lastName` are provided, it returns '?' as a fallback.

##### Example Output
- **With First Name and Last Name**: If `firstName="John"` and `lastName="Doe"`, the component will display JD.
- **With First Name Only**: If `firstName="Alice"` and `lastName=""`, the component will display A.
- **With No Name**: If no `firstName` or `lastName` are provided, the component will display ?.


## CSS Customization
You can pass custom CSS classes to various parts of the avatar to match your project's branding. For example, you can customize the avatar image or text like this:

```tsx
<Avatar
  customImageCss="my-custom-avatar"
  customTextCss="my-custom-avatar-text"
/>
```

Here is an example of how you can style the avatar components using custom CSS:

```css
/* Custom styling for the avatar image */
.my-custom-avatar {
  border-radius: 50%;
  background-color: #d1e7f5;
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Custom styling for the avatar text (initials) */
.my-custom-avatar-text {
  font-size: 20px;
  color: #4a90e2;
  font-weight: bold;
}
```

##### Example of Full Usage
```tsx
import React from 'react';
import Avatar from 'path-to-avatar-component';

const App: React.FC = () => {
  return (
    <div className="app-container">
      {/* Avatar with both first and last names */}
      <Avatar
        firstName="John"
        lastName="Doe"
        customImageCss="custom-avatar-image"
        customTextCss="custom-avatar-text"
      />
      
      {/* Avatar with only the first name */}
      <Avatar
        firstName="Alice"
        customImageCss="custom-avatar-image"
        customTextCss="custom-avatar-text"
      />
      
      {/* Avatar with no names, displaying a question mark */}
      <Avatar
        customImageCss="custom-avatar-image"
        customTextCss="custom-avatar-text"
      />
    </div>
  );
};

export default App;
```

## Accessibility
The `Avatar` component includes an `aria-label="User profile image"` attribute for accessibility, which helps screen readers understand the content and purpose of the avatar.

## Default and Named Exports
By default, the `Avatar` component is exported as the default export:

```tsx
export default Avatar;
```

You can also export it as a named export if needed:

```tsx
export { Avatar };
```
