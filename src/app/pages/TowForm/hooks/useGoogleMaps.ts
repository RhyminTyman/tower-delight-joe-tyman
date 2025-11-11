/**
 * Hook for managing Google Maps integration
 */

import { useEffect, useState } from 'react';
import { loadGoogleMapsScript } from '@/utils/maps';
import { GOOGLE_MAPS_INIT_DELAY_MS } from '@/config/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useGoogleMaps');

export function useGoogleMaps() {
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);

  useEffect(() => {
    const initMaps = async () => {
      try {
        setIsLoadingMaps(true);
        await loadGoogleMapsScript();
        // Wait a bit to ensure API is fully initialized
        await new Promise(resolve => setTimeout(resolve, GOOGLE_MAPS_INIT_DELAY_MS));
        setIsLoadingMaps(false);
        logger.info('Google Maps loaded successfully');
      } catch (error) {
        logger.error('Failed to load Google Maps', error);
        setIsLoadingMaps(false);
      }
    };

    initMaps();
  }, []);

  return { isLoadingMaps };
}

