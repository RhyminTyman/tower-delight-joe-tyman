"use client";

import { useEffect, useRef } from 'react';
import { loadGoogleMapsScript } from '@/utils/maps';

interface AddressAutocompleteInputProps {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onPlaceSelected?: (place: {
    address: string;
    lat: string;
    lng: string;
  }) => void;
}

export function AddressAutocompleteInput({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  disabled,
  onPlaceSelected,
}: AddressAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript();
        
        if (!isMounted || !inputRef.current) return;

        const google = window.google;
        if (!google?.maps?.places?.Autocomplete) {
          return;
        }

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location && onPlaceSelected) {
            onPlaceSelected({
              address: place.formatted_address || '',
              lat: place.geometry.location.lat().toFixed(4),
              lng: place.geometry.location.lng().toFixed(4),
            });
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.error('Failed to initialize autocomplete:', error);
      }
    };

    initAutocomplete();

    return () => {
      isMounted = false;
      try {
        const google = window.google;
        if (autocompleteRef.current && google?.maps?.event) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      } catch (error) {
        console.error('Failed to cleanup autocomplete:', error);
      }
    };
  }, [onPlaceSelected]);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-muted-foreground">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        placeholder={placeholder}
      />
    </div>
  );
}

