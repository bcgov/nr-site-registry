import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import clsx from 'clsx';

// import {
//   setMyLocationVisible,
//   useMyLocationVisible,
// } from '@/features/map/map-slice'
// import { useGeolocationPermission } from '@/hooks/useMyLocation'

import { FindMe } from '../../components/common/icon';

export function FindMeButton() {
  //   const dispatch = useDispatch()
  //   const isMarkerVisible = useMyLocationVisible()

  //   const state = useGeolocationPermission()
  // No point in showing the button if the permission has been denied
  //   if (state === 'denied') {
  //     return null
  //   }

  //   const onClick = () => {
  //     dispatch(setMyLocationVisible(!isMarkerVisible))
  //   }

  return (
    <Button
      variant="contained"
      size="large"
      color="secondary"
      className={clsx(
        'map-button',
        'map-button--large',
        // isMarkerVisible && 'map-button--active',
      )}
      startIcon={<FindMe title="Find me icon" className="find-me-icon" />}
      //   onClick={onClick}
    >
      Find Me
    </Button>
  );
}
