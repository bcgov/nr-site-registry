import { useEffect, useState } from 'react';

import { MyLocationData } from '../app/features/map/ILocation';
import {
  getGeolocationPermission,
  getMyLocation,
} from '../app/helpers/utility';

/**
 * Uses the navigator geolocation to find the GPS location of the user.
 * @returns { position, accuracy } object
 */
export function useMyLocation(): MyLocationData {
  const [data, setData] = useState<MyLocationData>({});

  useEffect(() => {
    getMyLocation(setData);
  }, []);

  return data;
}

/**
 * Allows querying the browser permissions to see if the geolocation
 * permission has been set (granted, prompt, denied).
 */
export function useGeolocationPermission(): PermissionState | undefined {
  const [state, setState] = useState<PermissionState | undefined>(undefined);

  useEffect(() => {
    // If there is an error - assume the permissions API is not supported
    // And the geolocation is probably still available
    getGeolocationPermission(setState, () => setState('prompt'));
  }, []);

  return state;
}
