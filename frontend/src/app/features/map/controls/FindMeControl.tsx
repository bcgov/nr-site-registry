import { IconButton } from '@mui/material';
import clsx from 'clsx';

import { useGeolocationPermission } from '../../../../hooks/useMyLocation';

import { FindMe } from '../../../components/common/icon';
import { useState } from 'react';

interface FindMeControlProps {
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FindMeControl({ setLocationVisible }: FindMeControlProps) {
  const [isMarkerVisible, setIsMarkerVisible] = useState(false);
  const state = useGeolocationPermission();
  if (state === 'denied') {
    return null;
  }

  const onClick = () => {
    setLocationVisible((prev) => {
      const newValue = !prev;
      setIsMarkerVisible(newValue);
      return newValue;
    });
  };

  // This component is a button shown as an icon on mobile version that allows the user to find their location on the map.

  return (
    <IconButton
      className={clsx(
        'map-control-button',
        isMarkerVisible && 'map-control-button--active',
      )}
      onClick={onClick}
      title="Show my location on the map"
    >
      <FindMe />
    </IconButton>
  );
}
