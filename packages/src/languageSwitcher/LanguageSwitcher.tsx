import React, { useEffect, useRef, useState } from 'react'; // Import React hooks for managing state, side effects, and references
// import { DropdownIcon, TickIcon } from '../../icons/icons'; // Importing custom icons for the dropdown and tick
import { ILanguageSwitcherProps } from './ILanguageSwitcher'; // Import the props interface for the LanguageSwitcher component
import './LanguageSwitcher.css'; // Import the component's CSS styles

// The LanguageSwitcher component accepts ILanguageSwitcherProps and manages the state and behavior of the language switcher.
const LanguageSwitcher: React.FC<ILanguageSwitcherProps> = (props) => {
   // Initialize state for the current language, defaulting to the provided 'defaultLanguage' prop
  const [currentLanguage, setCurrentLanguage] = useState(props.defaultLanguage);

  // State to track whether the dropdown menu is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // Reference to the div element for detecting clicks outside of the component
  const divRef = useRef<HTMLDivElement>(null);

  // Function to handle changing the language
  const handleLanguageChange = (languageKey: string) => {
    setCurrentLanguage(languageKey);// Update the current language state
    // If the onLanguageChange callback prop is provided, call it with the new language key
    props?.onLanguageChange && props?.onLanguageChange(languageKey);
    setIsOpen(false); // Close the dropdown menu after a language is selected
  };

  // Toggle the visibility of the dropdown menu
  const toggleDropdown = () => setIsOpen((prev) => !prev);

   // Function to handle clicks outside of the component (to close the dropdown)
   const handleClickOutside = (event: MouseEvent) => {
    // If the click is outside the divRef (the root of the component), close the dropdown
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

    // Effect to add the event listener for clicks outside the component when the component mounts
  // It will clean up the event listener when the component unmounts
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <>
      {/* Dropdown component for language selection */}
      <div className='position-relative  d-inline-block' id="language-selector" aria-label="Language Selector" ref={divRef}>
        {/* Language toggle button */}
        {props?.customToggleIcon || (
          <div
            id="language-dropdown"
            className={`${props?.customToggleCss ? props?.customToggleCss : 'custom-toggle'}`}
            aria-label="Language Menu"
            onClick={toggleDropdown}
          >
            {/* Display current selected language */}
            {currentLanguage.toUpperCase()}
            {
              props?.customDropdownIcon && 
              <div className={`${props?.customToggleIconCss ? props?.customToggleIconCss : 'pb-1 ps-1'}`}>
                {props?.customDropdownIcon}
              </div>
            }
            {/* <DropdownIcon
              className={`${props?.customToggleIconCss ? props?.customToggleIconCss : 'pb-1 ps-1'}`}
            /> */}
          </div>
        )}
      {/* Dropdown menu */}
      {isOpen &&
        (props?.customMenu || (
          <div
            id="menu"
            className={`${props?.customMenuCss ? props?.customMenuCss : 'custom-menu mt-4 '}`}
            role="menu"
            aria-labelledby="language-dropdown"
          >
            {/* Language options */}
            <div role="none">
              {/* Default option */}
              <div
                id="menu-item"
                className={`${props?.customMenuItemCss ? props?.customMenuItemCss : 'custom-item-first-child'}`}
                role="menuitem"
                aria-disabled="true"
                tabIndex={-1} // Prevent tab focus on disabled items
              >
                <div
                  className={`${props?.customPlaceholderTextCss ? props?.customPlaceholderTextCss : 'custom-item-label pb-2'}`}
                >
                  {props?.customPlaceholderText || 'Please select a language:'}
                </div>
              </div>
            </div>

            {/* Map through available languages */}
            {props.languages &&
              props.languages.map((lang) => (
                <div
                  id="menu-item"
                  onClick={() => {
                    handleLanguageChange(lang.key);
                    // setIsOpen(!isOpen);
                  }}
                  className={`${props?.customMenuItemCss ? props?.customMenuItemCss : 'custom-item d-flex w-100 align-items-center'}`}
                  role="menuitem"
                  aria-label={lang.value}
                  aria-current={
                    currentLanguage === lang.key ? 'true' : undefined
                  }
                  tabIndex={0} // Allow keyboard focus
                  key={lang.key}
                >
                  {/* Display language name */}
                  <span>{lang.value}</span>

                  {/* Display tick icon if current language is selected */}
                  {currentLanguage === lang.key &&
                    (props?.customTickIcon || (
                      <div className={`${props?.customTickIconCss ? props?.customTickIconCss : 'tick-icon'}`}>
                        {props?.customOnSelectLangIcon}
                      </div>
                      // <TickIcon
                      //   className={`${props?.customTickIconCss ? props?.customTickIconCss : 'tick-icon'}`}
                      // />
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
};

//export default
export default LanguageSwitcher;

//export named
// export {LanguageSwitcher};