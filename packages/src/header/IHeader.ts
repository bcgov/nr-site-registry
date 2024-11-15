import { ReactNode } from "react";

// Define the props interface for the Header component
export interface IHeaderProps {
    headerLogo?: string; // Path for the logo image.
    headerLogoAnchorURL?: string; // URL for the logo image, redirect to specified location on click of logo.
    headerName?: string; // Header name to display.
  
    customHeaderCss?: string; // Custom header css is for giving custom css instead of default css.
    customHeaderNameCss?: string; // Custom header name css is for giving custom css instead of default css.
    customHeaderLogoCss?: string; // Custom header logo css is for giving custom css instead of default css.
    customHamBurgerIconCss?: string; // Custom hamburger icon css for giving custom css instead of default css.
    customHamBurgerIconBtnCss?: string; // Custom hamburger icon css for giving custom css instead of default css.
    customThemeIconCss?: string; // Custom theme icon css is for giving custom css instead of default css.
    customThemeCss?: string; // Custom theme icon css is for giving custom css instead of default css.
    customMobileMenuCss?: string; // Custom mobile menu css is for giving custom css instead of default css.
  
    customLanguageSwitcher?: ReactNode; // Custom language switcher component.
    customUserAccount?: ReactNode; // Custom user account component.
    customLoginDropdown?: ReactNode; // Custom login dropdown component.
    customThemeSwitcher?: ReactNode; // Custom theme switcher component.
    customMobileNav?: ReactNode; // Custom mobile nav component.
    customChildComponent?: ReactNode; // Custom child component for more flexibility.
  
    customMobileNavIcon?: ReactNode; // Custom mobile nav icon component.
    customThemeIcon?: ReactNode; // Custom theme Icon
  
    isToggled?: boolean; // isToggled state variable to check open and close state of component.
    onToggle?: (value: boolean) => void; // onToggle will handle isToggled state variable state.
    onClickThemeSwitcher?: () => void; // click event to theme switcher.
}