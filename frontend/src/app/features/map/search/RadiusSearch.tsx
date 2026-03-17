import { Slider, Typography, TextField } from '@mui/material';
import clsx from 'clsx';
import {
  ActiveToolEnum,
  MAX_CIRCLE_RADIUS,
  MIN_CIRCLE_RADIUS,
} from '../../../constants/Constant';
import { XmarkIcon } from '../../../components/common/icon';
import DropdownButton from '../DropDownButton';
import { formatDistance } from '../../../helpers/utility';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Helper to get km value using same logic as formatDistance
  const getKmValue = (meters: number): string => {
    if (isNaN(meters)) return '0';
    const kms = Number((meters / 1000).toFixed(2));
    return kms.toString();
  };

  const [inputValue, setInputValue] = useState(getKmValue(radius));
  const [inputError, setInputError] = useState<string>('');

  const isCenterValid = center !== null;

  // Sync with context radius when it changes externally
  useEffect(() => {
    if (radius !== localRadius) {
      setLocalRadius(radius);
      setInputValue(getKmValue(radius));
      setInputError('');
    }
  }, [radius]);

  // Convert km to meters
  const kmToMeters = (km: number): number => {
    return Math.round(km * 1000);
  };

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY_MS = 500; // 500ms pause before API call

  // Helper function to clear debounce timer
  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /*Debounced commit function - called after user pauses typing
  // * It delays the API call until typing pauses for 500ms. It:
  // * Resets the timer on each keystroke
  // * Cancels pending calls when needed
  // * Calls handleRadiusChange after the delay
  // * Cleans up on unmount
  // This balances responsiveness (immediate UI updates) with efficiency (fewer API calls).*/
  const debouncedCommit = useCallback(
    (metersValue: number) => {
      // Clear any existing timer
      clearDebounceTimer();

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        handleRadiusChange(metersValue);
      }, DEBOUNCE_DELAY_MS);
    },
    [handleRadiusChange, clearDebounceTimer],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearDebounceTimer();
    };
  }, [clearDebounceTimer]);

  // Keep original logic - just adding input sync
  const handleChange = (_ev: any, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setLocalRadius(newValue);
      setInputValue(getKmValue(newValue));
      setInputError('');
    } else if (Array.isArray(newValue) && newValue.length > 0) {
      setLocalRadius(newValue[0]);
      setInputValue(getKmValue(newValue[0]));
      setInputError('');
    }
  };

  // Keep original logic - no changes
  const handleChangeCommitted = (_ev: any, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      handleRadiusChange(newValue);
    } else if (Array.isArray(newValue) && newValue.length > 0) {
      handleRadiusChange(newValue[0]);
    }
  };

  // Handle input change - updates local state and slider (input in km, convert to meters)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    // Parse as number (interpreted as kilometers)
    const numericValue = value.trim() === '' ? null : parseFloat(value);

    if (numericValue === null || isNaN(numericValue)) {
      setInputError('Enter a number (in kilometers)');
      clearDebounceTimer();
      return;
    }

    // Convert km to meters
    const metersValue = kmToMeters(numericValue);

    // Validate bounds (in meters)
    if (metersValue < MIN_CIRCLE_RADIUS) {
      setInputError(
        `Minimum radius is ${formatDistance(MIN_CIRCLE_RADIUS, 1)}`,
      );
      setLocalRadius(Math.max(metersValue, MIN_CIRCLE_RADIUS));
      clearDebounceTimer();
      return;
    }

    if (metersValue > MAX_CIRCLE_RADIUS) {
      setInputError(
        `Maximum radius is ${formatDistance(MAX_CIRCLE_RADIUS, 1)}`,
      );
      setLocalRadius(Math.min(metersValue, MAX_CIRCLE_RADIUS));
      clearDebounceTimer();
      return;
    }

    // Valid value - update both input display and slider
    setInputError('');
    setLocalRadius(metersValue);

    // Trigger debounced API call
    debouncedCommit(metersValue);
  };

  // Handle input blur/enter - commit the change
  const handleInputCommit = () => {
    const numericValue =
      inputValue.trim() === '' ? null : parseFloat(inputValue);

    // Clear any pending debounced call
    clearDebounceTimer();

    if (numericValue === null || isNaN(numericValue)) {
      // Invalid - reset to current valid radius
      setInputValue(getKmValue(radius));
      setLocalRadius(radius);
      setInputError('');
      return;
    }

    // Convert km to meters
    const metersValue = kmToMeters(numericValue);

    // Validate bounds
    if (metersValue < MIN_CIRCLE_RADIUS || metersValue > MAX_CIRCLE_RADIUS) {
      // Out of bounds - reset to current valid radius
      setInputValue(getKmValue(radius));
      setLocalRadius(radius);
      setInputError('');
      return;
    }

    // Valid value - commit it
    setInputError('');
    setLocalRadius(metersValue);
    handleRadiusChange(metersValue);
    // Ensure input shows the formatted km value
    setInputValue(getKmValue(metersValue));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInputCommit();
    }
  };

  const sliderBox = (
    <div className="point-search-slider-content">
      {isSmall && (
        <Typography className="point-search-slider-text">
          Set Radius:
        </Typography>
      )}

      {/* Text Input for Precise Radius - Compact layout */}
      <div className="radius-input-container">
        <TextField
          label="Radius (km)"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputCommit}
          onKeyDown={handleInputKeyDown}
          error={!!inputError}
          helperText={
            inputError ||
            `Enter radius in kilometers (min: ${formatDistance(MIN_CIRCLE_RADIUS, 1)}, max: ${formatDistance(MAX_CIRCLE_RADIUS, 1)})`
          }
          size="small"
          disabled={!isCenterValid}
          className="radius-text-input"
          type="number"
          inputProps={{
            'aria-label': 'Radius input in kilometers',
            step: 0.1,
          }}
        />
      </div>

      {/* Slider Row - slider and value on same row */}
      <div className="radius-slider-row">
        <Slider
          className={clsx(
            'point-search-slider',
            isSmall && 'point-search-slider--shrink',
          )}
          aria-label="Search radius"
          valueLabelDisplay="off"
          min={MIN_CIRCLE_RADIUS}
          max={MAX_CIRCLE_RADIUS}
          step={MIN_CIRCLE_RADIUS}
          defaultValue={MIN_CIRCLE_RADIUS}
          value={localRadius}
          onChangeCommitted={handleChangeCommitted}
          onChange={handleChange}
        />
        <Typography className="point-search-slider-text">
          {formatDistance(localRadius, 1)}
        </Typography>
      </div>
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
