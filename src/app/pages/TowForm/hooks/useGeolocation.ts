/**
 * Hook for managing user geolocation
 */

import { useEffect, useState } from 'react';
import { GEOLOCATION_TIMEOUT_MS, GEOLOCATION_HIGH_ACCURACY } from '@/config/constants';
import type { Coordinates } from '@/types/maps';

async function getUserLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        resolve(coords);
      },
      (error) => {
        resolve(null);
      },
      { 
        timeout: GEOLOCATION_TIMEOUT_MS, 
        enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY 
      }
    );
  });
}

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      const location = await getUserLocation();
      setUserLocation(location);
      setIsLoadingLocation(false);
    };
    
    fetchLocation();
  }, []);

  return { userLocation, isLoadingLocation };
}

