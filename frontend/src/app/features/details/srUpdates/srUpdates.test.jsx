import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { render, fireEvent, screen } from '@testing-library/react';
import SRUpdates from './srUpdates';
import { RequestStatus } from '../../../helpers/requests/status';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import React, { act } from 'react';

const mockStore = configureStore([thunk]);

describe('Site Registry Review Tab', () => {
  let store;
  let testSiteRouter;

  beforeEach(() => {
    testSiteRouter = [{ path: '/', element: <SRUpdates /> }];

    store = mockStore({
      landUses: { landUseCodes: [] },

      siteDetails: {
        saveRequestStatus: RequestStatus.success,
      },
      srUpdates: {
        siteSummary: [],
        documents: [{
          id: '1',
          siteId: '9',       
        }],
        notation: [{
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
        }],
        siteSummaryData: {},
        siteParticipants: [{
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
          }],
        landUsesData: [{
          id: '1',
          siteId: '9',
        }],
        siteAssociations: [
          {
            id: '1',
          siteId: '9',
          }
        ],
        parcelDescriptionData: {
          data: [{
            siteId: '9',
          }]
        }
      },
      dropdown: {
        dropdowns: {
          internalUserList: [],
          participantRoles: {
            getNotationParticipantRoleCd: [],
          },
          notationClass: {
            getNotationClassCd: [],
          },
          notationType: { getNotationTypeCd: [] },
          notationParticipantRole: {
            getNotationParticipantRoleCd: [],
          },
          participantNames: {
            getPeopleOrgsCd: [],
          },
          ministryContact: { getPeopleOrgsCd: [] },
        },
      },
    });
  });

  it('Renders Page', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );   
    const pageComponent = screen.getByTestId('srreviewtab-component');
    expect(pageComponent).toBeInTheDocument();
  });

  
  it('Renders Summary Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );   
    const pageComponent = screen.getByTestId('site-summary-component');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Renders Notation Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );  
    const pageComponent = screen.getByTestId('srupdates-notation-component');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Renders Site Participant Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );  
    const pageComponent = screen.getByTestId('srupdates-participant-component');
    expect(pageComponent).toBeInTheDocument();
  });


  it('Renders Documents Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );    
    const pageComponent = screen.getByTestId('srupdates-documents-component');
    expect(pageComponent).toBeInTheDocument();
  });


  it('Renders Site Associations Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );  
    const pageComponent = screen.getByTestId('srupdates-siteassociations-component');
    expect(pageComponent).toBeInTheDocument();
  });

  
  it('Renders Land Uses Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );   
    const pageComponent = screen.getByTestId('srupdates-landuses-component');
    expect(pageComponent).toBeInTheDocument();
  });

  it('Renders Parcel Description Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );    
    const pageComponent = screen.getByTestId('srupdates-parceldesc-component');
    expect(pageComponent).toBeInTheDocument();
  });


});
