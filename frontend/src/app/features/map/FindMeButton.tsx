<<<<<<< HEAD
import { useDispatch } from 'react-redux';
import { Button, Icon, useMediaQuery, useTheme } from '@mui/material';
=======
import { Button } from '@mui/material';
>>>>>>> 5c7547c (feat: SRS-527 Map Search – Find Me)
import clsx from 'clsx';

import { FindMe } from '../../components/common/icon';
import { useGeolocationPermission } from '../../../hooks/useMyLocation';
<<<<<<< HEAD
import { setMyLocationVisible, useMyLocationVisible } from './map-slice';

export function FindMeButton() {
  const dispatch = useDispatch();
  const isMarkerVisible = useMyLocationVisible();
  const state = useGeolocationPermission();

  if (state === 'denied') {
    return null;
  }

  const onClick = () => {
    dispatch(setMyLocationVisible(!isMarkerVisible));
=======

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
>>>>>>> 5c7547c (feat: SRS-527 Map Search – Find Me)
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
