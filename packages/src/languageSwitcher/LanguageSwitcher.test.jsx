import { render, fireEvent, screen, waitFor  } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);
describe('Language Switcher Component', () => {
  let store;
  const mockLanguageChange = jest.fn();
  // Define available languages
  const LANGUAGES = [
    {
      key: 'ar',
      value: 'العربية (Arabic)',
    },
    {
      key: 'zh-CN',
      value: '简体字 (Chinese - Simplified)',
    },
    {
      key: 'en',
      value: 'English',
    },
    {
      key: 'es',
      value: 'Español (Spanish)',
    },
    {
      key: 'fr',
      value: 'Français (French)',
    },
    {
      key: 'it',
      value: 'Italiano (Italian)',
    },
    {
      key: 'ru',
      value: 'Pусский (Russian)',
    },
  ];
  const defaultProps = {
    languages: LANGUAGES,
    defaultLanguage: "en",
    onLanguageChange: mockLanguageChange,
  };
  beforeEach(() => {
    mockLanguageChange.mockClear();
    store = mockStore({
      LanguageSwitcher: {},
    });
  });

  it('should render with default language and toggle button', () => {
    render(  <Provider store={store}><LanguageSwitcher {...defaultProps} /></Provider>);

    // Check if the current language (default "en") is displayed in the toggle button
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should open the dropdown when the toggle button is clicked', () => {
    render(  <Provider store={store}><LanguageSwitcher {...defaultProps} /></Provider>);

    // Click the language toggle button
    fireEvent.click(screen.getByLabelText(/language menu/i));

    // Check if the menu is now visible
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('custom-menu mt-4');
    expect(menu).toBeVisible();
  });

  it('should close the dropdown when a language is selected', () => {
    render(  <Provider store={store}><LanguageSwitcher {...defaultProps} /></Provider>);

    // Step 1: Open the dropdown by clicking the language toggle button
    fireEvent.click(screen.getByLabelText(/language menu/i));

    // Step 2: Ensure the menu is open and check if "French" is present
    const frenchMenuItem = screen.getByRole('menuitem', { name: /french/i });
    expect(frenchMenuItem).toBeInTheDocument();  // Ensure French is in the dropdown

    // Step 3: Select "French"
    fireEvent.click(frenchMenuItem);

    // Step 4: Wait for the dropdown to close (ensure the menu no longer exists)
    waitFor(() => {
      const menu = screen.queryByRole('menu');  // Use queryByRole to avoid errors if the menu is not found
      expect(menu).toBeNull();  // Assert that the menu is no longer in the DOM
    });

    // Step 5: Verify that the onLanguageChange function was called with "fr"
    expect(mockLanguageChange).toHaveBeenCalledWith('fr');

    // Step 6: Ensure that the selected language ("French") is now the current language
    expect(screen.getByLabelText(/language menu/i)).toHaveTextContent('FR');  // The button should now display "FR"
  
  });

  it('should display the correct tick icon next to the selected language', () => {
    render(  <Provider store={store}><LanguageSwitcher {...defaultProps} /></Provider>);

    // Open the dropdown
    fireEvent.click(screen.getByLabelText(/language menu/i));

    // Check that the "English" option has the tick icon next to it
    const englishItem = screen.getByText('English').parentElement;
    const tickIcon = englishItem?.querySelector('svg');
    expect(tickIcon).toHaveClass('tick-icon');
  });

  it('should close the dropdown when clicked outside', () => {
    render(  <Provider store={store}><LanguageSwitcher {...defaultProps} /></Provider>);

    // Open the dropdown
    fireEvent.click(screen.getByLabelText(/language menu/i));

    // Click outside the dropdown (simulate click on document body)
    fireEvent.click(document.body);

    // Ensure the dropdown menu is no longer visible
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should apply custom CSS classes to the elements', () => {
    render(  <Provider store={store}><LanguageSwitcher {...defaultProps} /></Provider>);

    // Open the dropdown
    fireEvent.click(screen.getByLabelText(/language menu/i));
    
    // Check if custom toggle CSS class is applied
    const toggleButton = screen.getByLabelText(/language menu/i);
    expect(toggleButton).toHaveClass('custom-toggle');

    // Check if custom menu CSS class is applied
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('custom-menu');

    // Check if custom menu item CSS class is applied
    const menuItem = screen.getByText('English').parentElement;
    expect(menuItem).toHaveClass('custom-item d-flex w-100 align-items-center');
  });

  it('should render custom placeholder text when no language is selected', () => {
    const propsWithCustomPlaceholder = {
      ...defaultProps,
      customPlaceholderText: 'Select a language...',
    };
    render(  <Provider store={store}><LanguageSwitcher {...propsWithCustomPlaceholder} /></Provider>);

    // Open the dropdown
    fireEvent.click(screen.getByLabelText(/language menu/i));

    // Check if custom placeholder text is displayed
    const placeholder = screen.getByText('Select a language...');
    expect(placeholder).toBeInTheDocument();
  });

});
