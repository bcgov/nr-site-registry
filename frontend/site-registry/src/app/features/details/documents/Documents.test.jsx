import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Documents from './Documents';
import { Provider, useSelector } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { GetDocumentsConfig } from './DocumentsConfig';
import { UserType } from '../../../helpers/requests/userType';
import { RequestStatus } from '../../../helpers/requests/status';

// Mocking the useSelector hook with the correct state structure
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn( () => ({
    documents: {
        siteDocuments: [
          {
            id: "3133",
            siteId: "1550",
            psnorgId: "622",
            submissionDate: "1989-11-23T08:00:00.000Z",
            documentDate: "1989-11-23T08:00:00.000Z",
            title: "SUBSURFACE MONITORING",
            displayName: "HARDY BBT LIMITED (KAMLOOPS B.C.)"
          },
          {
            id: "3135",
            siteId: "1550",
            psnorgId: "57",
            submissionDate: "1993-04-13T07:00:00.000Z",
            documentDate: "1993-03-22T08:00:00.000Z",
            title: "VAPOUR SAMPLE TESTS MONTE CREEK ESSO",
            displayName: "BROWN, DAVID J."
          },
          {
            id: "3138",
            siteId: "1550",
            psnorgId: "3694",
            submissionDate: "1995-04-18T07:00:00.000Z",
            documentDate: "1995-04-18T07:00:00.000Z",
            title: "ENVIRONMENTAL SERVICES VAPOUR AND GROUNDWATER SAMPLING REPORT",
            displayName: "Y.B. HOLDINGS LTD. (KAMLOOPS, B.C.)"
          },
        ],
        status: "success",
        error: "",
    },
    sites: {
      siteDetailsMode: "edit",
      resetSiteDetails: false,
    },
  })),
  useDispatch: jest.fn(() => ({
    documents: {
        siteDocuments: [
          {
            id: "3133",
            siteId: "1550",
            psnorgId: "622",
            submissionDate: "1989-11-23T08:00:00.000Z",
            documentDate: "1989-11-23T08:00:00.000Z",
            title: "SUBSURFACE MONITORING",
            displayName: "HARDY BBT LIMITED (KAMLOOPS B.C.)"
          },
          {
            id: "3135",
            siteId: "1550",
            psnorgId: "57",
            submissionDate: "1993-04-13T07:00:00.000Z",
            documentDate: "1993-03-22T08:00:00.000Z",
            title: "VAPOUR SAMPLE TESTS MONTE CREEK ESSO",
            displayName: "BROWN, DAVID J."
          },
          {
            id: "3138",
            siteId: "1550",
            psnorgId: "3694",
            submissionDate: "1995-04-18T07:00:00.000Z",
            documentDate: "1995-04-18T07:00:00.000Z",
            title: "ENVIRONMENTAL SERVICES VAPOUR AND GROUNDWATER SAMPLING REPORT",
            displayName: "Y.B. HOLDINGS LTD. (KAMLOOPS, B.C.)"
          },
        ],
        status: "edit",
        error: "",
    },
    sites: {
        siteDetailsMode: "edit",
        userType:'Internal',
        resetSiteDetails: false,
      },
  })),
}));


// Example of a Jest mock for GetDocumentsConfig
jest.mock('./DocumentsConfig', () => ({
  GetDocumentsConfig: jest.fn(() => ({
    documentFirstChildFormRowsForExternal: [
      [
        {
          type: 'textarea',
          label: 'Document Title',
          placeholder: 'Document title...',
          graphQLPropertyName: 'title',
          value: '',
          textAreaRow: 1,
          colSize: 'col-lg-7 col-md-7 col-sm-12',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        },
        {
          type: 'date',
          label: 'Document Date',
          placeholder: 'MM/DD/YY',
          graphQLPropertyName: 'documentDate',
          value: '',
          colSize: 'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        }
      ]
    ],
    documentFirstChildFormRows: [
      [
        {
          type: 'textarea',
          label: 'Document Title',
          placeholder: 'Document title...',
          graphQLPropertyName: 'title',
          value: '',
          textAreaRow: 1,
          colSize: 'col-lg-6 col-md-6 col-sm-12',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        },
        {
          type: 'dropdownWithSearch',
          label: 'Author',
          placeholder: 'Author....',
          graphQLPropertyName: 'psnorgId',
          options: [
            { dropdownDto: [{ label: 'Author 1', value: '1' }, { label: 'Author 2', value: '2' }] }
          ].flatMap((item) => item.dropdownDto) ?? [],
          value: '',
          colSize: 'col-lg-3 col-md-3 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        },
        {
          type: 'date',
          label: 'Document Date',
          placeholder: 'MM/DD/YY',
          graphQLPropertyName: 'documentDate',
          value: '',
          colSize: 'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        }
      ]
    ],
    documentFormRows: [
      [
        {
          type: 'textarea',
          label: 'Document Title',
          placeholder: 'Document title...',
          graphQLPropertyName: 'title',
          value: '',
          textAreaRow: 1,
          colSize: 'col-lg-12 col-md-12 col-sm-12',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        }
      ],
      [
        {
          type: 'dropdownWithSearch',
          label: 'Author',
          placeholder: 'Author....',
          graphQLPropertyName: 'psnorgId',
          options: [
            { dropdownDto: [{ label: 'Author 1', value: '1' }, { label: 'Author 2', value: '2' }] }
          ].flatMap((item) => item.dropdownDto) ?? [],
          value: '',
          colSize: 'col-lg-6 col-md-12 col-sm-12',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        },
        {
          type: 'date',
          label: 'Document Date',
          placeholder: 'MM/DD/YY',
          graphQLPropertyName: 'documentDate',
          value: '',
          colSize: 'col-lg-3 col-md-6 col-sm-12',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        },
        {
          type: 'date',
          label: 'Received Date',
          placeholder: 'MM/DD/YY',
          graphQLPropertyName: 'submissionDate',
          value: '',
          isDisabled: true,
          colSize: 'col-lg-3 col-md-6 col-sm-12',
          customLabelCss: 'custom-docuemnt-lbl-text',
          customEditLabelCss: 'custom-docuemnt-lbl-text',
          customInputTextCss: 'custom-document-input-text',
          customEditInputTextCss: 'custom-document-edit-input-text'
        }
      ]
    ]
  }))
}));

const mockStore = configureStore([thunk]);


describe('Documents component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      documents: {
          siteDocuments: [
            {
              id: "3133",
              siteId: "1550",
              psnorgId: "622",
              submissionDate: "1989-11-23T08:00:00.000Z",
              documentDate: "1989-11-23T08:00:00.000Z",
              title: "SUBSURFACE MONITORING",
              displayName: "HARDY BBT LIMITED (KAMLOOPS B.C.)"
            },
            {
              id: "3135",
              siteId: "1550",
              psnorgId: "57",
              submissionDate: "1993-04-13T07:00:00.000Z",
              documentDate: "1993-03-22T08:00:00.000Z",
              title: "VAPOUR SAMPLE TESTS MONTE CREEK ESSO",
              displayName: "BROWN, DAVID J."
            },
            {
              id: "3138",
              siteId: "1550",
              psnorgId: "3694",
              submissionDate: "1995-04-18T07:00:00.000Z",
              documentDate: "1995-04-18T07:00:00.000Z",
              title: "ENVIRONMENTAL SERVICES VAPOUR AND GROUNDWATER SAMPLING REPORT",
              displayName: "Y.B. HOLDINGS LTD. (KAMLOOPS, B.C.)"
            },
          ],
          status: "success",
          error: "",
      },
      sites: {
        siteDetailsMode: SiteDetailsMode.EditMode,
        userType: UserType.Internal,
        resetSiteDetails: false,
      },
      GetDocumentsConfig: GetDocumentsConfig(),

    });

    GetDocumentsConfig.mockImplementation(() => ({
        documentFirstChildFormRowsForExternal: [
            [
              {
                type: 'textarea',
                label: 'Document Title',
                placeholder: 'Document title...',
                graphQLPropertyName: 'title',
                value: '',
                textAreaRow: 1,
                colSize: 'col-lg-7 col-md-7 col-sm-12',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              },
              {
                type: 'date',
                label: 'Document Date',
                placeholder: 'MM/DD/YY',
                graphQLPropertyName: 'documentDate',
                value: '',
                colSize: 'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              }
            ]
          ],
          documentFirstChildFormRows: [
            [
              {
                type: 'textarea',
                label: 'Document Title',
                placeholder: 'Document title...',
                graphQLPropertyName: 'title',
                value: '',
                textAreaRow: 1,
                colSize: 'col-lg-6 col-md-6 col-sm-12',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              },
              {
                type: 'dropdownWithSearch',
                label: 'Author',
                placeholder: 'Author....',
                graphQLPropertyName: 'psnorgId',
                options: [
                  { dropdownDto: [{ label: 'Author 1', value: '1' }, { label: 'Author 2', value: '2' }] }
                ].flatMap((item) => item.dropdownDto) ?? [],
                value: '',
                colSize: 'col-lg-3 col-md-3 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              },
              {
                type: 'date',
                label: 'Document Date',
                placeholder: 'MM/DD/YY',
                graphQLPropertyName: 'documentDate',
                value: '',
                colSize: 'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              }
            ]
          ],
          documentFormRows: [
            [
              {
                type: 'textarea',
                label: 'Document Title',
                placeholder: 'Document title...',
                graphQLPropertyName: 'title',
                value: '',
                textAreaRow: 1,
                colSize: 'col-lg-12 col-md-12 col-sm-12',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              }
            ],
            [
              {
                type: 'dropdownWithSearch',
                label: 'Author',
                placeholder: 'Author....',
                graphQLPropertyName: 'psnorgId',
                options: [
                  { dropdownDto: [{ label: 'Author 1', value: '1' }, { label: 'Author 2', value: '2' }] }
                ].flatMap((item) => item.dropdownDto) ?? [],
                value: '',
                colSize: 'col-lg-6 col-md-12 col-sm-12',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              },
              {
                type: 'date',
                label: 'Document Date',
                placeholder: 'MM/DD/YY',
                graphQLPropertyName: 'documentDate',
                value: '',
                colSize: 'col-lg-3 col-md-6 col-sm-12',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              },
              {
                type: 'date',
                label: 'Received Date',
                placeholder: 'MM/DD/YY',
                graphQLPropertyName: 'submissionDate',
                value: '',
                isDisabled: true,
                colSize: 'col-lg-3 col-md-6 col-sm-12',
                customLabelCss: 'custom-docuemnt-lbl-text',
                customEditLabelCss: 'custom-docuemnt-lbl-text',
                customInputTextCss: 'custom-document-input-text',
                customEditInputTextCss: 'custom-document-edit-input-text'
              }
            ]
          ]
      }));

    useSelector.mockImplementation((callback) => {
      return callback({
        sites: {
            siteDetailsMode: SiteDetailsMode.ViewOnlyMode,
            userType: UserType.Internal,
            resetSiteDetails: false,
          },
        documents: {
            siteDocuments: [
              {
                id: "3133",
                siteId: "1550",
                psnorgId: "622",
                submissionDate: "1989-11-23T08:00:00.000Z",
                documentDate: "1989-11-23T08:00:00.000Z",
                title: "SUBSURFACE MONITORING",
                displayName: "HARDY BBT LIMITED (KAMLOOPS B.C.)"
              },
              {
                id: "3135",
                siteId: "1550",
                psnorgId: "57",
                submissionDate: "1993-04-13T07:00:00.000Z",
                documentDate: "1993-03-22T08:00:00.000Z",
                title: "VAPOUR SAMPLE TESTS MONTE CREEK ESSO",
                displayName: "BROWN, DAVID J."
              },
              {
                id: "3138",
                siteId: "1550",
                psnorgId: "3694",
                submissionDate: "1995-04-18T07:00:00.000Z",
                documentDate: "1995-04-18T07:00:00.000Z",
                title: "ENVIRONMENTAL SERVICES VAPOUR AND GROUNDWATER SAMPLING REPORT",
                displayName: "Y.B. HOLDINGS LTD. (KAMLOOPS, B.C.)"
              },
            ],
            status: "success",
            error: "",
        },
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Documents component', () => {
    render(
      <Provider store={store}>
        <Documents />
      </Provider>,
    );
    const documentsComponent = screen.getByTestId('document-component');
    expect(documentsComponent).toBeInTheDocument();
  });

  it('search functionality works correctly', async () => {
    render(
      <Provider store={store}>
        <Documents />
      </Provider>,
    );

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'SUBSURFACE MONITORING' } });
    await waitFor(() => {
        // Attempt to get document rows
        const documentRows = screen.queryByTestId('document-row-0');
        expect(documentRows).not.toBeNull(); // Ensure document rows are present
        if (documentRows) {
          expect(documentRows.textContent).toContain('SUBSURFACE MONITORING');
        }

      });
  });

    it('clearing the search works correctly', async () => {
    render(
      <Provider store={store}>
        <Documents />
      </Provider>,
    );

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'SUBSURFACE MONITORING' } });

    const clearIcon = screen.getByTestId('clear-icon');
    expect(clearIcon).toBeInTheDocument();
    fireEvent.click(clearIcon);

    await waitFor(() => {
      const documentRows = screen.getByTestId('document-rows');
      expect(documentRows.children.length).toBe(3); // Ensure all documents are displayed
      expect(documentRows.textContent).toContain('SUBSURFACE MONITORING');
    });
  });
});
