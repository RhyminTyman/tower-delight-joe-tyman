/**
 * Hook for managing Google Maps Autocomplete
 */

import { useEffect, useRef } from 'react';
import type { GoogleMapsAutocomplete } from '@/types/maps';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useAutocomplete');

interface UseAutocompleteProps {
  isLoadingMaps: boolean;
  onPlaceSelected: (place: {
    address: string;
    lat: string;
    lng: string;
  }) => void;
}

export function useAutocomplete({ isLoadingMaps, onPlaceSelected }: UseAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GoogleMapsAutocomplete | null>(null);

  useEffect(() => {
    if (isLoadingMaps || !inputRef.current) {
      return;
    }

    const initAutocomplete = async () => {
      try {
        const google = window.google;
        if (!google?.maps?.places?.Autocomplete) {
          logger.warn('Google Maps Places not available');
          return;
        }

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
          types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            onPlaceSelected({
              address: place.formatted_address || '',
              lat: place.geometry.location.lat().toFixed(4),
              lng: place.geometry.location.lng().toFixed(4),
            });
            logger.debug('Place selected', { address: place.formatted_address });
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        logger.error('Failed to initialize autocomplete', error);
      }
    };

    initAutocomplete();

    return () => {
      try {
        const google = window.google;
        if (autocompleteRef.current && google?.maps?.event) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      } catch (error) {
        logger.error('Failed to cleanup autocomplete', error);
      }
    };
  }, [isLoadingMaps, onPlaceSelected]);

  return { inputRef };
}

