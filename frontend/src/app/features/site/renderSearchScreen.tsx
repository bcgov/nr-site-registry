import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import siteSearchReducer from './SiteSearchSlice';
import dropdownReducer from '../details/dropdowns/DropdownSlice';

const apollo = new ApolloClient({ cache: new InMemoryCache() });

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

export function renderSearchScreen(ui: ReactNode, initialEntry = '/') {
  const store = configureStore({
    reducer: {
      siteSearch: siteSearchReducer,
      dropdown: dropdownReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  const view = render(
    <Provider store={store}>
      <ApolloProvider client={apollo}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
              {ui}
            </QueryParamProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </ApolloProvider>
    </Provider>,
  );

  return { store, ...view };
}
