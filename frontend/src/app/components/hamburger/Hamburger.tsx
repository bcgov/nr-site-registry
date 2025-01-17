import React from 'react';
import './Hamburger.css';
import { HamburgerProps } from './IHamburger';

const Hamburger: React.FC<HamburgerProps> = ({
  isOpen,
  toggleNavbar,
  customHumburgerCss,
  customHumburgerContainerCss,
  customHumburgerLinesCss,
  ariaLabel = 'menu for mobile/smaller devices',
  ariaExpanded = false, // Set to boolean type instead of string
  ariaControls = 'navbarMenu',
  ariaHasPopup = 'true',
}) => {
  return (
    <div
      className={`${customHumburgerContainerCss ?? 'hamburger-container display-upto-medium'} ${!isOpen ? 'custom-toggler' : ''}`}
      aria-expanded={ariaExpanded ? 'true' : 'false'} // Convert boolean to string for aria-expanded
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
    >
      <div
        className={`${customHumburgerCss ?? 'hamburger'} ${isOpen ? 'open' : ''}`}
        onClick={toggleNavbar}
        aria-label={ariaLabel}
      >
        <div className={`${customHumburgerLinesCss ?? 'line'}`}></div>
        <div className={`${customHumburgerLinesCss ?? 'line'}`}></div>
        <div className={`${customHumburgerLinesCss ?? 'line'}`}></div>
      </div>
    </div>
  );
};

export default Hamburger;
