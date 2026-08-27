import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import './index.css';
import reportWebVitals from './reportWebVitals';
import { store } from './app/Store';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { UserManagerSettings } from 'oidc-client-ts';
import { getClientSettings } from './app/auth/UserManagerSetting';
import { handleSigninCallback } from './app/auth/returnUrl';
import { RouterProvider } from 'react-router-dom';
import siteRouter from './app/routes/Routes';
import { getLoggedInUserType, getUser } from './app/helpers/utility';
import { API, GRAPHQL } from './app/helpers/endpoints';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLDivElement,
);

const httpLink = createHttpLink({
  uri: `${API}${GRAPHQL}`,
});

const authLink = setContext((_, { headers }) => {
  const user = getUser();

  return {
    headers: {
      ...headers,
      authorization: user?.access_token ? `Bearer ${user.access_token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const authOptions: UserManagerSettings = getClientSettings();

function AppWrapper() {
  const [userType, setUserType] = React.useState(getLoggedInUserType());
  const { isAuthenticated, signinSilent, events, user, signoutSilent } =
    useAuth();

  useEffect(() => {
    setUserType(getLoggedInUserType());
  }, [user]);

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
    <ApolloProvider client={client}>
      <Provider store={store}>
        <RouterProvider router={siteRouter(userType)} />
      </Provider>
    </ApolloProvider>
  );
}

root.render(
  <React.StrictMode>
    <AuthProvider {...authOptions} onSigninCallback={handleSigninCallback}>
      <AppWrapper />
    </AuthProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
