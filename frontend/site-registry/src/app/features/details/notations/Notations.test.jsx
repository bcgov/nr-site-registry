import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Notations from './Notations';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';

const mockStore = configureStore([thunk]);
describe('Notations component', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
        Notations: {},
        sites: { 
          siteDetailsMode: SiteDetailsMode.ViewOnlyMode,
          }
        });
    });
  it('renders Notations component', () => {
      render(<Provider store={store}><Notations /></Provider>);
      const notationsComponent = screen.getByTestId('notations-component');
      expect(notationsComponent).toBeInTheDocument();
  });

  it('search functionality works correctly', () => {
    render(<Provider store={store}><Notations /></Provider>);
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'CERTIFICATE' } });
    const notationRows = screen.getByTestId('notation-rows');
    expect(notationRows.children.length).toBeGreaterThan(0); 
  });

  it('clearing the search works correctly', () => {
    const { container } =  render(<Provider store={store}><Notations /></Provider>);
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'CERTIFICATE' } });
    const clearIcon = container.querySelector('#clear-icon'); 
    expect(clearIcon).toBeInTheDocument();
    fireEvent.click(clearIcon);
    const notationRows = screen.getByTestId('notation-rows');
    expect(notationRows.children.length).toBeGreaterThan(0); 
  });
});
