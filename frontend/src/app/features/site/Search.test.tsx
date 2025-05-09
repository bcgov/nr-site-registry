import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { RequestStatus } from '../../helpers/requests/status';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MemoryRouter } from 'react-router-dom';
import Search from './Search';
import { waitFor } from '@testing-library/react';

const mockStore = configureStore([thunk]);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock OIDC
jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn().mockReturnValue({ isAuthenticated: false }),
}));

// Apollo client for test
const client = new ApolloClient({
  cache: new InMemoryCache(),
});

// Reusable render function with providers
const renderWithProviders = (
  ui: JSX.Element | React.ReactElement,
  store: any,
) => {
  return render(
    <Provider store={store}>
      <ApolloProvider client={client}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ApolloProvider>
    </Provider>,
  );
};

describe('Search Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      siteSearch: {
        sites: [{ id: 1, name: 'Test Site' }],
        error: '',
        page: 1,
        count: 1,
        pageSize: 5,
        status: RequestStatus.success,
        searchParam: 'Test',
        filter: {},
      },
    });
  });

  test('renders search input', () => {
    renderWithProviders(<Search />, store);
    const searchInput = screen.getByPlaceholderText(
      'Search for site address or name',
    );
    expect(searchInput).toBeInTheDocument();
  });

  test('dispatches search action on input change with >= 3 characters', async () => {
    renderWithProviders(<Search />, store);

    const searchInput = screen.getByPlaceholderText(
      'Search for site address or name',
    );
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: expect.stringContaining('fetchSearchSites'),
          }),
        ]),
      );
    });
  });

  test('clears search input when clear button is clicked', () => {
    renderWithProviders(<Search />, store);

    const searchInput = screen.getByPlaceholderText(
      'Search for site address or name',
    );
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });
});
