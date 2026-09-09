import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import SiteDetailsTabRouter from './SiteDetailsTabRouter';

jest.mock('../summary/Summary', () => ({
  __esModule: true,
  default: () => <div>summary-view</div>,
}));
jest.mock('../notations/Notations', () => ({
  __esModule: true,
  default: () => <div>notations-view</div>,
}));
jest.mock('../participants/Participant', () => ({
  __esModule: true,
  default: () => <div>participants-view</div>,
}));
jest.mock('../documents/Documents', () => ({
  __esModule: true,
  default: () => <div>documents-view</div>,
}));
jest.mock('../associates/Associate', () => ({
  __esModule: true,
  default: () => <div>associated-view</div>,
}));
jest.mock('../landUses/LandUses', () => ({
  __esModule: true,
  default: () => <div>landuses-view</div>,
}));
jest.mock('../parcelDescriptions/parcelDescriptions', () => ({
  __esModule: true,
  default: () => <div>parceldesc-view</div>,
}));
jest.mock('../disclosure/Disclosure', () => ({
  __esModule: true,
  default: () => <div>disclosure-view</div>,
}));
jest.mock('../srUpdates/srUpdates', () => ({
  __esModule: true,
  default: () => <div>updates-view</div>,
}));

const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  );
};

const renderTab = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/site/details/:id"
          element={
            <>
              <LocationDisplay />
              <Outlet />
            </>
          }
        >
          <Route path=":tab" element={<SiteDetailsTabRouter />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('SiteDetailsTabRouter', () => {
  it('renders the tab that matches the path', () => {
    renderTab('/site/details/9/notations');
    expect(screen.getByText('notations-view')).toBeInTheDocument();
  });

  it('replace-redirects an unknown tab segment to Summary and keeps the query string', () => {
    renderTab('/site/details/9/unknown-tab?applicationId=abc');
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/site/details/9/summary?applicationId=abc',
    );
    expect(screen.getByText('summary-view')).toBeInTheDocument();
  });
});
