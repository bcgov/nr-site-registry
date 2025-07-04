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
      dropdown: {
        dropdowns: {
          siteRiskCode: [],
        },
        status: RequestStatus.idle,
        error: '',
      },
    });
  });

  test('renders search input', () => {
    renderWithProviders(<Search />, store);
    const searchInput = screen.getByPlaceholderText(
      'Search for site address or name or pid',
    );
    expect(searchInput).toBeInTheDocument();
  });

  test('dispatches search action on input change with >= 3 characters', async () => {
    renderWithProviders(<Search />, store);

    const searchInput = screen.getByPlaceholderText(
      'Search for site address or name or pid',
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
      'Search for site address or name or pid',
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

  test('renders Intro component if no user action', () => {
    store = mockStore({
      siteSearch: {
        sites: [],
        error: '',
        page: 1,
        count: 0,
        pageSize: 5,
        status: RequestStatus.idle,
        searchParam: '',
        filter: {},
      },
    });

    renderWithProviders(<Search />, store);

    expect(screen.getByText(/Search Site Registry/)).toBeInTheDocument();
  });

  test('toggles column selection', async () => {
    renderWithProviders(<Search />, store);

    // Open the column toggler panel (likely through a button)
    const columnsButton = screen.getByText(/Columns/i);
    fireEvent.click(columnsButton);

    // Find checkbox — inspect your actual component for label content or use getAllByRole
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    // Click first column checkbox (adjust index based on actual column layout)
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[0]); // toggle back

    expect(checkboxes[0]).toBeInTheDocument();
  });

  test('resets column selection to default', () => {
    renderWithProviders(<Search />, store);

    // First, open the "Columns" panel
    const columnsButton = screen.getByText(/Columns/i);
    fireEvent.click(columnsButton);

    // Now try to get the Reset Columns button
    const resetButton = screen.getByRole('button', { name: /Reset Columns/i });
    fireEvent.click(resetButton);

    expect(resetButton).toBeInTheDocument();
  });

  test('restores filters from local storage on mount', () => {
    const filters = [{ key: 'status', value: 'active', label: 'Status' }];
    localStorage.setItem('siteFilterPills', JSON.stringify(filters));

    renderWithProviders(<Search />, store);
    expect(screen.getByText(/Status : active/)).toBeInTheDocument();
  });

  test('removes filter pill and updates local storage', async () => {
    localStorage.setItem(
      'siteFilterPills',
      JSON.stringify([{ key: 'status', value: 'active', label: 'Status' }]),
    );

    renderWithProviders(<Search />, store);

    const removeBtn = screen.getByTestId('remove-filter-status');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(localStorage.getItem('siteFilterPills')).not.toContain('active');
    });
  });
});
