export type LatLngTuple = [number, number, number?];

// Codes for coordinate reference systems
export const WGS_84 = '4326';
export const BC_ALBERS = '3005';

/**
 * Converts geographic coordinates from degrees, minutes, and seconds (DMS) format to decimal degrees.
 *
 * @param degrees - The degrees part of the coordinate, can be null or undefined.
 * @param minutes - The minutes part of the coordinate, can be null or undefined.
 * @param seconds - The seconds part of the coordinate, can be null or undefined.
 * @param direction - The cardinal direction ('N', 'S', 'E', 'W') or null.
 * @returns The decimal degree representation or null if degrees are not provided.
 */
export function dmsToDecimal(
  degrees?: number | null,
  minutes?: number | null,
  seconds?: number | null,
  direction?: 'N' | 'S' | 'E' | 'W' | null,
): number | null {
  // If degrees are missing, we can't proceed
  if (degrees == null) return null;

  // Treat missing minutes/seconds as 0
  const safeMinutes = minutes ?? 0;
  const safeSeconds = seconds ?? 0;

  // Calculate the decimal degree value
  let decimal = degrees + safeMinutes / 60 + safeSeconds / 3600;

  // Adjust for southern and western hemispheres
  if (direction === 'S' || direction === 'W') {
    decimal *= -1;
  }

  return decimal;
}
