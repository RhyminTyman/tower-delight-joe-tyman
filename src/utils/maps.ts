/**
 * Shared utility functions for Google Maps integration
 */

import {
  GOOGLE_MAPS_API_KEY,
  MAP_IMAGE_SIZE,
  MAP_IMAGE_SCALE,
  MAP_MARKER_COLORS,
  MAP_PATH_COLOR,
  MAP_PATH_WEIGHT,
  DEFAULT_LOCATION,
  COORDINATE_OFFSET_RANGE,
} from '@/config/constants';
import type { Coordinates, LocationWithCoords } from '@/types/maps';

/**
 * Generate a Google Maps Static API URL with markers and path
 * @param pickup Pickup location with coordinates
 * @param destination Destination location with coordinates
 * @returns Static map URL or undefined if coordinates are missing
 */
export function generateMapUrl(
  pickup: Pick<LocationWithCoords, 'lat' | 'lng'>,
  destination: Pick<LocationWithCoords, 'lat' | 'lng'>
): string | undefined {
  if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
    return undefined;
  }

  const markers = [
    `color:${MAP_MARKER_COLORS.pickup}|label:A|${pickup.lat},${pickup.lng}`,
    `color:${MAP_MARKER_COLORS.destination}|label:B|${destination.lat},${destination.lng}`,
  ].join('&markers=');

  const path = `color:${MAP_PATH_COLOR}|weight:${MAP_PATH_WEIGHT}|${pickup.lat},${pickup.lng}|${destination.lat},${destination.lng}`;

  return `https://maps.googleapis.com/maps/api/staticmap?size=${MAP_IMAGE_SIZE}&scale=${MAP_IMAGE_SCALE}&maptype=roadmap&markers=${markers}&path=${path}&key=AIzaSyBa684TfLdTXSODlil08SYZNWvm5yCqApQ`;
}

/**
 * Generate random GPS coordinates around the default location
 * Useful for mock/test data
 * @returns Random coordinates within ~20 miles of default location
 */
export function generateRandomCoordinates(): Coordinates {
  const latOffset = (Math.random() - 0.5) * COORDINATE_OFFSET_RANGE;
  const lngOffset = (Math.random() - 0.5) * COORDINATE_OFFSET_RANGE;

  return {
    lat: Number((DEFAULT_LOCATION.lat + latOffset).toFixed(4)),
    lng: Number((DEFAULT_LOCATION.lng + lngOffset).toFixed(4)),
  };
}

/**
 * Load Google Maps JavaScript API script
 * @returns Promise that resolves when script is loaded
 */
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBa684TfLdTXSODlil08SYZNWvm5yCqApQ&libraries=places';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

