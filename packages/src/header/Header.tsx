// Importing necessary resources and components for the Header component

import { ReactNode } from 'react';
// import { BarsIcon } from '../../icons/icons'; // Import the BarsIcon (hamburger menu) from the common icons
import { IHeaderProps } from './IHeader';  // Import IHeader interface 
import './Header.css';                     // Import the custom styles for the header

// Header component definition
const Header: React.FC<IHeaderProps> = (props) => {
  // Function to toggle the visibility of the navbar on smaller screens
  const toggleNavbar = () =>
    props?.onToggle && props?.onToggle(!props?.isToggled);
  
  // Function to render the default theme switcher (e.g., dark or light mode)
  const getDefaultThemeSwitcher = (
    customIcon: string,
    imageCss: string,
    themeCss: string,
    onClickThemeSwitcher?: () => void
  ) => {
    return (
      <div className={` ${themeCss ? themeCss : 'd-sm-none d-md-flex d-none'}`}>
        {/* Application theme for example dark and ligth theme */}
        <img
          className={imageCss}
          src={ customIcon }
          alt="Moon image for theme."
          onClick={onClickThemeSwitcher}
        />
      </div>
    );
  };

  // Function to render the default mobile navigation icon (hamburger menu)
  const getMobileNavIcon = (
    customIcon: ReactNode,
    cutomBtnCss: string,
    customIconCss: string,
    toggle: boolean,
  ) => {
    return (
      <button
        className={`${cutomBtnCss ? cutomBtnCss : 'navbar-toggler display-upto-medium no-bg-br-outline'}`}
        type="button"
        onClick={toggleNavbar}
        aria-label="menu for mobile/smaller devices"
        aria-expanded={toggle ? 'true' : 'false'}
        aria-controls="navbarMenu"
        aria-haspopup="true"
      >
        <div className={`${customIconCss ? customIconCss : 'bars-button'}`}>
          {customIcon}
        </div>

        {/* <BarsIcon
          className={`${customIconCss ? customIconCss : 'bars-button'}`}
        /> */}
      </button>
    );
  };

  // Function to render the default header view, including logo, site name, and other elements
  const getDefaultHeaderView = (properties: any) => {
    return (
      <>
        <div
          className={
            'd-flex justify-content-start align-items-center custom-header-gap'
          }
          tabIndex={1}
          role="navigation"
        >
          {properties?.headerLogo && (
            <a href={properties?.headerLogoAnchorURL}>
              <img
                src={properties?.headerLogo}
                className={`${properties?.customHeaderLogoCss ? properties?.customHeaderLogoCss : 'logo'}`}
                alt="BC Government Logo"
              />
            </a>
          )}
          {properties?.headerName && (
            <h1
              className={`${properties?.customHeaderNameCss ? properties?.customHeaderNameCss : 'siteName'}`}
            >
              {properties?.headerName}
            </h1>
          )}
        </div>
        <div className={'d-flex align-items-center custom-header-gap'}>
          {properties?.customLanguageSwitcher &&
            properties?.customLanguageSwitcher}{' '}
          {/* Fallback to default */}
          {properties?.customMobileNavIcon &&
            getMobileNavIcon(
              properties?.customMobileNavIcon,
              properties?.customHamBurgerIconBtnCss ?? '',
              properties?.customHamBurgerIconCss ?? '',
              properties?.isToggled ?? false,
            )
          }
          {properties?.customThemeSwitcher ||
            properties?.customThemeIcon && getDefaultThemeSwitcher(
              properties?.customThemeIcon,
              properties?.customThemeIconCss ?? '',
              properties?.customThemeCss ?? '',
              properties?.onClickThemeSwitcher
            )}
          {properties?.customLoginDropdown}
          {!properties?.isToggled && properties?.customUserAccount}
        </div>
        {
          properties?.customMobileNav &&
           <div
            role="menu"
            className={`${properties.customMobileMenuCss ? properties.customMobileMenuCss : `small-screen-menu mobile-menu ${properties?.isToggled ? 'show' : 'd-none'}`}`}
            onClick={() => toggleNavbar()}>
            {properties?.customMobileNav}
          </div>
        }
      </>
    );
  };
  
  // Main return of the Header component with a customizable CSS class and child components
  return (
    <header id='header'
      className={` ${props?.customHeaderCss ? props?.customHeaderCss : 'navbar position-sticky navbar-for-small-device'}`}
    >
      {props?.customChildComponent || getDefaultHeaderView({ ...props })}
    </header>
  );
};

//export default
export default Header;

// //export named
// export {Header};