/**
 * Type definitions for Google Maps integration
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationWithCoords {
  title: string;
  address: string;
  distance?: string;
  lat: number;
  lng: number;
}

export interface DistanceResult {
  distance: string;
  duration: string;
}

// Google Maps API type declarations
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: { types?: string[] }
          ) => GoogleMapsAutocomplete;
        };
        DistanceMatrixService: new () => GoogleMapsDistanceMatrixService;
        LatLng: new (lat: number, lng: number) => GoogleMapsLatLng;
        TravelMode: {
          DRIVING: string;
        };
        UnitSystem: {
          IMPERIAL: number;
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
  }
}

export interface GoogleMapsAutocomplete {
  addListener(event: string, callback: () => void): void;
  getPlace(): {
    formatted_address?: string;
    geometry?: {
      location: {
        lat: () => number;
        lng: () => number;
      };
    };
  };
}

export interface GoogleMapsLatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleMapsDistanceMatrixService {
  getDistanceMatrix(
    request: {
      origins: GoogleMapsLatLng[];
      destinations: GoogleMapsLatLng[];
      travelMode: string;
      unitSystem: number;
    },
    callback: (response: any, status: string) => void
  ): void;
}

