// Header.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header'; // Import your Header component
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);
describe('Header Component', () => {
  const mockToggle = jest.fn();
  const mockClickThemeSwitcher = jest.fn();

  const defaultProps = {
    onToggle: mockToggle,
    isToggled: false,
    customHeaderCss: 'custom-header',
    headerLogo: 'logo.png',
    headerLogoAnchorURL: 'https://example.com',
    headerName: 'Example Site',
    customHamBurgerIconBtnCss: 'custom-btn',
    customHamBurgerIconCss: 'custom-icon',
    customThemeIcon: 'moon-icon.png',
    customThemeIconCss: 'theme-icon',
    customThemeCss: 'theme-css',
    onClickThemeSwitcher: mockClickThemeSwitcher,
  };

  let store;
  beforeEach(() => {
    store = mockStore({
      Header: {},
    });
  });

  it('should render the header with default elements', () => {
    render(
        <Provider store={store}>
             <Header {...defaultProps} />
        </Provider>
    );

    // Check for the logo
    const logo = screen.getByAltText(/bc government logo/i);
    expect(logo).toBeInTheDocument();

    // Check for the site name
    const siteName = screen.getByText(/Example Site/i);
    expect(siteName).toBeInTheDocument();

    // Check for the theme switcher image
    const themeSwitcher = screen.getByAltText(/moon image for theme/i);
    expect(themeSwitcher).toBeInTheDocument();
  });

  it('should toggle navbar visibility when the hamburger button is clicked', () => {
    render(<Header {...defaultProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /menu for mobile\/smaller devices/i,
    });

    fireEvent.click(hamburgerButton);
    expect(mockToggle).toHaveBeenCalledWith(true); // isToggled changes to true
  });

  it('should toggle the dropdown menu when the toggle button is clicked', () => {
    render(<Header {...defaultProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /menu for mobile\/smaller devices/i,
    });

    fireEvent.click(hamburgerButton); // First click to toggle
    let mobileMenu = screen.queryByRole('menu');
    expect(mobileMenu).toHaveClass('small-screen-menu mobile-menu d-none');

    fireEvent.click(hamburgerButton); // Second click to toggle back
    mobileMenu = screen.queryByRole('menu');
    expect(mobileMenu).toHaveClass('d-none');
  });

  it('should call the theme switcher function when theme image is clicked', () => {
    render(<Header {...defaultProps} />);

    const themeSwitcher = screen.getByAltText(/moon image for theme/i);
    fireEvent.click(themeSwitcher);

    expect(mockClickThemeSwitcher).toHaveBeenCalledTimes(1); // Check if onClickThemeSwitcher is called
  });

  it('should render custom CSS classes for header and theme switcher', () => {
    render(<Header {...defaultProps} />);

    // Check if custom header class is applied
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toHaveClass('custom-header');

    // Check if theme switcher has custom classes
    const themeSwitcher = screen.getByAltText(/moon image for theme/i);
    expect(themeSwitcher).toHaveClass('theme-icon');
  });

  it('should render the header logo with correct link and image', () => {
    render(<Header {...defaultProps} />);

    const logoLink = screen.getByRole('link', { name: /bc government logo/i });
    expect(logoLink).toHaveAttribute('href', 'https://example.com');

    const logoImage = screen.getByAltText(/bc government logo/i);
    expect(logoImage).toHaveAttribute('src', 'logo.png');
  });

  it('should render the correct site name', () => {
    render(<Header {...defaultProps} />);

    const siteName = screen.getByText('Example Site');
    expect(siteName).toBeInTheDocument();
  });

  it('should display mobile navigation when isToggled is true', () => {
    render(<Header {...defaultProps} isToggled={true} />);

    const mobileMenu = screen.getByRole('menu');
    expect(mobileMenu).toHaveClass('show');
  });

  it('should not display mobile navigation when isToggled is false', () => {
    render(<Header {...defaultProps} isToggled={false} />);

    const mobileMenu = screen.queryByRole('menu');
    expect(mobileMenu).toHaveClass('d-none');
  });
});
