//import { useDispatch } from 'react-redux'
import { Button, Slider, Typography } from '@mui/material';
import clsx from 'clsx';
import { MIN_CIRCLE_RADIUS } from '../../../constants/Constant';
import { XmarkIcon } from '../../../components/common/icon';
import DropdownButton from '../DropDownButton';
import { formatDistance } from '../../../helpers/utility';
import { useState } from 'react';

//import DropdownButton from '@/components/DropdownButton'

// import { clearActiveTool } from '@/features/map/map-slice'
// import {
//   resetPointFilter,
//   setPointFilterRadius,
//   usePointFilterRadius,
// } from '@/features/omrr/omrr-slice'
// import { formatDistance } from '@/utils/utils'

// import CloseIcon from '@/assets/svgs/fa-close.svg?react'

interface Props {
  isSmall?: boolean;
  className?: string;
}

export function RadiusSearch({ isSmall = false, className }: Readonly<Props>) {
  const [radius, setRadius] = useState(MIN_CIRCLE_RADIUS);

  //   const updateRadius = (newRadius) => {
  //     setPointFilterRadius(newRadius);
  //   };

  const onCancel = () => {
    setRadius(MIN_CIRCLE_RADIUS);
  };

  const onRadiusChange = (_ev: any, value: number | number[]) => {
    const newRadius = Math.max(
      Array.isArray(value) ? value[0] : value,
      MIN_CIRCLE_RADIUS,
    );
    setRadius(newRadius);
    //dispatch(setPointFilterRadius(newRadius))
  };

  const sliderBox = (
    <div className="point-search-slider-content">
      {isSmall && (
        <Typography className="point-search-slider-text">
          Set Radius:
        </Typography>
      )}
      <Slider
        className={clsx(
          'point-search-slider',
          isSmall && 'point-search-slider--shrink',
        )}
        aria-label="Search radius"
        valueLabelDisplay="off"
        min={MIN_CIRCLE_RADIUS}
        // 500 km is roughly half the size of BC
        max={500000}
        step={MIN_CIRCLE_RADIUS}
        defaultValue={MIN_CIRCLE_RADIUS}
        value={radius}
        onChange={onRadiusChange}
      />
      <Typography className="point-search-slider-text">
        {formatDistance(radius, 1)}
      </Typography>
    </div>
  );

  return isSmall ? (
    sliderBox
  ) : (
    <div className={clsx('point-search', className)}>
      <Button
        color="primary"
        variant="contained"
        size="medium"
        onClick={onCancel}
        startIcon={<XmarkIcon className="point-cancel-icon" />}
      >
        Cancel
      </Button>
      <DropdownButton
        id="pointSearchSetRadiusButton"
        color="primary"
        variant="contained"
        size="medium"
        menuClassName="point-search-menu"
        dropdownContent={sliderBox}
      >
        Set Radius
      </DropdownButton>
    </div>
  );
}
