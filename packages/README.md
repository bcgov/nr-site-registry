# bcgov-epd-components

## Installation

```js

npm install bcgov-epd-components

```

## Importing Components

You should import individual components like: `bcgov-epd-components/Button` rather than the entire library. Doing so pulls in only the specific components that you use, which can significantly reduce the amount of code you end up sending to the client.

```js
import Button from 'bcgov-epd-components/Button';
//or
import { Button } from 'bcgov-epd-components/Button';

// or less ideally
import { Button } from 'bcgov-epd-components';
```

## Stylesheets

#### Using CSS

```js
// In your entry point
// import CSS or
import 'bcgov-epd-components/styles.css';
import 'bcgov-epd-components/header/Header.css';
```

# Example

```js
import React from 'react';
import Button from 'bcgov-epd-components/Button';
import from 'bcgov-epd-components/styles.css';
import from 'bcgov-epd-components/header/Header.css';

export default function App() {
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

    <Button size="small" variant="primary" onClick={handleClick}>
        Primary Button
    </Button>

    <Button size="medium" variant="secondary" onClick={handleClick}>
        Secondary Button
    </Button>

    <Button size="medium" variant="tertiary" onClick={handleClick}>
        Tertiary Button
    </Button>
    </div>
  );
}
```


