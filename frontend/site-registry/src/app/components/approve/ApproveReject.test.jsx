import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import ApproveReject, { ApproveRejectButtons } from './ApproveReject';

const mockStore = configureStore([thunk]);

describe('Site Registry Review Tab', () => {
  let store;
  let testSiteRouter;
  let testBtnRouter;
  let mockHandler;

  beforeEach(() => {
    mockHandler = jest.fn();
    testSiteRouter = [
      {
        path: '/',
        element: <ApproveReject testId="approve-reject-contatiner-id" />,
      },
    ];
    testBtnRouter = [
      {
        path: '/',
        element: (
          <ApproveRejectButtons
            testId="approve-reject-contatiner-id"
            approveRejectHandler={mockHandler}
          />
        ),
      },
    ];

    store = mockStore({});
  });

  it('Renders Page', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );

    const pageComponent = screen.getByTestId('approve-reject-contatiner-id');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Renders Approval Reject Wrapper Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testBtnRouter)} />
      </Provider>,
    );

    const pageComponent = screen.getByTestId('approve-reject-actions-div');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Show Caret Right Icon on Initial Load', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );

    const pageComponent = screen.getByTestId('caret-right-icon');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Show DropDown Icon After Click', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );

    const component = screen.getByTestId('caret-right-icon');
    fireEvent.click(component);
    const dropDownIconComponent = screen.getByTestId('dropdown-icon');
    expect(dropDownIconComponent).toBeInTheDocument();
  });

  it('Show Child Content After Expand Content Action', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );

    const component = screen.getByTestId('caret-right-icon');
    fireEvent.click(component);
    const content = screen.getByTestId('child-content');
    expect(content).toBeInTheDocument();
  });

  it('Hide Child Content After Close Action', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );

    const component = screen.getByTestId('caret-right-icon');
    fireEvent.click(component);
    const dropDownIcon = screen.getByTestId('dropdown-icon');
    fireEvent.click(dropDownIcon);
    const content = screen.queryAllByTestId('child-content');
    expect(content).toHaveLength(0);
  });

  it('Callback Handler Called With False on Not Public Click', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testBtnRouter)} />
      </Provider>,
    );

    const component = screen.getByTestId('not-public-btn');
    fireEvent.click(component);

    expect(mockHandler).toBeCalledWith(false);
  });

  it('Callback Handler Called With False on Approve Click', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testBtnRouter)} />
      </Provider>,
    );

    const component = screen.getByTestId('approve-btn');
    fireEvent.click(component);

    expect(mockHandler).toBeCalledWith(true);
  });
});
