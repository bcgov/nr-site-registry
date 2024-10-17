import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import SRUpdatesTables from './srUpdatesTables';
import { render, fireEvent, screen } from '@testing-library/react';

const mockStore = configureStore([thunk]);

describe('Site Registry Approvals Table', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      srReview: {
        sites: [],
      },
      dropdown: {
        dropdowns: {
          internalUserList: [],
        },
      },
    });
  });

  it('Renders Page', () => {
    render(
      <Provider store={store}>
        <SRUpdatesTables />
      </Provider>,
    );
    const pageComponent = screen.getByTestId('srreviewtable-component');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Shows filter section on click', () => {
    render(
      <Provider store={store}>
        <SRUpdatesTables />
      </Provider>,
    );

    const filterTab = screen.getByTestId('filters');
    fireEvent.click(filterTab);
    const sectionComponent = screen.getByTestId('sr-update-filter-section');
    expect(sectionComponent).toBeInTheDocument();
  });

  it('Hides filter section on Reset click', () => {
    render(
      <Provider store={store}>
        <SRUpdatesTables />
      </Provider>,
    );

    const filterTab = screen.getByTestId('filters');
    fireEvent.click(filterTab);
    const resetBtn = screen.getByTestId('cancel-filter');
    fireEvent.click(resetBtn);
    const sectionComponent = screen.queryByTestId('sr-update-filter-section');
    expect(sectionComponent).toBeNull();
  });

  it('Renders table  section', () => {
    render(
      <Provider store={store}>
        <SRUpdatesTables />
      </Provider>,
    );
    const component = screen.getByTestId('srreview-table');
    expect(component).toBeInTheDocument();
  });

  it('Renders Approve  button', () => {
    render(
      <Provider store={store}>
        <SRUpdatesTables />
      </Provider>,
    );
    const component = screen.getByTestId('approve-btn');
    expect(component).toBeInTheDocument();
  });

  it('Renders Reject  button', () => {
    render(
      <Provider store={store}>
        <SRUpdatesTables />
      </Provider>,
    );
    const component = screen.getByTestId('reject-btn');
    expect(component).toBeInTheDocument();
  });
});
