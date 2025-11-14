/**
 * Location Section Component
 * Handles address input with Google Maps Autocomplete and distance display
 */

import { Card } from "@/components/ui/card";
import { useAutocomplete } from "@/hooks";

interface LocationSectionProps {
  title: string;
  values: {
    title: string;
    address: string;
    distance: string;
    lat: string;
    lng: string;
  };
  isLoadingMaps: boolean;
  isCalculatingDistance: boolean;
  distanceLabel: string;
  onChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPlaceSelected: (place: { address: string; lat: string; lng: string }) => void;
}

export function LocationSection({
  title,
  values,
  isLoadingMaps,
  isCalculatingDistance,
  distanceLabel,
  onChange,
  onPlaceSelected,
}: LocationSectionProps) {
  const { inputRef } = useAutocomplete({
    isLoadingMaps,
    onPlaceSelected,
  });

  const hasCoordinates = values.lat && values.lng;

  return (
    <Card className="glass-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
        {title}
      </h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor={`${title.toLowerCase()}Title`} className="mb-1.5 block text-xs text-muted-foreground">
            Location Name*
          </label>
          <input
            type="text"
            id={`${title.toLowerCase()}Title`}
            name={`${title.toLowerCase()}Title`}
            value={values.title}
            onChange={onChange(`${title.toLowerCase()}Title`)}
            required
            className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="e.g. Kyle's Motors"
          />
        </div>

        {/* Address with Autocomplete */}
        <div>
          <label htmlFor={`${title.toLowerCase()}Address`} className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            Address {hasCoordinates && <span className="text-green-500">✓</span>}
            {isLoadingMaps && (
              <span className="flex items-center gap-1 text-yellow-500">
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading Maps...
              </span>
            )}
          </label>
          <input
            ref={inputRef}
            type="text"
            id={`${title.toLowerCase()}Address`}
            name={`${title.toLowerCase()}Address`}
            value={values.address}
            onChange={onChange(`${title.toLowerCase()}Address`)}
            required
            disabled={isLoadingMaps}
            className="w-full border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-wait"
            placeholder={isLoadingMaps ? "Loading Google Maps..." : "Start typing an address..."}
            autoComplete="off"
          />
          {hasCoordinates && (
            <p className="mt-1 text-xs text-green-500">
              📍 GPS coordinates set
            </p>
          )}
        </div>

        {/* Distance / ETA */}
        <div>
          <label htmlFor={`${title.toLowerCase()}Distance`} className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            {distanceLabel}
            {isCalculatingDistance && (
              <span className="text-xs text-yellow-500">Calculating...</span>
            )}
          </label>
          <input
            id={`${title.toLowerCase()}Distance`}
            name={`${title.toLowerCase()}Distance`}
            value={values.distance}
            onChange={onChange(`${title.toLowerCase()}Distance`)}
            readOnly={isCalculatingDistance}
            className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder={isCalculatingDistance ? "Calculating..." : "Auto-calculated"}
          />
        </div>

        {/* Hidden coordinate fields */}
        <input type="hidden" name={`${title.toLowerCase()}Lat`} value={values.lat} />
        <input type="hidden" name={`${title.toLowerCase()}Lng`} value={values.lng} />
      </div>
    </Card>
  );
}

