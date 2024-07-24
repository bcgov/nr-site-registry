import React, { useEffect, useState } from 'react';
import './SideBar.css';
import { getSideBarNavList } from './dto/SideNav';
import { AnglesLeftIcon } from '../common/icon';
import { AnglesRightIcon } from '../common/icon';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  cartItems,
  addCartItemRequestStatus,
  deleteRequestStatus,
  fetchCartItems,
} from '../../features/cart/CartSlice';
import { AppDispatch } from '../../Store';
import { getUser } from '../../helpers/utility';

function SideBar() {
  let userCartItems = useSelector(cartItems);
  const dispatch = useDispatch<AppDispatch>();

  let cartItemAdded = useSelector(addCartItemRequestStatus);
  let cartItemDeleted = useSelector(deleteRequestStatus);

  const user = getUser();

  const cartItemsArr = useSelector(cartItems);

  const delteStatus = useSelector(deleteRequestStatus);

  useEffect(() => {
    dispatch(fetchCartItems(user?.profile.sub ? user.profile.sub : ''));
  }, [cartItemAdded, cartItemDeleted]);

  const navList = getSideBarNavList();
  const location = useLocation();
  let tabIndex = 1;

  const renderMenuOption = (item: any, index: number) => {
    ++tabIndex;

    const isCurrentPath = location.pathname === item.linkTo;

    const isParentGroup: boolean = item.displayText && !item.icon;

    return (
      <section
        tabIndex={tabIndex}
        aria-label={item.displayText}
        aria-roledescription="menu"
        role={isParentGroup ? 'group' : 'menuitem'}
        className={`sideBar-NavItem ${isCurrentPath && item.icon ? 'currentPath' : ''}`}
      >
        {item.icon && <item.icon className="sideBar-Icon" />}
        {item.linkTo.indexOf('cart') === -1 &&
          item.displayText &&
          item.icon && (
            <Link
              to={item.linkTo}
              className={`sideBarDisplayText nav-section-bold-label nav-color-primary-default`}
              aria-label={item.displayText}
              role="menuitem"
            >
              {item.displayText}
            </Link>
          )}
        {item.linkTo.indexOf('cart') !== -1 &&
          userCartItems &&
          userCartItems.length === 0 &&
          item.icon && (
            <Link
              to={item.linkTo}
              className={`sideBarDisplayText nav-section-bold-label nav-color-primary-default`}
              aria-label={item.displayText}
              role="menuitem"
            >
              {userCartItems.length}
            </Link>
          )}
        {item.linkTo.indexOf('cart') !== -1 &&
          userCartItems &&
          userCartItems.length > 0 &&
          item.icon && (
            <Link
              to={item.linkTo}
              className={`sideBarDisplayText cart-items-number nav-section-bold-label nav-color-primary-default`}
              aria-label={item.displayText}
              role="menuitem"
            >
              {userCartItems.length}
            </Link>
          )}
        {item.displayText && !item.icon && (
          <span
            className="nav-section-bold-label nav-color-secondary"
            aria-label={item.displayText}
            role="menuitem"
          >
            {item.displayText}
          </span>
        )}
      </section>
    );
  };

  return (
    <div className="side-bar">
      <div className="sideBar-Nav" role="menu">
        {navList
          .filter((item) => {
            return !item.lowerSection;
          })
          .map((item, index) => (
            <React.Fragment key={index}>
              {renderMenuOption(item, index)}
              {item.children &&
                item.children.map((child, index) => {
                  return (
                    <React.Fragment key={index}>
                      {renderMenuOption(child, index)}
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          ))}
      </div>

      <div className="sideBar-Nav" role="menu">
        {navList
          .filter((item) => {
            return item.lowerSection;
          })
          .map((item, childIndex) => (
            <React.Fragment key={childIndex}>
              {renderMenuOption(item, childIndex)}
              {item.children &&
                item.children.map((item, index) => {
                  return renderMenuOption(item, index);
                })}
              {/* Additional static item */}
              {/* <div className="sideBar-NavItem arrows">
                <AnglesLeftIcon className="sideBar-Icon arrow-right" />
                <AnglesRightIcon className="sideBar-Icon arrow-left" />
              </div> */}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}

export default SideBar;
