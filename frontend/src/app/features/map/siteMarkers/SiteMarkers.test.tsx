import { render, screen, fireEvent } from '@testing-library/react';
import { SiteMarkers } from './SiteMarkers';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';

const mockFlyTo = jest.fn();

jest.mock('react-leaflet', () => ({
  useMap: () => ({
    flyTo: mockFlyTo,
    getZoom: () => 10,
  }),
}));

jest.mock('../mapSearchContext/MapSearchContext');

jest.mock('react-leaflet-cluster', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cluster">{children}</div>
  ),
}));

jest.mock('./SiteMarker', () => ({
  SiteMarker: ({
    isSelected,
    onClick,
  }: {
    isSelected?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid="site-marker"
      data-selected={String(!!isSelected)}
      onClick={onClick}
    />
  ),
}));

describe('SiteMarkers', () => {
  const mockSetQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMapSearchContext as jest.Mock).mockReturnValue({
      selectedSiteId: null,
      setQuery: mockSetQuery,
    });
  });

  it('selects site when id is number and selectedSiteId is string', () => {
    (useMapSearchContext as jest.Mock).mockReturnValue({
      selectedSiteId: '99',
      setQuery: mockSetQuery,
    });
    render(
      <SiteMarkers
        sites={[
          { id: 99, latdeg: 49, longdeg: -123, addrLine_1: 'a' },
          { id: 100, latdeg: 50, longdeg: -124, addrLine_1: 'b' },
        ]}
      />,
    );
    const markers = screen.getAllByTestId('site-marker');
    expect(markers.filter((m) => m.dataset.selected === 'true')).toHaveLength(
      1,
    );
    expect(markers.filter((m) => m.dataset.selected === 'false')).toHaveLength(
      1,
    );
  });

  it('renders only non-selected markers in cluster when none selected', () => {
    render(
      <SiteMarkers
        sites={[{ id: 1, latdeg: 49, longdeg: -123, addrLine_1: 'x' }]}
      />,
    );
    expect(screen.getAllByTestId('site-marker')).toHaveLength(1);
    expect(screen.getByTestId('site-marker').dataset.selected).toBe('false');
  });

  it('skips rendering markers when site has no coordinates for selection', () => {
    (useMapSearchContext as jest.Mock).mockReturnValue({
      selectedSiteId: '1',
      setQuery: mockSetQuery,
    });
    render(
      <SiteMarkers
        sites={[{ id: 1, latdeg: null, longdeg: -123, addrLine_1: '' }]}
      />,
    );
    expect(screen.queryAllByTestId('site-marker')).toHaveLength(0);
  });

  it('calls setQuery and flyTo on marker click', () => {
    render(
      <SiteMarkers
        sites={[{ id: 55, latdeg: 48, longdeg: -122, addrLine_1: 'z' }]}
      />,
    );
    fireEvent.click(screen.getByTestId('site-marker'));
    expect(mockSetQuery).toHaveBeenCalledWith({ site: 55 });
    expect(mockFlyTo).toHaveBeenCalled();
  });
});
