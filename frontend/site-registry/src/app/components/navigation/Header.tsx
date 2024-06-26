import logo from "../../../app/images/logos/logo-banner.png";
import logoVertical from "../../../app/images/logos/logo-vertical.png"
import { useDispatch } from "react-redux";

import "./Header.css";
import moon from "../../images/moon.png";
import { BarsIcon } from "../common/icon";
import { useState } from "react";
import MobileNavMenu from "./MobileNavMenu";
import { ArrowDownIcon } from "../common/icon";
import LanguageSwitcher from "../language/LanguageSwitcher";
import UserAccount from "../account/UserAccount";
import Actions from "../action/Actions";
import { UserType } from "../../helpers/requests/userType";
import { updateUserType } from "../../features/site/dto/SiteSlice";
import { AppDispatch } from "../../Store";
import {LoginDropdown} from "../login/LoginDropdown"
import { getUser } from "../../helpers/utility";


const Header = () => {

  const [isOpen, setIsOpen] = useState(false);

  const user = getUser();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleUserClick = (value: string) => {
    switch(value)
    {
      case UserType.External :    
        dispatch(updateUserType(UserType.External));
       break;
      case UserType.Internal :
        dispatch(updateUserType(UserType.Internal));
       break;
      default:
       break;
    }
  }

  return (
    <header className="navbar">
      <div className="banner" tabIndex={1} role="navigation">
        <a href="https://gov.bc.ca">
          <img src={logo} className="logo" alt="BC Government Logo" />
          {/* <img src={logoVertical} className="logo" alt="BC Government Logo" /> */}
        </a>
        <h1 className="siteName">SITE</h1>
      </div>
      <div className="header-right-corner-section d-flex align-items-center">
        <LanguageSwitcher/>
       
         {/* <Actions label="User" items={ [
                { 
                    label:'External User',
                    value: UserType.External
                },
                {
                    label:'Internal User',
                    value: UserType.Internal
                },
                
            ]} 
            onItemClick={handleUserClick} />  */}
        <button
          className="navbar-toggler display-upto-medium no-bg-br-outline" 
          type="button"
          onClick={toggleNavbar} 
          aria-label="menu for mobile/smaller devices"
          aria-expanded={isOpen ? "true" : "false"}
          aria-controls="navbarMenu"
          aria-haspopup="true"
        >
          <BarsIcon className="bars-button" />
        </button>
        <div className="d-sm-none d-md-flex d-none">
          {/* Profile image */}
          <img src={moon} alt="Moon image for theme."/>
        </div>
        {user == null &&  LoginDropdown("Login")}
        {!isOpen && user !== null && <UserAccount  mobileView={isOpen}/>}
       
      </div>   
      <div role="menu"
        className={`small-screen-menu mobile-menu ${
          isOpen ? "show" : "d-none"
        }`}
        onClick={() => toggleNavbar()}
      >
        <MobileNavMenu toggleOpen={toggleNavbar} mobileView={isOpen}/>
      </div>
    </header>
  );
};

export default Header;
