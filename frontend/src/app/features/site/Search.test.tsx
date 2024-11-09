import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import Search from './Search';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { RequestStatus } from '../../helpers/requests/status';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const mockStore = configureStore([thunk]);

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn().mockReturnValue({ isAuthenticated: false }),
}));

describe('Search Component', () => {
  let store: any;

  const client = new ApolloClient({
    cache: new InMemoryCache(),
  });

  beforeEach(() => {
    store = mockStore({
      sites: {
        sites: [],
      },
      error: '',
      fetchStatus: RequestStatus.idle,
      deleteStatus: RequestStatus.idle,
      addedStatus: RequestStatus.idle,
      updateStatus: RequestStatus.idle,
    });
  });

  test('renders search input', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <ApolloProvider client={client}>
          <Search />
        </ApolloProvider>
      </Provider>,
    );
    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
  });
});
