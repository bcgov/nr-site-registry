import { IconButton } from '@mui/material';
import clsx from 'clsx';

import { useGeolocationPermission } from '../../../../hooks/useMyLocation';

import { FindMe } from '../../../components/common/icon';

interface FindMeControlProps {
  isLocationVisible: boolean;
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FindMeControl({
  isLocationVisible,
  setLocationVisible,
}: FindMeControlProps) {
  const state = useGeolocationPermission();
  if (state === 'denied') {
    return null;
  }

  const onClick = () => {
    setLocationVisible((prev) => !prev);
  };

  // This component is a button shown as an icon on mobile version that allows the user to find their location on the map.

  return (
    <IconButton
      className={clsx(
        'map-control-button',
        isLocationVisible && 'map-control-button--active',
      )}
      onClick={onClick}
      title="Show my location on the map"
    >
      <FindMe />
    </IconButton>
  );
}
