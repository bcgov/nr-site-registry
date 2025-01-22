import logo from '../../../app/images/logos/logo-banner.png';
import './Header.css';
import { useState } from 'react';
import MobileNavMenu from './MobileNavMenu';
import UserAccount from '../account/UserAccount';
import { LoginDropdown } from '../login/LoginDropdown';
import { getUser } from '../../helpers/utility';
import Hamburger from '../hamburger/Hamburger';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const user = getUser();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="navbar position-sticky navbar-for-small-device">
      <div className="banner" tabIndex={1} role="navigation">
        <a href="https://gov.bc.ca">
          <img src={logo} className="logo" alt="BC Government Logo" />
        </a>
        <a href="/" className="no-link-style">
          <h1 className="siteName">Site Remediation</h1>
        </a>
      </div>
      <div className="header-right-corner-section d-flex align-items-center">
        {/* <LanguageSwitcher /> */}
        <Hamburger
          isOpen={isOpen}
          toggleNavbar={toggleNavbar}
          ariaLabel="menu for mobile/smaller devices"
          ariaExpanded={isOpen}
          ariaControls="navbarMenu"
          ariaHasPopup="true"
        />

        {/* <div className="d-sm-none d-md-flex d-none">       
          <img src={moon} alt="Moon image for theme." />
        </div> */}
        {user == null && LoginDropdown('Sign in')}
        {!isOpen && user !== null && <UserAccount mobileView={isOpen} />}
      </div>
      <div
        role="menu"
        className={`small-screen-menu mobile-menu ${
          isOpen ? 'show' : 'd-none'
        }`}
        onClick={() => toggleNavbar()}
      >
        <MobileNavMenu
          toggleOpen={toggleNavbar}
          mobileView={isOpen}
          user={user}
        />
      </div>
    </header>
  );
};

export default Header;
