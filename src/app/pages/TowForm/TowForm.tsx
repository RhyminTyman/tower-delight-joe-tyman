"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import type { DriverSnapshot } from "@/app/data/driver-dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadGoogleMapsScript } from "@/utils/maps";
import { GOOGLE_MAPS_INIT_DELAY_MS, GEOLOCATION_TIMEOUT_MS, GEOLOCATION_HIGH_ACCURACY } from "@/config/constants";
import type { DistanceResult } from "@/types/maps";

const STATUS_OPTIONS = ["Light", "Medium", "Heavy"] as const;

export type TowTypeOption = (typeof STATUS_OPTIONS)[number];

// Calculate distance using Google Maps JavaScript Distance Service
async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DistanceResult | null> {
  return new Promise((resolve) => {
    try {
      const google = window.google;
      if (!google?.maps?.DistanceMatrixService) {
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
            resolve({
              distance: element.distance.text,
              duration: element.duration.text,
            });
          } else {
            resolve(null);
          }
        }
      );
    } catch (error) {
      console.error('[Distance] Calculation error:', error);
      resolve(null);
    }
  });
}

// Get user's current location
async function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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

export type DriverOption = {
  id: string;
  name: string;
  snapshot: DriverSnapshot;
  callSign?: string;
};

type TowFormMode = "create" | "edit";

type TowFormValues = {
  towId: string;
  ticketId: string;
  vehicle: string;
  driverId: string;
  towType: TowTypeOption;
  etaMinutes: string;
  pickupTitle: string;
  pickupAddress: string;
  pickupDistance: string;
  pickupLat: string;
  pickupLng: string;
  destinationTitle: string;
  destinationAddress: string;
  destinationDistance: string;
  destinationLat: string;
  destinationLng: string;
  poNumber: string;
  dispatcher: string;
  hasKeys: string;
  driverCallsign: string;
  truck: string;
};

export interface TowFormProps {
  mode: TowFormMode;
  driverOptions?: DriverOption[];
  initialValues?: Partial<TowFormValues>;
  cancelHref: string;
  headerTitle: string;
  headerBadge?: string;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (formData: FormData, towId: string) => Promise<void>;
}

const defaultValues: TowFormValues = {
  towId: "",
  ticketId: "",
  vehicle: "",
  driverId: "",
  towType: "Light",
  etaMinutes: "",
  pickupTitle: "",
  pickupAddress: "",
  pickupDistance: "",
  pickupLat: "",
  pickupLng: "",
  destinationTitle: "",
  destinationAddress: "",
  destinationDistance: "",
  destinationLat: "",
  destinationLng: "",
  poNumber: "",
  dispatcher: "",
  hasKeys: "no",
  driverCallsign: "",
  truck: "",
};

export function TowForm({
  mode,
  driverOptions = [],
  initialValues,
  cancelHref,
  headerTitle,
  headerBadge,
  submitLabel,
  submittingLabel,
  onSubmit,
}: TowFormProps) {
  const initialTowIdRef = useRef(
    initialValues?.towId ?? (mode === "create" ? `tow-${Date.now()}` : "")
  );

  const [formValues, setFormValues] = useState<TowFormValues>(() => {
    const resolvedDriverId =
      initialValues?.driverId ??
      (driverOptions.length > 0 ? driverOptions[0].id : "");

    return {
      ...defaultValues,
      ...initialValues,
      towId: initialTowIdRef.current,
      driverId: resolvedDriverId,
      towType: (initialValues?.towType as TowTypeOption | undefined) ?? "Light",
      hasKeys: initialValues?.hasKeys ?? defaultValues.hasKeys,
    };
  });

  useEffect(() => {
    if (mode === "create" && driverOptions.length > 0 && !formValues.driverId) {
      setFormValues((previous) => ({
        ...previous,
        driverId: driverOptions[0].id,
      }));
    }
  }, [driverOptions, formValues.driverId, mode]);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMaps, setIsLoadingMaps] = useState(true);
  const [isCalculatingDistances, setIsCalculatingDistances] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  const requiresDriver = mode === "create" && driverOptions.length > 0;

  const canSubmit = useMemo(() => {
    return (
      formValues.ticketId.trim().length > 0 &&
      formValues.vehicle.trim().length > 0 &&
      formValues.pickupTitle.trim().length > 0 &&
      formValues.pickupAddress.trim().length > 0 &&
      formValues.destinationTitle.trim().length > 0 &&
      formValues.destinationAddress.trim().length > 0 &&
      (!requiresDriver || formValues.driverId.trim().length > 0)
    );
  }, [
    formValues.destinationAddress,
    formValues.destinationTitle,
    formValues.driverId,
    formValues.pickupAddress,
    formValues.pickupTitle,
    formValues.ticketId,
    formValues.vehicle,
    requiresDriver,
  ]);

  const handleChange =
    (field: keyof TowFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.value;
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Get user's location on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location);
      }
    };
    fetchUserLocation();
  }, []);

  // Calculate distances when pickup and destination coordinates are set
  useEffect(() => {
    const calculateDistances = async () => {
      const pickupLat = parseFloat(formValues.pickupLat);
      const pickupLng = parseFloat(formValues.pickupLng);
      const destLat = parseFloat(formValues.destinationLat);
      const destLng = parseFloat(formValues.destinationLng);

      // Need all coordinates and Google Maps to be loaded
      if (!pickupLat || !pickupLng || !destLat || !destLng || isLoadingMaps) {
        return;
      }

      // Wait a bit to ensure Google Maps API is fully initialized
      await new Promise(resolve => setTimeout(resolve, GOOGLE_MAPS_INIT_DELAY_MS));

      setIsCalculatingDistances(true);

      // Calculate distance from user to pickup
      if (userLocation) {
        const userToPickup = await calculateDistance(userLocation, { lat: pickupLat, lng: pickupLng });
        if (userToPickup) {
          setFormValues((prev) => ({
            ...prev,
            pickupDistance: `${userToPickup.distance} (${userToPickup.duration})`,
          }));
        }
      }

      // Calculate distance from pickup to destination
      const pickupToDest = await calculateDistance(
        { lat: pickupLat, lng: pickupLng },
        { lat: destLat, lng: destLng }
      );
      if (pickupToDest) {
        setFormValues((prev) => ({
          ...prev,
          destinationDistance: `${pickupToDest.distance} (${pickupToDest.duration})`,
        }));
      }

      setIsCalculatingDistances(false);
    };

    calculateDistances();
  }, [formValues.pickupLat, formValues.pickupLng, formValues.destinationLat, formValues.destinationLng, userLocation, isLoadingMaps]);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    let pickupAutocomplete: any;
    let destinationAutocomplete: any;

    const initAutocomplete = async () => {
      try {
        setIsLoadingMaps(true);
        await loadGoogleMapsScript();
        const google = (window as any).google;

        // Pickup autocomplete
        if (pickupInputRef.current) {
          pickupAutocomplete = new google.maps.places.Autocomplete(pickupInputRef.current, {
            types: ['address'],
          });

          pickupAutocomplete.addListener('place_changed', () => {
            const place = pickupAutocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setFormValues((prev) => ({
                ...prev,
                pickupAddress: place.formatted_address || prev.pickupAddress,
                pickupLat: lat.toFixed(4),
                pickupLng: lng.toFixed(4),
              }));
            }
          });
        }

        // Destination autocomplete
        if (destinationInputRef.current) {
          destinationAutocomplete = new google.maps.places.Autocomplete(destinationInputRef.current, {
            types: ['address'],
          });

          destinationAutocomplete.addListener('place_changed', () => {
            const place = destinationAutocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              setFormValues((prev) => ({
                ...prev,
                destinationAddress: place.formatted_address || prev.destinationAddress,
                destinationLat: lat.toFixed(4),
                destinationLng: lng.toFixed(4),
              }));
            }
          });
        }
        
        setIsLoadingMaps(false);
      } catch (error) {
        console.error('[Autocomplete] Failed to initialize:', error);
        setIsLoadingMaps(false);
      }
    };

    initAutocomplete();

    return () => {
      // Cleanup autocomplete listeners
      try {
        const google = window.google;
        if (pickupAutocomplete && google?.maps?.event) {
          google.maps.event.clearInstanceListeners(pickupAutocomplete);
        }
        if (destinationAutocomplete && google?.maps?.event) {
          google.maps.event.clearInstanceListeners(destinationAutocomplete);
        }
      } catch (error) {
        console.error("[Autocomplete] Failed to cleanup:", error);
      }
    };
  }, []);

  const towTypeFieldName = mode === "edit" ? "type" : "towType";

  const handleAction = async (formData: FormData) => {
    try {
      formData.set("towId", formValues.towId);
      formData.set(towTypeFieldName, formValues.towType);
      if (requiresDriver) {
        formData.set("driverId", formValues.driverId);
      }
      // Add lat/lng coordinates if available
      if (formValues.pickupLat) formData.set("pickupLat", formValues.pickupLat);
      if (formValues.pickupLng) formData.set("pickupLng", formValues.pickupLng);
      if (formValues.destinationLat) formData.set("destinationLat", formValues.destinationLat);
      if (formValues.destinationLng) formData.set("destinationLng", formValues.destinationLng);
      
      await onSubmit(formData, formValues.towId);
    } catch (error) {
      console.error("[TowForm] Submission failed:", error);
      alert(error instanceof Error ? error.message : "Failed to submit form. Please try again.");
    }
  };

  if (mode === "create" && driverOptions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <a
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <h1 className="text-lg font-semibold text-foreground">Add Tow</h1>
            <div className="w-9" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
          <Card className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No drivers available. Create or seed driver data before adding a new tow.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className={mode === "create" ? "flex min-h-screen flex-col bg-background" : "relative min-h-screen bg-background"}>
      {mode === "create" ? (
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <a
              href={cancelHref}
              className="flex h-9 w-9 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Cancel"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <h1 className="text-lg font-semibold text-foreground">{headerTitle}</h1>
            <div className="w-9" />
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <a href={cancelHref} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Cancel</span>
            </a>
            {headerBadge ? (
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {headerBadge}
              </span>
            ) : (
              <span />
            )}
          </div>
        </header>
      )}

      <main className={mode === "create" ? "mx-auto w-full max-w-md flex-1 px-4 py-6" : "mx-auto max-w-md px-4 py-6"}>
        <h1 className={`mb-6 text-xl font-semibold text-foreground ${mode === "create" ? "hidden" : ""}`}>
          {headerTitle}
        </h1>
        <form action={handleAction} className="flex flex-col gap-6">
          <input type="hidden" name="towId" value={formValues.towId} />

          <Card className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
              Tow Information
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="ticketId" className="mb-1.5 block text-xs text-muted-foreground">
                  Ticket ID
                </label>
                <input
                  id="ticketId"
                  name="ticketId"
                  value={formValues.ticketId}
                  onChange={handleChange("ticketId")}
                  required
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. TD-4921"
                />
              </div>

              <div>
                <label htmlFor="vehicle" className="mb-1.5 block text-xs text-muted-foreground">
                  Vehicle Description
                </label>
                <input
                  id="vehicle"
                  name="vehicle"
                  value={formValues.vehicle}
                  onChange={handleChange("vehicle")}
                  required
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. 2022 Ford F-150 · Blue · TX 9KP-3821"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {mode === "create" && driverOptions.length > 0 ? (
                  <div>
                    <label htmlFor="driverId" className="mb-1.5 block text-xs text-muted-foreground">
                      Driver
                    </label>
                    <select
                      id="driverId"
                      name="driverId"
                      value={formValues.driverId}
                      onChange={handleChange("driverId")}
                      required
                      className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {driverOptions.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className={mode === "create" && driverOptions.length > 0 ? "" : "col-span-2 sm:col-span-1"}>
                  <label htmlFor={towTypeFieldName} className="mb-1.5 block text-xs text-muted-foreground">
                    Tow Type
                  </label>
                  <select
                    id={towTypeFieldName}
                    name={towTypeFieldName}
                    value={formValues.towType}
                    onChange={(event) =>
                      setFormValues((previous) => ({
                        ...previous,
                        towType: event.target.value as TowTypeOption,
                      }))
                    }
                    className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="etaMinutes" className="mb-1.5 block text-xs text-muted-foreground">
                    ETA (minutes)
                  </label>
                  <input
                    id="etaMinutes"
                    name="etaMinutes"
                    type="number"
                    min={0}
                    value={formValues.etaMinutes}
                    onChange={handleChange("etaMinutes")}
                    className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="poNumber" className="mb-1.5 block text-xs text-muted-foreground">
                  PO Number
                </label>
                <input
                  id="poNumber"
                  name="poNumber"
                  value={formValues.poNumber}
                  onChange={handleChange("poNumber")}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
                />
              </div>
            </div>

              {mode === "edit" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="dispatcher" className="mb-1.5 block text-xs text-muted-foreground">
                      Dispatcher
                    </label>
                    <input
                      id="dispatcher"
                      name="dispatcher"
                      value={formValues.dispatcher}
                      onChange={handleChange("dispatcher")}
                      className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="e.g. Kyle Ed"
                    />
                  </div>
                  <div>
                    <label htmlFor="hasKeys" className="mb-1.5 block text-xs text-muted-foreground">
                      Has Keys
                    </label>
                    <select
                      id="hasKeys"
                      name="hasKeys"
                      value={formValues.hasKeys}
                      onChange={handleChange("hasKeys")}
                      className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="driverCallsign" className="mb-1.5 block text-xs text-muted-foreground">
                      Driver Callsign
                    </label>
                    <input
                      id="driverCallsign"
                      name="driverCallsign"
                      value={formValues.driverCallsign}
                      onChange={handleChange("driverCallsign")}
                      className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label htmlFor="truck" className="mb-1.5 block text-xs text-muted-foreground">
                      Truck
                    </label>
                    <input
                      id="truck"
                      name="truck"
                      value={formValues.truck}
                      onChange={handleChange("truck")}
                      className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">Pickup</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="pickupTitle" className="mb-1.5 block text-xs text-muted-foreground">
                  Location Name
                </label>
                <input
                  id="pickupTitle"
                  name="pickupTitle"
                  value={formValues.pickupTitle}
                  onChange={handleChange("pickupTitle")}
                  required
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Kyle's Motors"
                />
              </div>
              <div>
                <label htmlFor="pickupAddress" className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  Address {formValues.pickupLat && <span className="text-green-500">✓</span>}
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
                  ref={pickupInputRef}
                  type="text"
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formValues.pickupAddress}
                  onChange={handleChange("pickupAddress")}
                  required
                  disabled={isLoadingMaps}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-wait"
                  placeholder={isLoadingMaps ? "Loading Google Maps..." : "Start typing an address..."}
                  autoComplete="off"
                />
                {formValues.pickupLat && formValues.pickupLng && (
                  <p className="mt-1 text-xs text-green-500">
                    📍 GPS coordinates set
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="pickupDistance" className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  Distance / ETA (from your location)
                  {isCalculatingDistances && (
                    <span className="text-xs text-yellow-500">Calculating...</span>
                  )}
                </label>
                <input
                  id="pickupDistance"
                  name="pickupDistance"
                  value={formValues.pickupDistance}
                  onChange={handleChange("pickupDistance")}
                  readOnly={isCalculatingDistances}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={isCalculatingDistances ? "Calculating..." : "Auto-calculated"}
                />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">Destination</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="destinationTitle" className="mb-1.5 block text-xs text-muted-foreground">
                  Location Name
                </label>
                <input
                  id="destinationTitle"
                  name="destinationTitle"
                  value={formValues.destinationTitle}
                  onChange={handleChange("destinationTitle")}
                  required
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. City Impound Lot"
                />
              </div>
              <div>
                <label htmlFor="destinationAddress" className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  Address {formValues.destinationLat && <span className="text-green-500">✓</span>}
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
                  ref={destinationInputRef}
                  type="text"
                  id="destinationAddress"
                  name="destinationAddress"
                  value={formValues.destinationAddress}
                  onChange={handleChange("destinationAddress")}
                  required
                  disabled={isLoadingMaps}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-wait"
                  placeholder={isLoadingMaps ? "Loading Google Maps..." : "Start typing an address..."}
                  autoComplete="off"
                />
                {formValues.destinationLat && formValues.destinationLng && (
                  <p className="mt-1 text-xs text-green-500">
                    📍 GPS coordinates set
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="destinationDistance" className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  Distance / ETA (from pickup)
                  {isCalculatingDistances && (
                    <span className="text-xs text-yellow-500">Calculating...</span>
                  )}
                </label>
                <input
                  id="destinationDistance"
                  name="destinationDistance"
                  value={formValues.destinationDistance}
                  onChange={handleChange("destinationDistance")}
                  readOnly={isCalculatingDistances}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={isCalculatingDistances ? "Calculating..." : "Auto-calculated"}
                />
              </div>
            </div>
          </Card>

          {mode === "create" ? (
            <div className="flex gap-3">
              <a
                href={cancelHref}
                className="flex-1 rounded-none border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={!canSubmit || isSaving}
                className="flex-1 rounded-none bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? submittingLabel : submitLabel}
              </button>
            </div>
          ) : (
            <Button type="submit" size="lg" className="w-full" disabled={!canSubmit || isSaving}>
              {isSaving ? submittingLabel : submitLabel}
            </Button>
          )}
        </form>
      </main>
    </div>
  );
}


