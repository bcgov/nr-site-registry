import { fireEvent, render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import NavigationPills from './NavigationPills';

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

const tabs = [
  { label: 'Summary', value: 'summary' },
  { label: 'Notations', value: 'notations' },
  { label: 'Documents', value: 'documents' },
];

const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
};

const renderPills = (
  entry: string,
  {
    path = '/site/details/:id',
    isDisable = false,
  }: { path?: string; isDisable?: boolean } = {},
) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path={path}
          element={
            <>
              <NavigationPills components={tabs} isDisable={isDisable} />
              <LocationDisplay />
              <Outlet />
            </>
          }
        >
          <Route path=":tab" element={<div data-testid="tab-body" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('URL-driven navigation pills', () => {
  it('highlights the pill that matches the path', () => {
    renderPills('/site/details/9/notations');
    const selected = screen.getAllByRole('button', { name: 'Notations' });
    expect(
      selected.some((button) => button.getAttribute('aria-current') === 'page'),
    ).toBe(true);
  });

  it('navigates to the sibling tab path when a pill is clicked', () => {
    renderPills('/site/details/9/summary');
    fireEvent.click(screen.getAllByRole('button', { name: 'Notations' })[0]);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations',
    );
  });

  it('preserves the query string when switching tabs', () => {
    renderPills('/site/details/9/summary?applicationId=abc');
    fireEvent.click(screen.getAllByRole('button', { name: 'Notations' })[0]);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations?applicationId=abc',
    );
  });

  it('navigates under a prefixed site details URL', () => {
    renderPills('/search/site/details/9/summary', {
      path: '/search/site/details/:id',
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Notations' })[0]);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/search/site/details/9/notations',
    );
  });

  it('navigates under dashboard, cart, and purchases prefixes', () => {
    const prefixes = [
      '/dashboard/site/details/:id',
      '/site/cart/site/details/:id',
      '/site-details/site/details/:id',
    ];

    prefixes.forEach((path) => {
      const prefix = path.replace('/:id', '/9');
      const view = renderPills(`${prefix}/summary`, { path });
      fireEvent.click(screen.getAllByRole('button', { name: 'Notations' })[0]);
      expect(screen.getByTestId('location')).toHaveTextContent(
        `${prefix}/notations`,
      );
      view.unmount();
    });
  });

  it('accepts a tab segment under create-site', () => {
    renderPills('/dashboard/site/create/summary', {
      path: '/dashboard/site/create',
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Documents' })[0]);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/dashboard/site/create/documents',
    );
  });

  it('navigates from the mobile carousel', () => {
    const { container } = renderPills('/site/details/9/summary');
    fireEvent.click(
      container.querySelector('.custom-nav-carousel-right-icon') as HTMLElement,
    );
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations',
    );
  });

  it('navigates from Select Page on small screens', () => {
    renderPills('/site/details/9/summary');
    fireEvent.click(screen.getByRole('button', { name: /Select Page/i }));
    const menuItems = screen.getAllByRole('button', { name: 'Notations' });
    fireEvent.click(menuItems[menuItems.length - 1]);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations',
    );
  });

  it('does not navigate when pills are disabled', () => {
    renderPills('/site/details/9/notations', { isDisable: true });
    fireEvent.click(screen.getAllByRole('button', { name: 'Summary' })[0]);
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/notations',
    );
  });

  it('keeps the current tab highlighted when other pills are disabled', () => {
    renderPills('/site/details/9/notations', { isDisable: true });
    const selected = screen.getAllByRole('button', { name: 'Notations' });
    expect(
      selected.some((button) => button.getAttribute('aria-current') === 'page'),
    ).toBe(true);
  });
});
