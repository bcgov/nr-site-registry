import { Button } from '@mui/material';
import clsx from 'clsx';

import { FindMe } from '../../components/common/icon';
import { useGeolocationPermission } from '../../../hooks/useMyLocation';

interface FindMeButtonProps {
  isLocationVisible: boolean;
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FindMeButton({
  isLocationVisible,
  setLocationVisible,
}: FindMeButtonProps) {
  const state = useGeolocationPermission();

  if (state === 'denied') {
    return null;
  }

  const onClick = () => {
    setLocationVisible((prev) => !prev);
  };

  return (
    <Button
      variant="contained"
      size="large"
      color="secondary"
      className={clsx(
        'map-button',
        'map-button--large',
        isLocationVisible && 'map-button--active',
      )}
      startIcon={
        <FindMe
          title="Find me icon"
          className={clsx(
            'find-me-icon',
            isLocationVisible && 'find-me-icon--active',
          )}
        />
      }
      onClick={onClick}
    >
      Find Me
    </Button>
  );
}
