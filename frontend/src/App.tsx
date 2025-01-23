import { useCallback, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import './App.css';
import Header from './app/components/navigation/Header';
import { Outlet } from 'react-router-dom';
import '@bcgov/bc-sans/css/BCSans.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideBar from './app/components/navigation/SideBar';
import '@bcgov/bc-sans/css/BCSans.css';

function App() {
  const { isAuthenticated, signinSilent, events, user, signoutSilent } =
    useAuth();

  const tryTokenRefresh = useCallback(() => {
    signinSilent().then((data) => {
      // Refresh failed, this usually means that refresh token is invalid or expired.
      // Sign out the user and clear the token data in this case.
      if (data === null) {
        signoutSilent();
      }
    });
  }, [signinSilent, signoutSilent]);

  useEffect(() => {
    if (user?.expired) {
      tryTokenRefresh();
    }
    // the `return` is important - addAccessTokenExpiring() returns a cleanup function
    return events.addAccessTokenExpiring(() => {
      tryTokenRefresh();
    });
  }, [events, isAuthenticated, user, tryTokenRefresh]);

  return (
    <div className="container-fluid p-0">
      <Header />
      <div className="row m-0 p-0">
        <div className="col-auto p-0 display-from-medium sidebar-container">
          <SideBar />
        </div>
        <div className="col p-0">
          <Outlet />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
