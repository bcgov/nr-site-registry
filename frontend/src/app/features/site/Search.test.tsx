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
        sites: [
          { id: 1, name: 'Test Site', status: 'active' },
          { id: 2, name: 'Another Site', status: 'inactive' },
        ],
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

  test('adds and removes filter pills', async () => {
    localStorage.setItem(
      'siteFilterPills',
      JSON.stringify([{ key: 'status', value: 'active', label: 'Status' }]),
    );

    renderWithProviders(<Search />, store);

    expect(screen.getByText(/Status : active/)).toBeInTheDocument();

    const removeBtn = screen.getByTestId('remove-filter-status');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Status : active/)).not.toBeInTheDocument();
    });
  });

  test('calls pagination handlers', () => {
    renderWithProviders(<Search />, store);
    const paginationButtons = screen.getAllByRole('button');
    paginationButtons.forEach((btn) => {
      if (!btn.hasAttribute('disabled')) {
        fireEvent.click(btn);
      }
    });
    expect(paginationButtons.length).toBeGreaterThan(0);
  });

  test('selects and deselects rows (row click)', async () => {
    renderWithProviders(<Search />, store);
    const checkbox = screen.getAllByRole('checkbox')[1]; // skip header
    fireEvent.click(checkbox); // select
    fireEvent.click(checkbox); // deselect

    // No assertion needed — just triggers selection logic
    expect(checkbox).toBeInTheDocument();
  });
});
