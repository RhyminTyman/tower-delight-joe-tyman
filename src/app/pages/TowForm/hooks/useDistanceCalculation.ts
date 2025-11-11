/**
 * Hook for calculating distances using Google Maps Distance Matrix API
 * Uses debouncing to avoid excessive API calls
 */

import { useEffect, useState } from 'react';
import type { Coordinates, DistanceResult } from '@/types/maps';
import { createLogger } from '@/utils/logger';
import { useDebounce } from '@/utils/performance';

const logger = createLogger('useDistanceCalculation');

async function calculateDistance(
  origin: Coordinates,
  destination: Coordinates
): Promise<DistanceResult | null> {
  return new Promise((resolve) => {
    try {
      const google = window.google;
      if (!google?.maps?.DistanceMatrixService) {
        logger.warn('Google Maps not loaded');
        resolve(null);
        return;
      }

      const service = new google.maps.DistanceMatrixService();
      const originLatLng = new google.maps.LatLng(origin.lat, origin.lng);
      const destLatLng = new google.maps.LatLng(destination.lat, destination.lng);

      service.getDistanceMatrix(
        {
          origins: [originLatLng],
          destinations: [destLatLng],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        },
        (response: any, status: string) => {
          if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
            const element = response.rows[0].elements[0];
            const result = {
              distance: element.distance.text,
              duration: element.duration.text,
            };
            logger.debug('Distance calculated', { origin, destination, result });
            resolve(result);
          } else {
            logger.warn('Distance calculation failed', { status });
            resolve(null);
          }
        }
      );
    } catch (error) {
      logger.error('Distance calculation error', error);
      resolve(null);
    }
  });
}

interface UseDistanceCalculationProps {
  pickupLat: string;
  pickupLng: string;
  destinationLat: string;
  destinationLng: string;
  userLocation: Coordinates | null;
  isLoadingMaps: boolean;
}

export function useDistanceCalculation({
  pickupLat,
  pickupLng,
  destinationLat,
  destinationLng,
  userLocation,
  isLoadingMaps,
}: UseDistanceCalculationProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupDistance, setPickupDistance] = useState('');
  const [destinationDistance, setDestinationDistance] = useState('');

  // Debounce coordinate changes to avoid excessive API calls (wait 500ms after last change)
  const debouncedPickupLat = useDebounce(pickupLat, 500);
  const debouncedPickupLng = useDebounce(pickupLng, 500);
  const debouncedDestLat = useDebounce(destinationLat, 500);
  const debouncedDestLng = useDebounce(destinationLng, 500);

  useEffect(() => {
    const calculate = async () => {
      const pLat = parseFloat(debouncedPickupLat);
      const pLng = parseFloat(debouncedPickupLng);
      const dLat = parseFloat(debouncedDestLat);
      const dLng = parseFloat(debouncedDestLng);

      // Need all coordinates and Google Maps to be loaded
      if (!pLat || !pLng || !dLat || !dLng || isLoadingMaps) {
        return;
      }

      setIsCalculating(true);
      logger.info('Starting distance calculations');

      // Calculate distance from user to pickup
      if (userLocation) {
        const userToPickup = await calculateDistance(
          userLocation,
          { lat: pLat, lng: pLng }
        );
        if (userToPickup) {
          setPickupDistance(`${userToPickup.distance} (${userToPickup.duration})`);
        }
      }

      // Calculate distance from pickup to destination
      const pickupToDest = await calculateDistance(
        { lat: pLat, lng: pLng },
        { lat: dLat, lng: dLng }
      );
      if (pickupToDest) {
        setDestinationDistance(`${pickupToDest.distance} (${pickupToDest.duration})`);
      }

      setIsCalculating(false);
    };

    calculate();
  }, [debouncedPickupLat, debouncedPickupLng, debouncedDestLat, debouncedDestLng, userLocation, isLoadingMaps]);

  return {
    isCalculating,
    pickupDistance,
    destinationDistance,
  };
}

