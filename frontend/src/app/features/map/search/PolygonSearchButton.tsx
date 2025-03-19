import { DrawPolygon } from '../../../components/common/icon';
import { Button } from '../../../components/button/Button';

interface Props {
  isActive: boolean;
  onClick: () => void;
}
export function PolygonSearchButton({ onClick }: Readonly<Props>) {
  return (
    <Button
      color="secondary"
      variant="secondary"
      className="map-button"
      onClick={onClick}
    >
      <DrawPolygon title="Polygon search icon" />
      Polygon Search
    </Button>
  );
}
