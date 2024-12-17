import { Button } from '@mui/material';
import clsx from 'clsx';
import { MapPin } from '../../../components/common/icon';

interface Props {
  isActive: boolean;
  onClick: () => void;
}

export function RadiusSearchButton({ isActive, onClick }: Readonly<Props>) {
  return (
    <Button
      variant="contained"
      color="secondary"
      size="medium"
      className={clsx(
        'map-button',
        'map-button--medium',
        'point-search-button',
        isActive && 'map-button--active',
      )}
      onClick={onClick}
      startIcon={
        <MapPin title="Radius search icon" className="radius-search-icon" />
      }
    >
      Radius Search
    </Button>
  );
}
