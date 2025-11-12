/**
 * Hook for optimistic UI updates
 * Updates UI immediately, then reverts if server call fails
 */

import { useState, useCallback } from 'react';

interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (value: T) => void;
  onError?: (error: Error, previousValue: T) => void;
}

export function useOptimisticUpdate<T>(
  initialValue: T,
  options?: UseOptimisticUpdateOptions<T>
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (
      newValue: T,
      serverUpdate: (value: T) => Promise<void>
    ) => {
      const previousValue = value;
      
      // Optimistically update UI immediately
      setValue(newValue);
      setIsUpdating(true);
      setError(null);

      try {
        // Perform server update
        await serverUpdate(newValue);
        
        // Call success callback
        options?.onSuccess?.(newValue);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        console.error('Server update failed, reverting:', error);
        
        // Revert to previous value on error
        setValue(previousValue);
        setError(error);
        
        // Call error callback
        options?.onError?.(error, previousValue);
      } finally {
        setIsUpdating(false);
      }
    },
    [value, options]
  );

  return {
    value,
    isUpdating,
    error,
    update,
  };
}
