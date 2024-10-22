import { render, fireEvent, screen } from '@testing-library/react';
import Notations from './Notations';
import { Provider, useSelector, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { GetNotationConfig } from './NotationsConfig';

// Example of a Jest mock for GetNotationConfig
jest.mock('./NotationsConfig', () => ({
  GetNotationConfig: jest.fn(() => {
    console.log('GetNotationConfig called'); // Debugging log
    return {
      notationFormRowsInternal: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize: 'col-lg-5 col-md-7 col-sm-11 col-10',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: '',
            colSize: 'col-lg-3 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: '',
            colSize: 'col-lg-3 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],

        [
          {
            type: 'dropdown',
            label: 'Notation Class',
            placeholder: 'Notation Class',
            graphQLPropertyName: 'eclsCode',
            options: [{ key: 'ADM', value: 'ADM' }],
            value: '',
            colSize: 'col-lg-5 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Required Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementDueDate',
            value: '',
            colSize: 'col-lg-3 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-dateInput',
          },
          {
            type: 'dropdown',
            label: 'Ministry Contact',
            placeholder: 'Ministry Contact',
            graphQLPropertyName: 'psnorgId',
            options: [{ key: '1', value: 'ABC' }],
            value: '',
            isImage: true,
            colSize: 'col-lg-4 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'text',
            label: 'Required Actions',
            placeholder: 'Required Actions',
            graphQLPropertyName: 'requiredAction',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
      ],
      notationFormRowEditMode: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize: 'col-lg-11 col-md-11 col-sm-11 col-10',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'dropdown',
            label: 'Notation Class',
            placeholder: 'Notation Class',
            graphQLPropertyName: 'eclsCode',
            options: [{ key: 'ADM', value: 'ADM' }],
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: '',
            colSize: 'col-lg-4 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Required Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementDueDate',
            value: '',
            colSize: 'col-lg-4 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: '',
            colSize: 'col-lg-4 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],
        [
          {
            type: 'text',
            label: 'Required Actions',
            placeholder: 'Required Actions',
            graphQLPropertyName: 'requiredAction',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'dropdown',
            label: 'Ministry Contact',
            placeholder: 'Ministry Contact',
            graphQLPropertyName: 'psnorgId',
            options: [{ key: '1', value: 'ABC' }],
            value: '',
            isImage: true,
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
      ],
      notationFormRowExternal: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize:
              'col-xxl-11 col-xl-11 col-lg-11 col-md-11 col-sm-11 col-xs-11',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'dropdown',
            label: 'Notation Class',
            placeholder: 'Notation Class',
            graphQLPropertyName: 'eclsCode',
            options: [{ key: 'ADM', value: 'ADM' }],
            value: '',
            colSize:
              'col-xxl-6 col-xl-6 col-lg-12 col-md-12 col-sm-12 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: [],
            colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Required Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementDueDate',
            value: [],
            colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: [],
            colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-12 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],

        [
          {
            type: 'text',
            label: 'Required Actions',
            placeholder: 'Required Actions',
            graphQLPropertyName: 'requiredAction',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'dropdown',
            label: 'Ministry Contact',
            placeholder: 'Ministry Contact',
            graphQLPropertyName: 'psnorgId',
            options: [{ key: '1', value: 'ABC' }],
            value: '',
            isImage: true,
            colSize: 'col-lg-4 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
      ],
      notationFormRowsFirstChild: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize: 'col-xxl-5 col-xl-5 col-lg-8 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: [],
            colSize:
              'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: [],
            colSize:
              'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],
      ],
      notationColumnInternal: [
        {
          id: 1,
          displayName: 'Role',
          active: true,
          graphQLPropertyName: 'eprCode',
          displayType: {
            type: 'dropdown',
            label: 'Text',
            graphQLPropertyName: 'eprCode',
            value: '',
            options: [],
            allowNumbersOnly: true,
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            tableMode: true,
            placeholder: 'Please select the role',
          },
          columnSize: 0,
        },
        {
          id: 2,
          displayName: 'Participant Name',
          active: true,
          graphQLPropertyName: 'psnorgId',
          columnSize: 3,
          displayType: {
            type: 'dropdownWithSearch',
            label: '',
            isLabel: false,
            graphQLPropertyName: 'psnorgId',
            placeholder: 'Please enter participant name.',
            value: '',
            options: [],
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            customPlaceholderCss: 'custom-notation-search-placeholder',
            tableMode: true,
            customMenuMessage: (
              <span>Please select site participant name:</span>
            ),
            filteredOptions: [],
            isLoading: 'idle',
            handleSearch: () => {},
          },
        },
        {
          id: 3,
          displayName: 'SR',
          active: true,
          graphQLPropertyName: 'srAction',
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
      notationColumnExternal: [
        {
          id: 1,
          displayName: 'Role',
          active: true,
          graphQLPropertyName: 'eprCode',
          displayType: {
            type: 'dropdown',
            label: 'Text',
            graphQLPropertyName: 'eprCode',
            value: '',
            options: [],
            allowNumbersOnly: true,
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            tableMode: true,
            placeholder: 'Please select the role',
          },
          columnSize: 0,
        },
        {
          id: 2,
          displayName: 'Participant Name',
          active: true,
          graphQLPropertyName: 'psnorgId',
          columnSize: 3,
          displayType: {
            type: 'dropdownWithSearch',
            label: '',
            isLabel: false,
            graphQLPropertyName: 'psnorgId',
            placeholder: 'Please enter participant name.',
            value: '',
            options: [],
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            customPlaceholderCss: 'custom-notation-search-placeholder',
            tableMode: true,
            customMenuMessage: (
              <span>Please select site participant name:</span>
            ),
            filteredOptions: [],
            isLoading: 'idle',
          },
        },
      ],
      srVisibilityConfig: [
        {
          label: 'Show on SR',
          value: 'show',
        },
        {
          label: 'Hide on SR',
          value: 'hide',
        },
      ],
    };
  }),
}));

jest.mock('react-redux', () => {
  const actualRedux = jest.requireActual('react-redux');
  const initialState = {
    notationParticipant: {
      siteNotation: [
        {
          id: '1',
          siteId: '9',
          psnorgId: '1',
          completionDate: '2024-09-19T07:00:00.000Z',
          requirementDueDate: '2024-09-19T07:00:00.000Z',
          requirementReceivedDate: '2024-09-19T07:00:00.000Z',
          requiredAction: 'Demo',
          note: 'CERTIFICATE',
          etypCode: 'SREC',
          eclsCode: 'ADM',
          srAction: 'false',
          notationParticipant: [
            {
              eventParticId: 'xxx-sss-dddd',
              eventId: '1',
              eprCode: 'RFB',
              psnorgId: '2',
              displayName: 'Display Name',
              srAction: 'true',
            },
          ],
        },
      ],
      status: 'success',
      error: '',
    },
    sites: {
      siteDetailsMode: 'edit',
      userType: 'Internal',
      resetSiteDetails: false,
    },
    siteDetails: {
      saveRequestStatus: 'success',
    },
    dropdown: {
      dropdowns: {
        notationType: {
          // Ensure notationType is defined here
          getNotationTypeCd: {
            data: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
          },
        },
        participantRoles: { data: [] },
        notationParticipantRole: {
          getParticipantRoleCd: {
            data: [{ key: 'RFB', value: 'RFB' }],
          },
        },
        notationClass: {
          getNotationClassCd: {
            data: [{ key: 'ADM', value: 'ADM' }],
          },
        },
        ministryContact: {
          getPeopleOrgsCd: {
            data: [{ key: '1', value: 'ABC' }],
          },
        },
      },
    },
  };
  return {
    ...actualRedux,
    useSelector: jest.fn(() => initialState),
    useDispatch: jest.fn(() => initialState),
  };
});

const mockStore = configureStore([thunk]);
describe('Notations component', () => {
  let store;
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn(); // Create a mock dispatch function
    store = mockStore({
      notationParticipant: {
        siteNotation: [
          {
            id: '1',
            siteId: '9',
            psnorgId: '1',
            completionDate: '2024-09-19T07:00:00.000Z',
            requirementDueDate: '2024-09-19T07:00:00.000Z',
            requirementReceivedDate: '2024-09-19T07:00:00.000Z',
            requiredAction: 'Demo',
            note: 'CERTIFICATE',
            etypCode: 'SREC',
            eclsCode: 'ADM',
            srAction: 'false',
            notationParticipant: [
              {
                eventParticId: 'xxx-sss-dddd',
                eventId: '1',
                eprCode: 'RFB',
                psnorgId: '2',
                displayName: 'Display Name',
                srAction: 'true',
              },
            ],
          },
        ],
        status: 'success',
        error: '',
      },
      sites: {
        siteDetailsMode: 'edit',
        userType: 'Internal',
        resetSiteDetails: false,
      },
      siteDetails: {
        saveRequestStatus: 'success',
      },
      dropdown: {
        dropdowns: {
          notationType: {
            // Ensure notationType is defined here
            getNotationTypeCd: {
              data: [
                {
                  metaData: 'ADM',
                  dropdownDto: [{ key: 'SREC', value: 'SREC' }],
                },
              ],
            },
          },
          participantRoles: { data: [] },
          notationParticipantRole: {
            getParticipantRoleCd: {
              data: [{ key: 'RFB', value: 'RFB' }],
            },
          },
          notationClass: {
            getNotationClassCd: {
              data: [{ key: 'ADM', value: 'ADM' }],
            },
          },
          ministryContact: {
            getPeopleOrgsCd: {
              data: [{ key: '1', value: 'ABC' }],
            },
          },
        },
      },
      GetNotationConfig: GetNotationConfig(),
    });
    GetNotationConfig.mockImplementation(() => ({
      notationFormRowsInternal: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize: 'col-lg-5 col-md-7 col-sm-11 col-10',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: '',
            colSize: 'col-lg-3 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: '',
            colSize: 'col-lg-3 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],

        [
          {
            type: 'dropdown',
            label: 'Notation Class',
            placeholder: 'Notation Class',
            graphQLPropertyName: 'eclsCode',
            options: [{ key: 'ADM', value: 'ADM' }],
            value: '',
            colSize: 'col-lg-5 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Required Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementDueDate',
            value: '',
            colSize: 'col-lg-3 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-dateInput',
          },
          {
            type: 'dropdown',
            label: 'Ministry Contact',
            placeholder: 'Ministry Contact',
            graphQLPropertyName: 'psnorgId',
            options: [{ key: '1', value: 'ABC' }],
            value: '',
            isImage: true,
            colSize: 'col-lg-4 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'text',
            label: 'Required Actions',
            placeholder: 'Required Actions',
            graphQLPropertyName: 'requiredAction',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
      ],
      notationFormRowEditMode: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize: 'col-lg-11 col-md-11 col-sm-11 col-10',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'dropdown',
            label: 'Notation Class',
            placeholder: 'Notation Class',
            graphQLPropertyName: 'eclsCode',
            options: [{ key: 'ADM', value: 'ADM' }],
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: '',
            colSize: 'col-lg-4 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Required Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementDueDate',
            value: '',
            colSize: 'col-lg-4 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: '',
            colSize: 'col-lg-4 col-md-4 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],
        [
          {
            type: 'text',
            label: 'Required Actions',
            placeholder: 'Required Actions',
            graphQLPropertyName: 'requiredAction',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'dropdown',
            label: 'Ministry Contact',
            placeholder: 'Ministry Contact',
            graphQLPropertyName: 'psnorgId',
            options: [{ key: '1', value: 'ABC' }],
            value: '',
            isImage: true,
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
      ],
      notationFormRowExternal: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize:
              'col-xxl-11 col-xl-11 col-lg-11 col-md-11 col-sm-11 col-xs-11',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'dropdown',
            label: 'Notation Class',
            placeholder: 'Notation Class',
            graphQLPropertyName: 'eclsCode',
            options: [{ key: 'ADM', value: 'ADM' }],
            value: '',
            colSize:
              'col-xxl-6 col-xl-6 col-lg-12 col-md-12 col-sm-12 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: [],
            colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Required Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementDueDate',
            value: [],
            colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-6 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: [],
            colSize: 'col-xxl-2 col-xl-2 col-lg-4 col-md-4 col-sm-12 col-xs-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],

        [
          {
            type: 'text',
            label: 'Required Actions',
            placeholder: 'Required Actions',
            graphQLPropertyName: 'requiredAction',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],

        [
          {
            type: 'text',
            label: 'Note',
            placeholder: 'Note',
            graphQLPropertyName: 'note',
            value: '',
            colSize: 'col-lg-12 col-md-12 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
        [
          {
            type: 'dropdown',
            label: 'Ministry Contact',
            placeholder: 'Ministry Contact',
            graphQLPropertyName: 'psnorgId',
            options: [{ key: '1', value: 'ABC' }],
            value: '',
            isImage: true,
            colSize: 'col-lg-4 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
        ],
      ],
      notationFormRowsFirstChild: [
        [
          {
            type: 'dropdown',
            label: 'Notation Type',
            placeholder: 'Notation Type',
            graphQLPropertyName: 'etypCode',
            options: [
              {
                metaData: 'ADM',
                dropdownDto: [{ key: 'SREC', value: 'SREC' }],
              },
            ],
            value: '',
            colSize: 'col-xxl-5 col-xl-5 col-lg-8 col-md-6 col-sm-12',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss: 'custom-notation-edit-input',
          },
          {
            type: 'date',
            label: 'Initiated Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'requirementReceivedDate',
            value: [],
            colSize:
              'col-lg-3 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
          {
            type: 'date',
            label: 'Completed Date',
            placeholder: 'MM/DD/YY',
            graphQLPropertyName: 'completionDate',
            value: [],
            colSize:
              'col-lg-4 col-md-6 col-sm-12 d-none d-xl-block d-xxl-block d-lg-block d-md-block',
            customLabelCss: 'custom-notation-lbl-text',
            customInputTextCss: 'custom-notation-input-text',
            customEditLabelCss: 'custom-notation-edit-label',
            customEditInputTextCss:
              'custom-notation-edit-dateInput .rs-input .rs-input-group-addon',
          },
        ],
      ],
      notationColumnInternal: [
        {
          id: 1,
          displayName: 'Role',
          active: true,
          graphQLPropertyName: 'eprCode',
          displayType: {
            type: 'dropdown',
            label: 'Text',
            graphQLPropertyName: 'eprCode',
            value: '',
            options: [],
            allowNumbersOnly: true,
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            tableMode: true,
            placeholder: 'Please select the role',
          },
          columnSize: 0,
        },
        {
          id: 2,
          displayName: 'Participant Name',
          active: true,
          graphQLPropertyName: 'psnorgId',
          columnSize: 3,
          displayType: {
            type: 'dropdownWithSearch',
            label: '',
            isLabel: false,
            graphQLPropertyName: 'psnorgId',
            placeholder: 'Please enter participant name.',
            value: '',
            options: [],
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            customPlaceholderCss: 'custom-notation-search-placeholder',
            tableMode: true,
            customMenuMessage: (
              <span>Please select site participant name:</span>
            ),
            filteredOptions: [],
            isLoading: 'idle',
            handleSearch: () => {},
          },
        },
        {
          id: 3,
          displayName: 'SR',
          active: true,
          graphQLPropertyName: 'srAction',
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
      notationColumnExternal: [
        {
          id: 1,
          displayName: 'Role',
          active: true,
          graphQLPropertyName: 'eprCode',
          displayType: {
            type: 'dropdown',
            label: 'Text',
            graphQLPropertyName: 'eprCode',
            value: '',
            options: [],
            allowNumbersOnly: true,
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            tableMode: true,
            placeholder: 'Please select the role',
          },
          columnSize: 0,
        },
        {
          id: 2,
          displayName: 'Participant Name',
          active: true,
          graphQLPropertyName: 'psnorgId',
          columnSize: 3,
          displayType: {
            type: 'dropdownWithSearch',
            label: '',
            isLabel: false,
            graphQLPropertyName: 'psnorgId',
            placeholder: 'Please enter participant name.',
            value: '',
            options: [],
            colSize: 'col-lg-6 col-md-6 col-sm-12',
            customInputTextCss: 'custom-notation-participant-input-text',
            customEditInputTextCss: 'custom-notation-participant-input-text',
            customPlaceholderCss: 'custom-notation-search-placeholder',
            tableMode: true,
            customMenuMessage: (
              <span>Please select site participant name:</span>
            ),
            filteredOptions: [],
            isLoading: 'idle',
          },
        },
      ],
      srVisibilityConfig: [
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
        notationParticipant: {
          siteNotation: [
            {
              id: '1',
              siteId: '9',
              psnorgId: '1',
              completionDate: '2024-09-19T07:00:00.000Z',
              requirementDueDate: '2024-09-19T07:00:00.000Z',
              requirementReceivedDate: '2024-09-19T07:00:00.000Z',
              requiredAction: 'Demo',
              note: 'CERTIFICATE',
              etypCode: 'SREC',
              eclsCode: 'ADM',
              srAction: 'false',
              notationParticipant: [
                {
                  eventParticId: 'xxx-sss-dddd',
                  eventId: '1',
                  eprCode: 'RFB',
                  psnorgId: '2',
                  displayName: 'Display Name',
                  srAction: 'true',
                },
              ],
            },
          ],
          status: 'success',
          error: '',
        },
        sites: {
          siteDetailsMode: 'edit',
          userType: 'Internal',
          resetSiteDetails: false,
        },
        siteDetails: {
          saveRequestStatus: 'success',
        },
        dropdown: {
          dropdowns: {
            notationType: {
              // Ensure notationType is defined here
              getNotationTypeCd: {
                data: [
                  {
                    metaData: 'ADM',
                    dropdownDto: [{ key: 'SREC', value: 'SREC' }],
                  },
                ],
              },
            },
            participantRoles: { data: [] },
            notationParticipantRole: {
              getParticipantRoleCd: {
                data: [{ key: 'RFB', value: 'RFB' }],
              },
            },
            notationClass: {
              getNotationClassCd: {
                data: [{ key: 'ADM', value: 'ADM' }],
              },
            },
            ministryContact: {
              getPeopleOrgsCd: {
                data: [{ key: '1', value: 'ABC' }],
              },
            },
          },
        },
      });
    });
    useDispatch.mockReturnValue(dispatch); // Return the mock dispatch function
  });
  it('renders Notations component', () => {
    render(
      <Provider store={store}>
        <Notations showPending={false} />
      </Provider>,
    );
    const notationsComponent = screen.getByTestId('notations-component');
    expect(notationsComponent).toBeInTheDocument();
  });

  it('search functionality works correctly', () => {
    render(
      <Provider store={store}>
        <Notations showPending={false} />
      </Provider>,
    );
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'CERTIFICATE' } });
    const notationRows = screen.getByTestId('notation-rows');
    expect(notationRows.children.length).toBeGreaterThan(0);
  });

  it('clearing the search works correctly', () => {
    const { container } = render(
      <Provider store={store}>
        <Notations showPending={false} />
      </Provider>,
    );
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'CERTIFICATE' } });
    const clearIcon = container.querySelector('#clear-icon');
    expect(clearIcon).toBeInTheDocument();
    fireEvent.click(clearIcon);
    const notationRows = screen.getByTestId('notation-rows');
    expect(notationRows.children.length).toBeGreaterThan(0);
  });
});
