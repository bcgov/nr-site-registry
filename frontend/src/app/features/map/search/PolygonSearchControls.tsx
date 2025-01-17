import { Button } from '../../../components/button/Button';
import {
  TickIcon,
  TrashCanIcon,
  XmarkIcon,
} from '../../../components/common/icon';
import { useMapSearchContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';

export const PolygonSearchControls = () => {
  const {
    deleteLastDrawShapeVertex,
    finishPolygonDraw,
    setActiveTool,
    isDrawingPolygon,
    drawShapeVertices,
    deletePolygon,
  } = useMapSearchContext();
  return (
    <div className="d-flex gap-2">
      <Button onClick={() => setActiveTool(null)}>
        <XmarkIcon />
        Cancel
      </Button>
      {isDrawingPolygon && (
        <Button
          onClick={deleteLastDrawShapeVertex}
          disabled={drawShapeVertices.length === 0}
        >
          <TrashCanIcon />
          Delete Last Point
        </Button>
      )}
      {!isDrawingPolygon && (
        <Button onClick={deletePolygon}>
          <TrashCanIcon />
          Delete Shape
        </Button>
      )}

      <Button
        onClick={finishPolygonDraw}
        disabled={!isDrawingPolygon || drawShapeVertices.length < 3}
      >
        <TickIcon />
        Finish Shape
      </Button>
    </div>
  );
};
