import { act, render, screen } from '@testing-library/react';
import App from './App';
import { Provider } from 'react-redux';
import { useAuth } from 'react-oidc-context';
import { store } from './app/Store';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn(),
}));

const router = createBrowserRouter([
  {
    element: <App />,
    path: '/',
  },
]);

test('Renders Intro', () => {
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: false,
    events: {
      addAccessTokenExpiring: () => {},
    },
  });
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  const siteName = screen.getByText(/SITE/i);
  expect(siteName).toBeInTheDocument();
});

describe('Access token refresh', () => {
  it('should call refresh token methods if access token is expired and signs the user out if refresh fails', async () => {
    const userMock = { expired: true };
    const addAccessTokenExpiringMock = jest.fn();
    const signinSilentMock = jest.fn(() => Promise.resolve(null));
    const signoutSilentMock = jest.fn();

    (useAuth as jest.Mock).mockReturnValue({
      signinSilent: signinSilentMock,
      signoutSilent: signoutSilentMock,
      events: { addAccessTokenExpiring: addAccessTokenExpiringMock },
      user: userMock,
    });

    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );

    expect(addAccessTokenExpiringMock).toHaveBeenCalled();

    // Simulate the token expiring event
    const callback = addAccessTokenExpiringMock.mock.calls[0][0];
    await act(async () => {
      callback();
    });

    await expect(signinSilentMock).toHaveBeenCalled();
    expect(signoutSilentMock).toHaveBeenCalled();
  });

  it('should call refresh token methods if access token is expired does not sign out the user if refresh is successful', async () => {
    const userMock = { expired: true };
    const addAccessTokenExpiringMock = jest.fn();
    const signinSilentMock = jest.fn(() =>
      Promise.resolve({ someResolvedValue: 'that is not null' }),
    );
    const signoutSilentMock = jest.fn();

    (useAuth as jest.Mock).mockReturnValue({
      signinSilent: signinSilentMock,
      signoutSilent: signoutSilentMock,
      events: { addAccessTokenExpiring: addAccessTokenExpiringMock },
      user: userMock,
    });

    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );

    await expect(signinSilentMock).toHaveBeenCalled();
    expect(signoutSilentMock).not.toHaveBeenCalled();
  });

  it('should not call refresh token methods if access token valid', async () => {
    const userMock = { expired: false };
    const addAccessTokenExpiringMock = jest.fn();
    const signinSilentMock = jest.fn(() => Promise.resolve(null));
    const signoutSilentMock = jest.fn();

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      signinSilent: signinSilentMock,
      signoutSilent: signoutSilentMock,
      events: { addAccessTokenExpiring: addAccessTokenExpiringMock },
      user: userMock,
    });

    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );

    expect(addAccessTokenExpiringMock).toHaveBeenCalled();

    await expect(signinSilentMock).not.toHaveBeenCalled();
    expect(signoutSilentMock).not.toHaveBeenCalled();
  });
});
