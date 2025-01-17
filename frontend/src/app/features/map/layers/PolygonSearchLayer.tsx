import { Polygon, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { useRef } from 'react';
import L, {
  LatLngTuple,
  LeafletMouseEvent,
  Polyline as LeafletPolyline,
  LatLng,
  LatLngExpression,
} from 'leaflet';
import { useMapCrosshairsCursor } from '../../../hooks/useMapCrossHairCursor';
import { CrosshairsTooltipMarker } from '../CrossHairToolTipMarker';
import { IconMarker } from '../IconMarker';
import { ActiveToolEnum } from '../../../constants/Constant';
import { useMapSearchContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';

const PolygonVertexIcon = L.divIcon({
  html: `<div />`,
  className: 'polygon-vertex',
});

export function PolygonSearchLayer() {
  const { activeTool } = useMapSearchContext();
  if (activeTool === ActiveToolEnum.polygonSearch) {
    return <PolygonSearch />;
  }
  return null;
}

export function PolygonSearch() {
  const {
    isDrawingPolygon,
    drawShapeVertices,
    addDrawShapeVertex,
    polygonVertices,
  } = useMapSearchContext();

  const map = useMap();
  useMapCrosshairsCursor(map);

  const dottedLineRef = useRef<LeafletPolyline>(null);
  const mousePositionRef = useRef<LatLng>(map.getCenter());

  useMapEvents({
    mousemove: (ev: LeafletMouseEvent) => {
      mousePositionRef.current = ev.latlng;
      if (drawShapeVertices.length > 0 && dottedLineRef.current) {
        const lastPosition = drawShapeVertices[drawShapeVertices.length - 1];
        dottedLineRef.current.setLatLngs([
          lastPosition,
          [ev.latlng.lat, ev.latlng.lng],
        ]);
      }
    },
    click: (ev: LeafletMouseEvent) => {
      if (isDrawingPolygon) {
        addDrawShapeVertex([ev.latlng.lat, ev.latlng.lng]);
      }
    },
  });

  const showCrosshairs = drawShapeVertices.length === 0;
  const drawLine = isDrawingPolygon && drawShapeVertices.length >= 2;
  const drawDottedLine = isDrawingPolygon && drawShapeVertices.length > 0;
  let dottedLinePositions: LatLngExpression[] = [];
  if (drawDottedLine) {
    dottedLinePositions = [
      drawShapeVertices[drawShapeVertices.length - 1],
      mousePositionRef.current,
    ];
  }

  const markerPositions: LatLngTuple[] = !isDrawingPolygon
    ? []
    : drawShapeVertices;
  return (
    <>
      {showCrosshairs && (
        <CrosshairsTooltipMarker>
          Click to start drawing a shape
        </CrosshairsTooltipMarker>
      )}
      {!isDrawingPolygon && (
        <Polygon
          positions={polygonVertices}
          className="polygon-search-polygon"
        />
      )}
      {drawLine && (
        <Polyline
          positions={drawShapeVertices}
          className="polygon-search-line"
        />
      )}
      {drawDottedLine && (
        <Polyline
          ref={dottedLineRef}
          positions={dottedLinePositions}
          className="polygon-search-line polygon-search-line--dotted"
        />
      )}
      {markerPositions.map((position, i) => (
        <IconMarker
          key={`PolygonVertex-${i}-${position[0]}-${position[1]}`}
          position={position}
          icon={PolygonVertexIcon}
          draggable={false}
          interactive={false}
        />
      ))}
    </>
  );
}
