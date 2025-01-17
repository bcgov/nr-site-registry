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
import { ActiveToolEnum } from '../../../constants/Constant';

const acceptedParams = {
  site: StringParam,
  search: StringParam,
  polygon: JsonParam,
};
interface MapSearchQueryParamsContextType {
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
}

export const MapSearchQueryParamsContext =
  createContext<MapSearchQueryParamsContextType>({
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

  useEffect(() => {
    const { polygon } = query;
    if (polygon && Array.isArray(polygon) && polygon.length > 2) {
      setActiveToolState(ActiveToolEnum.polygonSearch);
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

  return (
    <MapSearchQueryParamsContext.Provider
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
      }}
    >
      {children}
    </MapSearchQueryParamsContext.Provider>
  );
};

export const useMapSearchContext = () =>
  useContext(MapSearchQueryParamsContext);
