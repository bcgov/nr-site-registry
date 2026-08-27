import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { render, fireEvent, screen } from '@testing-library/react';
import SRUpdates from './srUpdates';
import { RequestStatus } from '../../../helpers/requests/status';
import { createBrowserRouter, MemoryRouter, Route, Routes, RouterProvider } from 'react-router-dom';
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
        documents: [
          {
            id: '1',
            siteId: '9',
          },
        ],
        notation: [
          {
            id: '1',
            siteId: '9',
            psnorgId: '1',
            completionDate: '2024-09-19T07:00:00.000Z',
            requirementDueDate: '2024-09-19T07:00:00.000Z',
            eventDate: '2024-09-19T07:00:00.000Z',
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
        siteSummaryData: {},
        siteParticipants: [
          {
            id: '1',
            siteId: '9',
            psnorgId: '1',
            completionDate: '2024-09-19T07:00:00.000Z',
            requirementDueDate: '2024-09-19T07:00:00.000Z',
            eventDate: '2024-09-19T07:00:00.000Z',
            requiredAction: 'Demo',
            note: 'CERTIFICATE',
            etypCode: 'SREC',
            eclsCode: 'ADM',
            srAction: 'false',
          },
        ],
        landUsesData: [
          {
            id: '1',
            siteId: '9',
          },
        ],
        siteAssociations: [
          {
            id: '1',
            siteId: '9',
          },
        ],
        parcelDescriptionData: {
          data: [
            {
              siteId: '9',
            },
          ],
        },
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
          siteRiskCode: {
            getSiteRiskCd: {
              data: [{ key: 'LOW', value: 'Low' }],
            },
          },
          bceRegionCode: {
            getBCeRegionCd: {
              data: [{ key: '1', value: 'Region 1' }],
            },
          },
          siteStatusCode: {
            getSiteStatusCd: {
              data: [{ key: 'ACTIVE', value: 'Active' }],
            },
          },
          schedule2Ref: {
            getSchedule2Ref: {
              data: [{ key: '1', value: 'Schedule 2 Ref 1' }],
            },
          },
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
    const pageComponent = screen.getByTestId(
      'srupdates-siteassociations-component',
    );
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

  it('View links use sibling tab paths', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/site/details/9/updates']}>
          <Routes>
            <Route path="/site/details/:id">
              <Route path=":tab" element={<SRUpdates />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    const summary = screen.getByTestId('site-summary-component');
    expect(summary.querySelector('a')).toHaveAttribute(
      'href',
      '/site/details/9/summary',
    );

    const notations = screen.getByTestId('srupdates-notation-component');
    expect(notations.querySelector('a')).toHaveAttribute(
      'href',
      '/site/details/9/notations',
    );
  });
});
