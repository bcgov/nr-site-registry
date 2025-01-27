import { Slider, Typography } from '@mui/material';
import clsx from 'clsx';
import {
  ActiveToolEnum,
  MAX_CIRCLE_RADIUS,
  MIN_CIRCLE_RADIUS,
} from '../../../constants/Constant';
import { XmarkIcon } from '../../../components/common/icon';
import DropdownButton from '../DropDownButton';
import { formatDistance } from '../../../helpers/utility';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/button/Button';
import { Site } from '../MapView';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';

interface RadiusSearchProps {
  isSmall?: boolean;
  className?: string;
}

export function RadiusSearch({
  isSmall = false,
  className,
}: Readonly<RadiusSearchProps>) {
  const { center, radius, handleRadiusChange, clearRadiusSearch } =
    useMapSearchContext();

  const [localRadius, setLocalRadius] = useState(radius);

  const isCenterValid = center !== null;

  const handleChange = (_ev: any, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setLocalRadius(newValue);
    } else if (Array.isArray(newValue) && newValue.length > 0) {
      setLocalRadius(newValue[0]);
    }
  };

  const handleChangeCommitted = (_ev: any, newValue: number | number[]) => {
    handleRadiusChange(_ev, newValue);
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
        max={MAX_CIRCLE_RADIUS}
        step={MIN_CIRCLE_RADIUS}
        defaultValue={MIN_CIRCLE_RADIUS}
        value={localRadius}
        onChangeCommitted={handleChangeCommitted} //Make fetch request on change commit
        onChange={handleChange} //This is kept to keep the slider move smoothly without making fetch requests
      />
      <Typography className="point-search-slider-text">
        {formatDistance(localRadius, 1)}
      </Typography>
    </div>
  );

  return isSmall ? (
    sliderBox
  ) : (
    <div className={clsx('point-search', className)}>
      <>
        <Button size="medium" onClick={clearRadiusSearch}>
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
    </div>
  );
}
