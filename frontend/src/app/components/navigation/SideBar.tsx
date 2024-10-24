import React, { useEffect, useState } from 'react';
import './SideBar.css';
import { getSideBarNavList } from './dto/SideNav';
import { AnglesLeftIcon } from '../common/icon';
import { AnglesRightIcon } from '../common/icon';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from 'react-oidc-context';
import {
  cartItems,
  addCartItemRequestStatus,
  deleteRequestStatus,
  fetchCartItems,
} from '../../features/cart/CartSlice';
import { AppDispatch } from '../../Store';
import { getLoggedInUserType, showNotification } from '../../helpers/utility';

function SideBar() {
  let userCartItems = useSelector(cartItems);
  const dispatch = useDispatch<AppDispatch>();

  const [navList, SetNavList] = useState([]);

  let cartItemAdded = useSelector(addCartItemRequestStatus);
  let cartItemDeleted = useSelector(deleteRequestStatus);

  const { user } = useAuth();

  useEffect(() => {
    SetNavList(getSideBarNavList(getLoggedInUserType()));
  }, [user]);

  const cartItemsArr = useSelector(cartItems);

  const delteStatus = useSelector(deleteRequestStatus);

  useEffect(() => {
    dispatch(fetchCartItems(user?.profile.sub ? user.profile.sub : ''));
  }, [cartItemAdded, cartItemDeleted]);

  useEffect(() => {
    showNotification(
      cartItemAdded,
      'Successfully added site to cart',
      'Failed to add site to cart.',
    );
  }, [cartItemAdded]);

  useEffect(() => {
    showNotification(
      cartItemDeleted,
      'Successfully deleted site from cart',
      'Failed to delete site from cart.',
    );
  }, [cartItemDeleted]);

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
    <div className="side-bar position-sticky ">
      <div className="sideBar-Nav" role="menu">
        {navList
          .filter((item: any) => {
            return !item.lowerSection;
          })
          .map((item: any, index: number) => (
            <React.Fragment key={index}>
              {renderMenuOption(item, index)}
              {item.children &&
                item.children.map((child: any, index: number) => {
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
          .filter((item: any) => {
            return item.lowerSection;
          })
          .map((item: any, childIndex: number) => (
            <React.Fragment key={childIndex}>
              {renderMenuOption(item, childIndex)}
              {item.children &&
                item.children.map((item: any, index: number) => {
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
