import { Button } from '@mui/material';
import clsx from 'clsx';
import { MapPin } from '../../../components/common/icon';
import { useContext } from 'react';
import { MapSearchQueryParamsContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';

interface Props {
  isActive: boolean;
  onClick: () => void;
}

export function RadiusSearchButton({ isActive, onClick }: Readonly<Props>) {
  const { searchTerm, setQuery, clearQuery } = useContext(
    MapSearchQueryParamsContext,
  );

  return (
    <Button
      variant="contained"
      color="secondary"
      size="medium"
      className={clsx(
        'map-button',
        'map-button--medium',
        isActive && 'map-button--active',
      )}
      onClick={onClick}
      startIcon={
        <MapPin
          title="Radius search icon"
          className={clsx(
            'radius-search-icon',
            isActive && 'radius-search-icon--active',
          )}
        />
      }
    >
      Radius Search
    </Button>
  );
}
