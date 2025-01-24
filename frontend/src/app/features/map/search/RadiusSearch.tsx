import { Slider, Typography } from '@mui/material';
import clsx from 'clsx';
import { ActiveToolEnum, MIN_CIRCLE_RADIUS } from '../../../constants/Constant';
import { XmarkIcon } from '../../../components/common/icon';
import DropdownButton from '../DropDownButton';
import { formatDistance } from '../../../helpers/utility';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/button/Button';
import { Site } from '../MapView';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';
import { on } from 'events';

interface RadiusSearchProps {
  // radius: number;
  // setRadius: React.Dispatch<React.SetStateAction<number>>;
  isSmall?: boolean;
  className?: string;
}

export function RadiusSearch({
  //radius = MIN_CIRCLE_RADIUS,
  //setRadius,
  isSmall = false,
  className,
}: Readonly<RadiusSearchProps>) {
  const { center, radius, onRadiusChange, onCancelRadiusSearch } =
    useMapSearchContext();

  console.log('nupur - RadiusSearch.tsx: center:', center);
  const isCenterValid = center !== null;
  console.log('nupur - RadiusSearch.tsx: center valid:', isCenterValid);

  console.log('nupur - RadiusSearch.tsx: radius:', radius);
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
        //defaultValue={MIN_CIRCLE_RADIUS}
        value={radius}
        onChangeCommitted={onRadiusChange}
        //onChange={onRadiusChange}
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
      {/* {isVisible && ( */}
      <>
        <Button size="medium" onClick={onCancelRadiusSearch}>
          <XmarkIcon />
          Cancel
        </Button>
        <DropdownButton
          id="pointSearchSetRadiusButton"
          menuClassName="point-search-menu"
          dropdownContent={sliderBox}
          disabled={!isCenterValid}
        >
          Set Radius
        </DropdownButton>
      </>
      {/* )} */}
    </div>
  );
}
