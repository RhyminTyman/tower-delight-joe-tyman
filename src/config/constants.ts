/**
 * Application-wide constants and configuration
 */

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBa684TfLdTXSODlil08SYZNWvm5yCqApQ';
export const GOOGLE_MAPS_INIT_DELAY_MS = 500;

// Geolocation Configuration
export const GEOLOCATION_TIMEOUT_MS = 5000;
export const GEOLOCATION_HIGH_ACCURACY = false;

// Default Location (Columbus, OH)
export const DEFAULT_LOCATION = {
  lat: 39.9612,
  lng: -82.9988,
  name: 'Columbus, OH',
} as const;

// Coordinate Generation
export const COORDINATE_OFFSET_RANGE = 0.3; // ~20 miles in degrees

// Database IDs
export const DISPATCHER_ID = 'dispatcher-001';
export const DRIVER_ID_PREFIX = 'driver-';
export const TOW_ID_PREFIX = 'tow-';

// Map Configuration
export const MAP_IMAGE_SIZE = '600x400';
export const MAP_IMAGE_SCALE = 2;
export const MAP_MARKER_COLORS = {
  pickup: 'red',
  destination: 'green',
} as const;
export const MAP_PATH_COLOR = '0x0066ff';
export const MAP_PATH_WEIGHT = 3;

