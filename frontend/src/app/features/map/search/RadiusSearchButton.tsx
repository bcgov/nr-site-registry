import { Button } from '@mui/material';
import clsx from 'clsx';
import { MapPin } from '../../../components/common/icon';

export function RadiusSearchButton() {
  return (
    <Button
      variant="contained"
      color="secondary"
      size="medium"
      className={clsx(
        'map-button',
        'map-button--medium',
        'point-search-button',
      )}
      //   onClick={onClick}
      startIcon={
        <MapPin title="Radius search icon" className="radius-search-icon" />
      }
    >
      Radius Search
    </Button>
  );
}
