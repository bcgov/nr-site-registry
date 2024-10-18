import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Associate from './Associate';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { GetAssociateConfig } from './AssociateConfig';

const mockAssocs = [
  {
    guid: '1',
    siteId: '123',
    siteIdAssociatedWith: '456',
    effectiveDate: '2024-08-15',
    note: 'Note 1',
    sr: true,
  },
  {
    guid: '2',
    siteId: '789',
    siteIdAssociatedWith: '101',
    effectiveDate: '2024-08-16',
    note: 'Note 2',
    sr: false,
  },
];
const mockStore = configureStore([thunk]);

// Mocking the useSelector hook with the correct state structure
jest.mock('react-redux', () => {
  const actualRedux = jest.requireActual('react-redux');
  return {
    ...actualRedux,
    useSelector: jest.fn(() => ({
      associatedSites: {
        siteAssociate: mockAssocs,
        status: 'success',
        error: '',
      },
      sites: {
        siteDetailsMode: 'edit',
        resetSiteDetails: false,
      },
      siteDetails: {
        saveRequestStatus: 'success',
      },
    })),
    useDispatch: jest.fn(() => ({
      associatedSites: {
        siteAssociate: mockAssocs,
        status: 'success',
        error: '',
      },
      sites: {
        siteDetailsMode: 'edit',
        resetSiteDetails: false,
      },
      siteDetails: {
        saveRequestStatus: 'success',
      },
    })),
  };
});

jest.mock('./AssociateConfig', () => ({
  GetAssociateConfig: jest.fn(() => ({
    associateColumnInternal: [
      {
        id: 1,
        displayName: 'Site ID',
        active: true,
        graphQLPropertyName: 'siteIdAssociatedWith',
        columnSize: 0,
        displayType: {
          type: 'search',
          label: 'Search',
          isLabel: false,
          graphQLPropertyName: 'siteIdAssociatedWith',
          placeholder: 'Search Site ID',
          value: '',
          options: [],
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss: 'custom-associate-edit-input',
          customPlaceholderCss: 'custom-associate-search-placeholder',
          customRightSearchIcon: <></>,
          customLeftSearchIcon: <></>,
          validation: {
            pattern: /^[0-9,\s]*$/,
            customMessage: 'Site ID can only contain numbers.',
          },
          allowNumbersOnly: true,
          tableMode: true,
        },
      },
      {
        id: 2,
        displayName: 'Date Noted',
        active: true,
        graphQLPropertyName: 'effectiveDate',
        columnSize: 0,
        displayType: {
          type: 'date',
          graphQLPropertyName: 'effectiveDate',
          label: 'Date Noted',
          placeholder: 'Enter Date',
          value: '',
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss:
            'custom-associate-edit-input .rs.input .rs-input-group-addon',
          tableMode: true,
        },
      },
      {
        id: 3,
        displayName: 'Note',
        active: true,
        graphQLPropertyName: 'note',
        columnSize: 4,
        displayType: {
          type: 'text',
          label: 'Note',
          placeholder: 'Note',
          graphQLPropertyName: 'note',
          value: '',
          colSize: 'col-lg-12 col-md-12 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss: 'custom-associate-edit-input',
          tableMode: true,
        },
      },
      {
        id: 4,
        displayName: 'SR',
        active: true,
        graphQLPropertyName: 'sr',
        displayType: {
          type: 'checkbox',
          label: 'SR',
          placeholder: '',
          graphQLPropertyName: 'sr',
          value: false,
          tableMode: true,
        },
        columnSize: 0,
      },
    ],
    associateColumnInternalSRandViewMode: [
      {
        id: 1,
        displayName: 'Site ID',
        active: true,
        graphQLPropertyName: 'siteIdAssociatedWith',
        columnSize: 0,
        displayType: {
          type: 'link',
          label: 'Site ID',
          isLabel: false,
          graphQLPropertyName: 'siteIdAssociatedWith',
          placeholder: 'Search Site ID',
          value: '',
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss: 'custom-associate-edit-input',
          tableMode: true,
          href: `/`,
        },
        linkRedirectionURL: `/`,
      },
      {
        id: 2,
        displayName: 'Date Noted',
        active: true,
        graphQLPropertyName: 'effectiveDate',
        columnSize: 0,
        displayType: {
          type: 'date',
          graphQLPropertyName: 'effectiveDate',
          label: 'Date Noted',
          placeholder: 'Enter Date',
          value: '',
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss:
            'custom-associate-edit-input .rs.input .rs-input-group-addon',
          tableMode: true,
        },
      },
      {
        id: 3,
        displayName: 'Note',
        active: true,
        graphQLPropertyName: 'note',
        columnSize: 0,
        displayType: {
          type: 'text',
          label: 'Note',
          placeholder: 'Note',
          graphQLPropertyName: 'note',
          value: '',
          colSize: 'col-lg-12 col-md-12 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss: 'custom-associate-edit-input',
          tableMode: true,
        },
      },
      {
        id: 4,
        displayName: 'SR',
        active: true,
        graphQLPropertyName: 'sr',
        displayType: {
          type: 'checkbox',
          label: 'SR',
          placeholder: '',
          graphQLPropertyName: 'sr',
          value: false,
          tableMode: true,
        },
        columnSize: 0,
      },
    ],
    associateColumnExternal: [
      {
        id: 1,
        displayName: 'Site ID',
        active: true,
        graphQLPropertyName: 'siteIdAssociatedWith',
        columnSize: 0,
        displayType: {
          type: 'link',
          label: 'Site ID',
          isLabel: false,
          graphQLPropertyName: 'siteIdAssociatedWith',
          placeholder: 'Search Site ID',
          value: '',
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss: 'custom-associate-edit-input',
          tableMode: true,
          href: `/`,
        },
        linkRedirectionURL: `/`,
      },
      {
        id: 2,
        displayName: 'Date Noted',
        active: true,
        graphQLPropertyName: 'effectiveDate',
        columnSize: 0,
        displayType: {
          type: 'date',
          graphQLPropertyName: 'effectiveDate',
          label: 'Date Noted',
          placeholder: 'Enter Date',
          value: '',
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss:
            'custom-associate-edit-input .rs.input .rs-input-group-addon',
          tableMode: true,
        },
      },
      {
        id: 3,
        displayName: 'Note',
        active: true,
        graphQLPropertyName: 'note',
        columnSize: 4,
        displayType: {
          type: 'text',
          label: 'Note',
          placeholder: 'Note',
          graphQLPropertyName: 'note',
          value: '',
          colSize: 'col-lg-12 col-md-12 col-sm-12',
          customLabelCss: 'custom-associate-lbl-text',
          customInputTextCss: 'custom-associate-input-text',
          customEditLabelCss: 'custom-associate-edit-label',
          customEditInputTextCss: 'custom-associate-edit-input',
          tableMode: true,
        },
      },
    ],
    srVisibilityAssocConfig: [
      {
        label: 'Show on SR',
        value: 'show',
      },
      {
        label: 'Hide on SR',
        value: 'hide',
      },
    ],
  })),
}));

describe('Associate component', () => {
  let store;
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn(); // Create a mock dispatch function
    store = mockStore({
      associatedSites: {
        siteAssociate: mockAssocs,
        status: 'success',
        error: '',
      },
      sites: {
        siteDetailsMode: 'edit',
        resetSiteDetails: false,
      },
      GetAssociateConfig: GetAssociateConfig(),
    });

    GetAssociateConfig.mockImplementation(() => ({
      associateColumnInternal: [
        {
          id: 1,
          displayName: 'Site ID',
          active: true,
          graphQLPropertyName: 'siteIdAssociatedWith',
          columnSize: 0,
          displayType: {
            type: 'search',
            label: 'Search',
            isLabel: false,
            graphQLPropertyName: 'siteIdAssociatedWith',
            placeholder: 'Search Site ID',
            value: '',
            options: [],
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss: 'custom-associate-edit-input',
            customPlaceholderCss: 'custom-associate-search-placeholder',
            customRightSearchIcon: <></>,
            customLeftSearchIcon: <></>,
            validation: {
              pattern: /^[0-9,\s]*$/,
              customMessage: 'Site ID can only contain numbers.',
            },
            allowNumbersOnly: true,
            tableMode: true,
          },
        },
        {
          id: 2,
          displayName: 'Date Noted',
          active: true,
          graphQLPropertyName: 'effectiveDate',
          columnSize: 0,
          displayType: {
            type: 'date',
            graphQLPropertyName: 'effectiveDate',
            label: 'Date Noted',
            placeholder: 'Enter Date',
            value: '',
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss:
              'custom-associate-edit-input .rs.input .rs-input-group-addon',
            tableMode: true,
          },
        },
        {
          id: 3,
          displayName: 'Note',
          active: true,
          graphQLPropertyName: 'note',
          columnSize: 4,
          displayType: {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss: 'custom-associate-edit-input',
            tableMode: true,
          },
        },
        {
          id: 4,
          displayName: 'SR',
          active: true,
          graphQLPropertyName: 'sr',
          displayType: {
            type: 'checkbox',
            label: 'SR',
            placeholder: '',
            graphQLPropertyName: 'sr',
            value: false,
            tableMode: true,
          },
          columnSize: 0,
        },
      ],
      associateColumnInternalSRandViewMode: [
        {
          id: 1,
          displayName: 'Site ID',
          active: true,
          graphQLPropertyName: 'siteIdAssociatedWith',
          columnSize: 0,
          displayType: {
            type: 'link',
            label: 'Site ID',
            isLabel: false,
            graphQLPropertyName: 'siteIdAssociatedWith',
            placeholder: 'Search Site ID',
            value: '',
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss: 'custom-associate-edit-input',
            tableMode: true,
            href: `/`,
          },
          linkRedirectionURL: `/`,
        },
        {
          id: 2,
          displayName: 'Date Noted',
          active: true,
          graphQLPropertyName: 'effectiveDate',
          columnSize: 0,
          displayType: {
            type: 'date',
            graphQLPropertyName: 'effectiveDate',
            label: 'Date Noted',
            placeholder: 'Enter Date',
            value: '',
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss:
              'custom-associate-edit-input .rs.input .rs-input-group-addon',
            tableMode: true,
          },
        },
        {
          id: 3,
          displayName: 'Note',
          active: true,
          graphQLPropertyName: 'note',
          columnSize: 0,
          displayType: {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss: 'custom-associate-edit-input',
            tableMode: true,
          },
        },
        {
          id: 4,
          displayName: 'SR',
          active: true,
          graphQLPropertyName: 'sr',
          displayType: {
            type: 'checkbox',
            label: 'SR',
            placeholder: '',
            graphQLPropertyName: 'sr',
            value: false,
            tableMode: true,
          },
          columnSize: 0,
        },
      ],
      associateColumnExternal: [
        {
          id: 1,
          displayName: 'Site ID',
          active: true,
          graphQLPropertyName: 'siteIdAssociatedWith',
          columnSize: 0,
          displayType: {
            type: 'link',
            label: 'Site ID',
            isLabel: false,
            graphQLPropertyName: 'siteIdAssociatedWith',
            placeholder: 'Search Site ID',
            value: '',
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss: 'custom-associate-edit-input',
            tableMode: true,
            href: `/`,
          },
          linkRedirectionURL: `/`,
        },
        {
          id: 2,
          displayName: 'Date Noted',
          active: true,
          graphQLPropertyName: 'effectiveDate',
          columnSize: 0,
          displayType: {
            type: 'date',
            graphQLPropertyName: 'effectiveDate',
            label: 'Date Noted',
            placeholder: 'Enter Date',
            value: '',
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss:
              'custom-associate-edit-input .rs.input .rs-input-group-addon',
            tableMode: true,
          },
        },
        {
          id: 3,
          displayName: 'Note',
          active: true,
          graphQLPropertyName: 'note',
          columnSize: 4,
          displayType: {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-associate-lbl-text',
            customInputTextCss: 'custom-associate-input-text',
            customEditLabelCss: 'custom-associate-edit-label',
            customEditInputTextCss: 'custom-associate-edit-input',
            tableMode: true,
          },
        },
      ],
      srVisibilityAssocConfig: [
        {
          label: 'Show on SR',
          value: 'show',
        },
        {
          label: 'Hide on SR',
          value: 'hide',
        },
      ],
    }));

    useSelector.mockImplementation((callback) => {
      return callback({
        associatedSites: {
          siteAssociate: mockAssocs,
          status: 'success',
          error: '',
        },
        sites: {
          siteDetailsMode: 'edit',
          resetSiteDetails: false,
        },
        siteDetails: {
          saveRequestStatus: 'success',
        },
      });
    });

    useDispatch.mockReturnValue(dispatch); // Return the mock dispatch function
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Associate component', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Associate showPending={false} />
        </MemoryRouter>
      </Provider>,
    );
    const associateComponent = screen.getByTestId('associate-component');
    expect(associateComponent).toBeInTheDocument();
  });

  it('search functionality works correctly', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Associate showPending={false} />
        </MemoryRouter>
      </Provider>,
    );

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'Note 1' } });

    await waitFor(() => {
      const tableRows = screen.getAllByTestId('table-row');
      expect(tableRows.length).toBe(1);
      expect(tableRows[0]).toHaveTextContent('Note 1');
    });
  });

  it('clearing the search works correctly', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Associate showPending={false} />
        </MemoryRouter>
      </Provider>,
    );

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'Note 1' } });

    await waitFor(() => {
      const tableRows = screen.getAllByTestId('table-row');
      expect(tableRows.length).toBe(1);
      expect(tableRows[0]).toHaveTextContent('Note 1');
    });

    const clearButton = screen.getByTestId('clear-icon');
    fireEvent.click(clearButton);

    await waitFor(() => {
      const tableRows = screen.getAllByTestId('table-row');
      expect(tableRows.length).toBe(2); // Assuming initial length is 2
    });
  });

  it('handle sort change works correctly', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Associate showPending={false} />
        </MemoryRouter>
      </Provider>,
    );

    const sortDropdown = screen.getByLabelText('Sort By');
    fireEvent.change(sortDropdown, { target: { value: 'newToOld' } });

    await waitFor(() => {
      const tableRows = screen.getAllByTestId('table-row');
      expect(tableRows[0]).toHaveTextContent('Note 2');
      expect(tableRows[1]).toHaveTextContent('Note 1');
    });
  });
});
