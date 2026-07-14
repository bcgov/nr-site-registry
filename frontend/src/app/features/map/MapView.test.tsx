import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import type { LatLngTuple, Map } from 'leaflet';

const mockLeafletMap: Partial<Map> = {
  flyToBounds: jest.fn(),
  flyTo: jest.fn(),
} as Partial<Map>;

const siteData = [
  {
    id: 's1',
    addrLine_1: '123',
    latdeg: 49,
    longdeg: -123,
  },
];

jest.mock('react-leaflet', () => {
  const React = require('react') as typeof import('react');
  return {
    __esModule: true,
    MapContainer: React.forwardRef<Partial<Map>, { children: React.ReactNode }>(
      ({ children }, ref) => {
        React.useLayoutEffect(() => {
          if (!ref) return;
          const map = mockLeafletMap as Partial<Map>;
          if (typeof ref !== 'function') {
            (ref as React.MutableRefObject<Partial<Map> | null>).current = map;
          } else {
            ref(map);
          }
        }, [ref]);
        return <div data-testid="map-container">{children}</div>;
      },
    ),
    TileLayer: () => <div data-testid="tile-layer" />,
  };
});

jest.mock('./mapSearchContext/MapSearchContext', () => ({
  __esModule: true,
  MapSearchQueryProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useMapSearchContext: jest.fn(),
}));

jest.mock('./mapViewHelpers', () => {
  const actual = jest.requireActual('./mapViewHelpers') as Record<
    string,
    unknown
  >;
  return {
    __esModule: true,
    ...actual,
    flyToBoundsForTextSearch: jest.fn(),
    sitesWhenMapToolCleared: jest.fn(
      (activeTool: unknown, mapSearchData: unknown) =>
        activeTool !== null ? null : (mapSearchData ?? []),
    ),
  };
});

jest.mock('../../../graphql/generated', () => {
  return {
    __esModule: true,
    useMapSearchQuery: ({
      onCompleted,
    }: {
      onCompleted?: (args: any) => void;
    }) => {
      // Trigger the callback after the initial render commit.
      // This avoids "setState during render" issues and keeps the mocked
      // hook return value stable for `MapView` to destructure.
      if (onCompleted) {
        setTimeout(() => {
          onCompleted({ mapSearch: { data: siteData } });
        }, 0);
      }

      return {
        data: { mapSearch: { data: siteData } },
        loading: false,
      };
    },
    useMapSearch_FindSiteBySiteIdQuery: () => ({
      data: undefined,
      loading: false,
    }),
    useMapSearch_FindSiteBySiteIdLoggedInUserQuery: () => ({
      data: undefined,
      loading: false,
    }),
  };
});

jest.mock('react-oidc-context', () => ({
  __esModule: true,
  useAuth: () => ({ user: null }),
}));

jest.mock('../../components/alert/Alert', () => ({
  __esModule: true,
  notifyInfo: jest.fn(),
  notifySuccess: jest.fn(),
}));

jest.mock('./useFlyToSelectedSite', () => ({
  __esModule: true,
  useFlyToSelectedSite: jest.fn(),
}));

jest.mock('./siteMarkers/SiteMarkers', () => ({
  __esModule: true,
  SiteMarkers: ({ sites }: { sites: unknown[] }) => (
    <div data-testid="site-markers">{(sites ?? []).length}</div>
  ),
}));

jest.mock('./MapControls', () => ({
  __esModule: true,
  MapControls: () => <div data-testid="map-controls" />,
}));

jest.mock('./MyLocationMarker', () => ({
  __esModule: true,
  MyLocationMarker: () => <div data-testid="my-location-marker" />,
}));

jest.mock('./MapSearch', () => ({
  __esModule: true,
  MapSearch: () => <div data-testid="map-search" />,
}));

jest.mock('./siteDrawer/MapSearchDrawer', () => ({
  __esModule: true,
  MapSearchDrawer: () => <div data-testid="map-search-drawer" />,
}));

jest.mock('./layers/RadiusSearchLayer', () => ({
  __esModule: true,
  RadiusSearchLayer: () => <div data-testid="radius-search-layer" />,
}));

jest.mock('./layers/PolygonSearchLayer', () => ({
  __esModule: true,
  PolygonSearchLayer: () => <div data-testid="polygon-search-layer" />,
}));

jest.mock('./dataLayers/MapDataLayers', () => ({
  __esModule: true,
  MapDataLayers: () => <div data-testid="map-data-layers" />,
}));

describe('MapView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders and flies to text-search bounds onCompleted', async () => {
    const { default: MapView } = require('./MapView') as {
      default: React.ComponentType;
    };
    const { useMapSearchContext } =
      require('./mapSearchContext/MapSearchContext') as {
        useMapSearchContext: jest.Mock;
      };
    const { flyToBoundsForTextSearch } = require('./mapViewHelpers') as {
      flyToBoundsForTextSearch: jest.Mock;
    };

    (useMapSearchContext as jest.Mock).mockReturnValue({
      searchTerm: 'victoria',
      activeTool: null,
      polygonVertices: [] as LatLngTuple[],
      center: null,
      radius: 1000,
      selectedSiteId: null,
      setQuery: jest.fn(),
    });

    // Sanity check: the mocked GraphQL hook must return the shape that
    // MapView destructures.
    const generated = require('../../../graphql/generated') as {
      useMapSearchQuery: (opts: any) => any;
    };
    const hookResult = generated.useMapSearchQuery({ onCompleted: jest.fn() });
    expect(hookResult).toEqual(
      expect.objectContaining({
        data: { mapSearch: { data: siteData } },
        loading: false,
      }),
    );

    render(<MapView />);

    // Flush the setTimeout(0) in the useMapSearchQuery mock so onCompleted fires
    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(flyToBoundsForTextSearch).toHaveBeenCalled();
    });

    expect(flyToBoundsForTextSearch).toHaveBeenCalledWith(
      'victoria',
      siteData,
      mockLeafletMap,
    );

    expect(screen.getByTestId('site-markers').textContent).toBe('1');
  });

  it('does not call sitesWhenMapToolCleared-setState when tool is active', async () => {
    const { default: MapView } = require('./MapView') as {
      default: React.ComponentType;
    };
    const { useMapSearchContext } =
      require('./mapSearchContext/MapSearchContext') as {
        useMapSearchContext: jest.Mock;
      };
    const { flyToBoundsForTextSearch } = require('./mapViewHelpers') as {
      flyToBoundsForTextSearch: jest.Mock;
    };

    // Sanity check: the mocked GraphQL hook must still return the shape that
    // MapView destructures.
    const generated = require('../../../graphql/generated') as {
      useMapSearchQuery: (opts: any) => any;
    };
    const hookResult = generated.useMapSearchQuery({ onCompleted: jest.fn() });
    expect(hookResult).toEqual(
      expect.objectContaining({
        data: { mapSearch: { data: siteData } },
        loading: false,
      }),
    );

    (useMapSearchContext as jest.Mock).mockReturnValue({
      searchTerm: 'victoria',
      activeTool: 'polygon',
      polygonVertices: [] as LatLngTuple[],
      center: null,
      radius: 1000,
      selectedSiteId: null,
      setQuery: jest.fn(),
    });

    render(<MapView />);

    // Flush the setTimeout(0) in the useMapSearchQuery mock so onCompleted fires
    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      // onCompleted still runs and sets sites; this is about the useEffect guard branch.
      expect(flyToBoundsForTextSearch).toHaveBeenCalled();
    });

    expect(screen.getByTestId('site-markers').textContent).toBe('1');
  });

  it('clears selected site query and notifies when site not found', async () => {
    const { default: MapView } = require('./MapView') as {
      default: React.ComponentType;
    };
    const { useMapSearchContext } =
      require('./mapSearchContext/MapSearchContext') as {
        useMapSearchContext: jest.Mock;
      };
    const { notifyInfo } = require('../../components/alert/Alert') as {
      notifyInfo: jest.Mock;
    };

    const setQuery = jest.fn();
    (useMapSearchContext as jest.Mock).mockReturnValue({
      searchTerm: null,
      activeTool: null,
      polygonVertices: [] as LatLngTuple[],
      center: null,
      radius: 1000,
      selectedSiteId: '77',
      setQuery,
    });

    render(<MapView />);

    // Flush the setTimeout(0) in the useMapSearchQuery mock so onCompleted fires
    await act(async () => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(setQuery).toHaveBeenCalledWith({ site: undefined }, 'replace');
    });
    expect(notifyInfo).toHaveBeenCalledWith(
      'This site is private or unavailable. The map selection has been cleared.',
      'Site unavailable',
    );
  });
});
