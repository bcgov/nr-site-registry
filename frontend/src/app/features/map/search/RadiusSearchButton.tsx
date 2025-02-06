import clsx from 'clsx';
import { MapPin } from '../../../components/common/icon';
import { Button } from '../../../components/button/Button';

interface Props {
  isActive: boolean;
  onClick: () => void;
}

export function RadiusSearchButton({ isActive, onClick }: Readonly<Props>) {
  return (
    <Button variant="secondary" className="map-button" onClick={onClick}>
      <MapPin title="Radius search icon" />
      Radius Search
    </Button>
  );
}
