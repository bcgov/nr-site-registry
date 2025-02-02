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
import { LayerKey } from '../dataLayers/Layers';

const acceptedParams = {
  site: StringParam,
  search: StringParam,
  polygon: JsonParam,
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
  selectedDataLayers: Set<LayerKey>;
  toggleDataLayerSelection: (layer: LayerKey) => void;
  resetDataLayers: () => void;
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
  selectedDataLayers: new Set(),
  toggleDataLayerSelection: () => {},
  resetDataLayers: () => {},
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
  const [selectedDataLayers, setSelectedDataLayers] = useState(
    new Set<LayerKey>(),
  );

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

  const toggleDataLayerSelection = (layer: LayerKey) => {
    setSelectedDataLayers((prevSelectedLayers) => {
      const newSelectedLayers = new Set(prevSelectedLayers);
      if (newSelectedLayers.has(layer)) {
        newSelectedLayers.delete(layer);
      } else {
        newSelectedLayers.add(layer);
      }
      return newSelectedLayers;
    });
  };

  const resetDataLayers = () => {
    setSelectedDataLayers(new Set());
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
        selectedDataLayers,
        toggleDataLayerSelection,
        resetDataLayers,
      }}
    >
      {children}
    </MapSearchContext.Provider>
  );
};

export const useMapSearchContext = () => useContext(MapSearchContext);
