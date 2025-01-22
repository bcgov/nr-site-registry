import { useEffect } from 'react';
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
  const { isAuthenticated, signinSilent, events, user } = useAuth();

  useEffect(() => {
    if (user?.expired) {
      // Access token expired, trying to refresh
      signinSilent();
    }
    // the `return` is important - addAccessTokenExpiring() returns a cleanup function
    return events.addAccessTokenExpiring(() => {
      signinSilent();
    });
  }, [events, signinSilent, isAuthenticated, user]);

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
