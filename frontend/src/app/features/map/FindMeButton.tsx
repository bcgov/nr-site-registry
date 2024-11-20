import { useDispatch } from 'react-redux';
import { Button, Icon, useMediaQuery, useTheme } from '@mui/material';
import clsx from 'clsx';

import { FindMe } from '../../components/common/icon';
import { useGeolocationPermission } from '../../../hooks/useMyLocation';
import { setMyLocationVisible, useMyLocationVisible } from './map-slice';
import { useState } from 'react';
import { MyLocationMarker } from './MyLocationMarker';

interface FindMeButtonProps {
  mapRef: React.RefObject<L.Map>;
}

export function FindMeButton({ mapRef }: FindMeButtonProps) {
  const dispatch = useDispatch();
  const isMarkerVisible = false;
  const [isLocationVisible, setLocationVisible] = useState(false);
  const state = useGeolocationPermission();

  if (state === 'denied') {
    return null;
  }

  const onClick = () => {
    //dispatch(setMyLocationVisible(!isMarkerVisible));
    setLocationVisible(!isLocationVisible);
    if (mapRef.current) {
      // Use mapRef to interact with the map instance
      const map = mapRef.current;
      map.locate({ setView: true, maxZoom: 16 });
    }
  };

  return (
    <>
      <Button
        variant="contained"
        size="large"
        color="secondary"
        className={clsx(
          'map-button',
          'map-button--large',
          isMarkerVisible && 'map-button--active',
        )}
        startIcon={<FindMe title="Find me icon" className="find-me-icon" />}
        onClick={onClick}
      >
        Find Me
      </Button>
      {isLocationVisible && (
        <MyLocationMarker mapRef={mapRef} isVisible={isLocationVisible} />
      )}
    </>
  );
}
