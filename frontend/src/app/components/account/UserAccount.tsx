import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import './UserAccount.css';
import { DropdownIcon, DropdownUpIcon } from '../common/icon';
import { useAuth } from 'react-oidc-context';
import { getUser } from '../../helpers/utility';
import Avatar from '../avatar/Avatar';

const UserAccount = (props: any) => {
  const authRedirectUri =
    ((window as any)._env_ &&
      (window as any)._env_.REACT_APP_AUTH_LOGOUT_REDIRECT_URI) ||
    process.env.REACT_APP_AUTH_LOGOUT_REDIRECT_URI;
  const auth = useAuth();
  const loggedInUser = getUser();

  const user = {
    firstname: loggedInUser?.profile.given_name,
    lastName: loggedInUser?.profile.family_name,
  };

  const [dropdownArrow, setDropdownArrow] = useState(false);
  const toggleButton = (event: any) => {
    event.stopPropagation();
    setDropdownArrow(!dropdownArrow);
  };

  if (props.mobileView) {
    return (
      <>
        {/* Dropdown component for user account */}
        <div aria-label="User Account" className="d-md-none">
          <div role="navigation">
            {/* Logged in as label */}
            <div className="account-custom-label" id="user-account-label">
              Logged in as:
            </div>
            {/* Dropdown toggle button */}
            <div
              role="button"
              className="account-username py-3 d-flex align-items-center"
              aria-expanded={dropdownArrow}
              aria-controls="account-menu"
              aria-labelledby="user-account-label"
              onClick={toggleButton}
            >
              {/* Profile image */}
              <Avatar firstName={user.firstname} lastName={user.lastName} />
              {/* User name */}
              <div id="user-name" className="user-name">
                {user.firstname}
              </div>
              <div
                id="account-dropdown"
                className="account-custom-toggle-mobile align-item-center"
                aria-label="Account Menu Button"
              >
                {dropdownArrow ? <DropdownUpIcon /> : <DropdownIcon />}
              </div>
            </div>
          </div>
          {dropdownArrow && (
            <div
              role="menu"
              id="account-menu"
              aria-labelledby="account-dropdown"
              className="p-0"
            >
              {/* Logout */}
              <div
                role="menuitem"
                aria-label="Log Out"
                tabIndex={0} // Make focusable with keyboard
                className="account-custom-item-mobile"
                onClick={() => {
                  auth.removeUser().then(() => {
                    window.location.href = authRedirectUri;
                  });
                }}
              >
                Log Out
              </div>
            </div>
          )}
        </div>
      </>
    );
  } else {
    return (
      <>
        {/* Dropdown component for user account */}
        <Dropdown
          aria-label="User Account"
          className="d-md-flex justify-content-between d-sm-none d-none"
        >
          {/* Dropdown toggle button */}
          <div className="d-flex">
            <Dropdown.Toggle
              id="account-dropdown"
              variant=""
              className="account-custom-toggle p-0"
              aria-label="Account Menu"
            >
              {/* Profile image */}
              <div
                className="d-flex align-items-center "
                onClick={() => setDropdownArrow(!dropdownArrow)}
              >
                <Avatar firstName={user.firstname} lastName={user.lastName} />
                <div
                  id="account-dropdown"
                  className="ps-2"
                  aria-label="Account Menu Button"
                >
                  {dropdownArrow ? <DropdownUpIcon /> : <DropdownIcon />}
                </div>
              </div>
            </Dropdown.Toggle>
          </div>
          {/* Dropdown menu */}
          <Dropdown.Menu
            className="account-custom-menu"
            role="menu"
            aria-labelledby="account-dropdown"
          >
            {/* Logged in as label */}
            <Dropdown.Item
              role="menuitem"
              className="account-custom-item-first"
              disabled
              aria-disabled="true"
            >
              <div className="account-custom-label">Logged in as:</div>
              <div className="d-flex align-items-center account-username py-3 ">
                {/* Profile image */}
                <Avatar firstName={user.firstname} lastName={user.lastName} />
                {/* User name */}
                <span className="px-2">{user.firstname}</span>
              </div>
            </Dropdown.Item>
            <div className="pt-3">
              {/* Logout */}
              <Dropdown.Item
                role="menuitem"
                className="account-custom-item"
                aria-label="Log Out"
                onClick={() => {
                  auth.removeUser().then(() => {
                    window.location.href = authRedirectUri;
                    localStorage.removeItem('siteFilterPills');
                  });
                }}
              >
                Log Out
              </Dropdown.Item>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
};

export default UserAccount;
