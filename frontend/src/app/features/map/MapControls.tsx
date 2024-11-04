import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import {
  MAP_CONTROLS_BOTTOM_LG,
  MAP_CONTROLS_BOTTOM_SM,
  MAP_CONTROLS_RIGHT_LG,
  MAP_CONTROLS_RIGHT_SM,
  MAP_CONTROLS_RIGHT_XL,
} from '../../constants/Constant';

import { Control } from './controls/Control';

import './MapControl.css';
import { FindMeControl } from './controls/FindMeControl';

interface MapControlsProps {
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapControls({ setLocationVisible }: MapControlsProps) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const isMedium = useMediaQuery(theme.breakpoints.down('lg'));
  const isLarge = useMediaQuery(theme.breakpoints.down('xl'));

  // Shift the controls based on screen size
  let right = MAP_CONTROLS_RIGHT_XL;
  if (isSmall) {
    right = MAP_CONTROLS_RIGHT_SM;
  } else if (isLarge) {
    right = MAP_CONTROLS_RIGHT_LG;
  }
  let bottom = MAP_CONTROLS_BOTTOM_LG;
  if (isSmall) {
    bottom = MAP_CONTROLS_BOTTOM_SM;
  }

  const style = useMemo(
    () => ({
      marginRight: `${right}px`,
      marginBottom: `${bottom}px`,
    }),
    [right, bottom],
  );

  return (
    <Control position="bottomright" className="map-controls" style={style}>
      {isMedium && <FindMeControl setLocationVisible={setLocationVisible} />}
    </Control>
  );
}
