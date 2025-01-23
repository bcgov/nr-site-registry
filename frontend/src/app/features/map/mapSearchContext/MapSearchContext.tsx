import { LatLngTuple } from 'leaflet';
import {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  DecodedValueMap,
  StringParam,
  UrlUpdateType,
  JsonParam,
  useQueryParams,
} from 'use-query-params';
import { ActiveToolEnum, MIN_CIRCLE_RADIUS } from '../../../constants/Constant';
import { clear } from 'console';

const acceptedParams = {
  site: StringParam,
  search: StringParam,
  polygon: JsonParam,
  circle: JsonParam,
};
interface MapSearchContextType {
  selectedSiteId: string | null;
  searchTerm: string | null;
  setQuery: (
    values: Partial<DecodedValueMap<typeof acceptedParams>>,
    updateType?: UrlUpdateType,
  ) => void;
  clearQuery: () => void;
  isDrawingPolygon: boolean;
  drawShapeVertices: LatLngTuple[];
  polygonVertices: LatLngTuple[];
  addDrawShapeVertex: (coordinates: LatLngTuple) => void;
  deleteLastDrawShapeVertex: () => void;
  finishPolygonDraw: () => void;
  deletePolygon: () => void;
  activeTool: ActiveToolEnum | null;
  setActiveTool: (tool: ActiveToolEnum | null) => void;
  radius: number;
  center: LatLngTuple | null;
  onRadiusCrossHairClick: (newCenter: LatLngTuple) => void;
  onRadiusChange: (_ev: any, value: number | number[]) => void;
  onCancelRadiusSearch: () => void;
  handleRadiusToolClick: () => void;
}

export const MapSearchContext = createContext<MapSearchContextType>({
  selectedSiteId: null,
  searchTerm: null,
  setQuery: () => {},
  clearQuery: () => {},
  isDrawingPolygon: false,
  drawShapeVertices: [],
  polygonVertices: [],
  addDrawShapeVertex: () => {},
  deleteLastDrawShapeVertex: () => {},
  finishPolygonDraw: () => {},
  deletePolygon: () => {},
  activeTool: null,
  setActiveTool: () => {},
  radius: MIN_CIRCLE_RADIUS,
  center: null,
  onRadiusCrossHairClick: () => {},
  onRadiusChange: () => {},
  onCancelRadiusSearch: () => {},
  handleRadiusToolClick: () => {},
});

export const MapSearchQueryProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  const [query, setQuery] = useQueryParams(acceptedParams);
  const [activeTool, setActiveToolState] = useState<ActiveToolEnum | null>(
    null,
  );

  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [drawShapeVertices, setDrawShapeVertices] = useState<LatLngTuple[]>([]);

  const [radius, setRadius] = useState(MIN_CIRCLE_RADIUS);
  const [center, setCenter] = useState<LatLngTuple | null>(null);

  useEffect(() => {
    const { polygon, circle } = query;
    if (polygon && Array.isArray(polygon) && polygon.length > 2) {
      setActiveToolState(ActiveToolEnum.polygonSearch);
    }

    if (circle) {
      setActiveToolState(ActiveToolEnum.radiusSearch);
    }
    // This should only run on the initial load to read the query params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addDrawShapeVertex = (coordinates: LatLngTuple) => {
    setDrawShapeVertices((prev) => [...prev, coordinates]);
  };

  const deleteLastDrawShapeVertex = () => {
    setDrawShapeVertices((prev) => prev.slice(0, -1));
  };

  const deletePolygon = () => {
    clearQuery();
    setDrawShapeVertices([]);
    setIsDrawingPolygon(true);
  };

  const finishPolygonDraw = () => {
    setIsDrawingPolygon(false);
    if (drawShapeVertices.length > 2) {
      setQuery({ polygon: drawShapeVertices }, 'replace');
    }
  };

  // const finishRadiusSearchSetup = () => {
  //   if (center && radius > MIN_CIRCLE_RADIUS) {
  //     const [latitude, longitude] = center;
  //     setQuery({ circle: {latitude, longitude, radius} }, 'replace');
  //   }
  // }

  const setActiveTool = (tool: ActiveToolEnum | null) => {
    const nextTool = activeTool === tool ? null : tool;
    setActiveToolState(nextTool);

    if (nextTool === null) {
      clearQuery();
      setDrawShapeVertices([]);
      setIsDrawingPolygon(false);
    }

    if (nextTool === ActiveToolEnum.polygonSearch) {
      setIsDrawingPolygon(true);
    }
  };

  const clearQuery = () => setQuery({}, 'replace');

  const onRadiusCrossHairClick = (newCenter: LatLngTuple) => {
    setCenter(newCenter);
  };

  const onRadiusChange = (_ev: any, value: number | number[]) => {
    const newRadius = Math.max(
      Array.isArray(value) ? value[0] : value,
      MIN_CIRCLE_RADIUS,
    );
    setRadius(newRadius);
    if (center && newRadius > MIN_CIRCLE_RADIUS) {
      const [latitude, longitude] = center;
      console.log(
        'nupur - params for setQuery are : latitude',
        latitude,
        'longitude',
        longitude,
        'radius',
        newRadius,
      );
      setQuery({ circle: { latitude, longitude, radius } }, 'replace');
    }
  };

  const onCancelRadiusSearch = () => {
    // setIsVisible(false);
    clearQuery();
    setActiveToolState(null);
    setRadius(MIN_CIRCLE_RADIUS);
  };

  const handleRadiusToolClick = () => {
    setActiveTool(ActiveToolEnum.radiusSearch);
    setRadius(MIN_CIRCLE_RADIUS);
  };

  return (
    <MapSearchContext.Provider
      value={{
        selectedSiteId: query.site || null,
        searchTerm: query.search || null,
        setQuery,
        clearQuery,
        isDrawingPolygon,
        drawShapeVertices: drawShapeVertices,
        polygonVertices: (query.polygon || []) as LatLngTuple[],
        addDrawShapeVertex,
        deleteLastDrawShapeVertex,
        finishPolygonDraw,
        deletePolygon,
        activeTool,
        setActiveTool,
        radius,
        center,
        onRadiusCrossHairClick,
        onRadiusChange,
        onCancelRadiusSearch,
        handleRadiusToolClick,
      }}
    >
      {children}
    </MapSearchContext.Provider>
  );
};

export const useMapSearchContext = () => useContext(MapSearchContext);
