import { Button } from '@mui/material';
import clsx from 'clsx';

import { FindMe } from '../../components/common/icon';
import { useGeolocationPermission } from '../../../hooks/useMyLocation';

import { useState } from 'react';

interface FindMeButtonProps {
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FindMeButton({ setLocationVisible }: FindMeButtonProps) {
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

  return (
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
  );
}
