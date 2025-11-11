/**
 * Hook for optimistic UI updates
 * Updates UI immediately, then reverts if the server request fails
 */

import { useState, useCallback } from 'react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useOptimisticUpdate');

interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (value: T) => void;
  onError?: (error: Error, previousValue: T) => void;
}

export function useOptimisticUpdate<T>(
  initialValue: T,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (
      newValue: T,
      asyncOperation: (value: T) => Promise<void>
    ): Promise<boolean> => {
      const previousValue = value;
      
      // Optimistically update UI
      setValue(newValue);
      setIsUpdating(true);
      setError(null);
      
      logger.debug('Optimistic update started', { from: previousValue, to: newValue });

      try {
        // Perform the actual async operation
        await asyncOperation(newValue);
        
        setIsUpdating(false);
        options.onSuccess?.(newValue);
        logger.info('Optimistic update succeeded', { value: newValue });
        return true;
      } catch (err) {
        // Revert to previous value on error
        const error = err instanceof Error ? err : new Error(String(err));
        setValue(previousValue);
        setError(error);
        setIsUpdating(false);
        
        options.onError?.(error, previousValue);
        logger.error('Optimistic update failed, reverted', error, { 
          attempted: newValue,
          reverted: previousValue 
        });
        return false;
      }
    },
    [value, options]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsUpdating(false);
  }, [initialValue]);

  return {
    value,
    isUpdating,
    error,
    update,
    reset,
  };
}

