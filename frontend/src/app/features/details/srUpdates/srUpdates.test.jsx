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
// import siteRouter from '../../../../app/routes/Routes';

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
        notation: [],
        siteSummaryData: {},
        siteParticipants: [],
        landUsesData: [],
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
    console.log(screen)
    const pageComponent = screen.getByTestId('srreviewtab-component');
    expect(pageComponent).toBeInTheDocument();
  });

  
  it('Renders Approval Reject Wrapper Component', () => {
    render(
      <Provider store={store}>
        <RouterProvider router={createBrowserRouter(testSiteRouter)} />
      </Provider>,
    );
    console.log(screen)
    const pageComponent = screen.getByTestId('site-summary-component');
    expect(pageComponent).toBeInTheDocument();
  });

});
