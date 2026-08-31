import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { recentViewedColumns } from './DashboardConfig';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureStore([thunk]);

describe('Dashboard Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      dashboard: {
        recentView: {
          data: [
            {
              address: '4123 HILLY ROAD Demo',
              city: 'NORTH VANCOUVER',
              generalDescription:
                'LAT/LON DERIVED BY BC ENVIRONMENT REFERENCING RECTIFIED NAD 83 ORTHOPHOTOGRAPHY - JAN. 27,1997',
              siteId: '9',
              userId: 'xxx-ffff-oooo',
              whenUpdated: '2016-11-22T08:00:00.000Z',
            },
          ],
        },
      },
    });
  });

  it('renders Recently Viewed table', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>,
    );
    expect(getByText('Recently Viewed')).toBeInTheDocument();
  });

  it('links Site ID and Details to /site/details/ without a dashboard prefix', () => {
    const siteIdColumn = recentViewedColumns.find(
      (c) => c.displayName === 'Site ID',
    );
    const detailsColumn = recentViewedColumns.find(
      (c) => c.displayName === 'Details',
    );

    expect(siteIdColumn?.displayType?.href).toBe('/site/details/');
    expect(detailsColumn?.displayType?.href).toBe('/site/details/');
  });
});
