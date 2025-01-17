import React from 'react';
import { getSideBarNavList } from './dto/SideNav';
import './MobileNavMenu.css';
import { Link, useLocation } from 'react-router-dom';
import UserAccount from '../account/UserAccount';
import { getLoggedInUserType } from '../../helpers/utility';

const MobileNavMenu = (props: any) => {
  const location = useLocation();
  const menuOptions = getSideBarNavList(getLoggedInUserType());

  return (
    <div className="mobile-nav-container me-1 mt-2">
      <div className="mobile-nav">
        <div className="mobile-nav-top">
          {menuOptions.map((item: any, index: number) => {
            return (
              <div key={index}>
                <div className="mobile-nav-menu-item flex-column" role="menu">
                  <div
                    className={`"mobile-nav-menu-item flex-row" 
                      ${location.pathname === item.linkTo && item.icon ? 'mobile-nav-menu-item-active ' : ''}
                      ${item.icon ? 'mobile-nav-menu-item-child mobile-nav-section-bold-label' : ''}
                      `}
                    role="menuitem"
                    aria-label={item.displayText}
                  >
                    <Link to={item.linkTo} className="d-flex">
                      <div className="d-flex align-items-center">
                        {item.icon && (
                          <item.icon className="sideBar-Icon me-2" />
                        )}
                        {item.displayText && !item.icon && (
                          <span className="mobile-nav-section-bold-label mobile-nav-color-secondary ">
                            {item.displayText}
                          </span>
                        )}
                      </div>
                      {item.displayText && item.icon && (
                        <span className="mobile-nav-section-bold-label mobile-nav-color-primary-default sideBarText">
                          {item.displayText}
                        </span>
                      )}
                    </Link>
                  </div>

                  {item.children &&
                    item.children.map((item: any, index: number) => {
                      return (
                        <div
                          key={index}
                          role="menuitem"
                          aria-label={item.displayText}
                          className={`"mobile-nav-menu-item mobile-nav-menu-item-child mobile-nav-section-bold-label"
                            ${location.pathname === item.linkTo && item.icon ? 'mobile-nav-menu-item-active' : ''}
                            `}
                        >
                          <Link to={item.linkTo} className="d-flex">
                            <div className="d-flex align-items-center">
                              {item.icon && (
                                <item.icon className="sideBar-Icon me-2" />
                              )}
                              <span className="mobile-nav-section-bold-label mobile-nav-color-primary-default sideBarText">
                                {item.displayText}
                              </span>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mobile-nav-user-section">
          <UserAccount mobileView={props.mobileView} />
        </div>
      </div>
    </div>
  );
};

export default MobileNavMenu;
