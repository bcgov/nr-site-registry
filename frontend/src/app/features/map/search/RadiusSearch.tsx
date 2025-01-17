import { Slider, Typography } from '@mui/material';

import clsx from 'clsx';
import { ActiveToolEnum, MIN_CIRCLE_RADIUS } from '../../../constants/Constant';
import { XmarkIcon } from '../../../components/common/icon';
import DropdownButton from '../DropDownButton';
import { formatDistance } from '../../../helpers/utility';
import { useState } from 'react';
import { Button } from '../../../components/button/Button';
import { Site } from '../MapView';
import { useMapSearchContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';

interface RadiusSearchProps {
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
  isSmall?: boolean;
  className?: string;
}

export function RadiusSearch({
  radius = MIN_CIRCLE_RADIUS,
  setRadius,
  isSmall = false,
  className,
}: Readonly<RadiusSearchProps>) {
  const { setActiveTool } = useMapSearchContext();
  const [isVisible, setIsVisible] = useState(true);

  const onCancel = () => {
    setIsVisible(false);
    setActiveTool(null);
    setRadius(MIN_CIRCLE_RADIUS);
  };

  const onRadiusChange = (_ev: any, value: number | number[]) => {
    const newRadius = Math.max(
      Array.isArray(value) ? value[0] : value,
      MIN_CIRCLE_RADIUS,
    );
    setRadius(newRadius);
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
      {isVisible && (
        <>
          <Button size="medium" onClick={onCancel}>
            <XmarkIcon />
            Cancel
          </Button>
          <DropdownButton
            id="pointSearchSetRadiusButton"
            menuClassName="point-search-menu"
            dropdownContent={sliderBox}
          >
            Set Radius
          </DropdownButton>
        </>
      )}
    </div>
  );
}
