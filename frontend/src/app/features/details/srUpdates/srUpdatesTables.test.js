import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import SRUpdatesTables from './srUpdatesTables';
import { render, fireEvent, screen } from '@testing-library/react';
import * as utility from '../../../helpers/utility';

const mockStore = configureStore([thunk]);

function renderQueue(store) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <SRUpdatesTables />
          </QueryParamProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

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
    jest.spyOn(utility, 'getAxiosInstance').mockReturnValue({
      post: jest.fn().mockResolvedValue({
        data: {
          data: {
            getPendingSiteForSRApproval: {
              httpStatusCode: 200,
              data: { data: [], totalRecords: 0 },
            },
          },
        },
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Renders Page', async () => {
    renderQueue(store);
    expect(
      await screen.findByTestId('srreviewtable-component'),
    ).toBeInTheDocument();
  });

  it('Shows filter section on click', async () => {
    renderQueue(store);
    await screen.findByTestId('srreviewtable-component');

    const filterTab = screen.getByTestId('filters');
    fireEvent.click(filterTab);
    const sectionComponent = screen.getByTestId('sr-update-filter-section');
    expect(sectionComponent).toBeInTheDocument();
  });

  it('Hides filter section on Reset click', async () => {
    renderQueue(store);
    await screen.findByTestId('srreviewtable-component');

    const filterTab = screen.getByTestId('filters');
    fireEvent.click(filterTab);
    const resetBtn = screen.getByTestId('cancel-filter');
    fireEvent.click(resetBtn);
    const sectionComponent = screen.queryByTestId('sr-update-filter-section');
    expect(sectionComponent).toBeNull();
  });

  it('Renders table  section', async () => {
    renderQueue(store);
    expect(await screen.findByTestId('srreview-table')).toBeInTheDocument();
  });

  it('Renders Approve  button', async () => {
    renderQueue(store);
    expect(await screen.findByTestId('approve-btn')).toBeInTheDocument();
  });

  it('Renders Reject  button', async () => {
    renderQueue(store);
    expect(await screen.findByTestId('reject-btn')).toBeInTheDocument();
  });
});
