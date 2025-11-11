"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import type { DriverSnapshot } from "@/app/data/driver-dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const STATUS_OPTIONS = ["Light", "Medium", "Heavy"] as const;

export type TowTypeOption = (typeof STATUS_OPTIONS)[number];

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
  destinationTitle: string;
  destinationAddress: string;
  destinationDistance: string;
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
  destinationTitle: "",
  destinationAddress: "",
  destinationDistance: "",
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

  const towTypeFieldName = mode === "edit" ? "type" : "towType";

  const handleAction = async (formData: FormData) => {
    if (!canSubmit || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      formData.set("towId", formValues.towId);
      formData.set(towTypeFieldName, formValues.towType);
      if (requiresDriver) {
        formData.set("driverId", formValues.driverId);
      }
      await onSubmit(formData, formValues.towId);
    } catch (error) {
      console.error("[TowForm] Submission failed:", error);
      setIsSaving(false);
    }
  };

  if (mode === "create" && driverOptions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <a
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                      className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                    className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                    className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Optional"
                  />
                </div>

                {mode === "edit" ? (
                  <div>
                    <label htmlFor="poNumber" className="mb-1.5 block text-xs text-muted-foreground">
                      PO Number
                    </label>
                    <input
                      id="poNumber"
                      name="poNumber"
                      value={formValues.poNumber}
                      onChange={handleChange("poNumber")}
                      className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="e.g. 123"
                    />
                  </div>
                ) : null}
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
                      className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                      className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                      className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                      className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Kyle's Motors"
                />
              </div>
              <div>
                <label htmlFor="pickupAddress" className="mb-1.5 block text-xs text-muted-foreground">
                  Address
                </label>
                <textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formValues.pickupAddress}
                  onChange={handleChange("pickupAddress")}
                  required
                  rows={2}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Street, City, State"
                />
              </div>
              <div>
                <label htmlFor="pickupDistance" className="mb-1.5 block text-xs text-muted-foreground">
                  Distance / ETA
                </label>
                <input
                  id="pickupDistance"
                  name="pickupDistance"
                  value={formValues.pickupDistance}
                  onChange={handleChange("pickupDistance")}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
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
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. City Impound Lot"
                />
              </div>
              <div>
                <label htmlFor="destinationAddress" className="mb-1.5 block text-xs text-muted-foreground">
                  Address
                </label>
                <textarea
                  id="destinationAddress"
                  name="destinationAddress"
                  value={formValues.destinationAddress}
                  onChange={handleChange("destinationAddress")}
                  required
                  rows={2}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Street, City, State"
                />
              </div>
              <div>
                <label htmlFor="destinationDistance" className="mb-1.5 block text-xs text-muted-foreground">
                  Distance / ETA
                </label>
                <input
                  id="destinationDistance"
                  name="destinationDistance"
                  value={formValues.destinationDistance}
                  onChange={handleChange("destinationDistance")}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
                />
              </div>
            </div>
          </Card>

          {mode === "create" ? (
            <div className="flex gap-3">
              <a
                href={cancelHref}
                className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </a>
              <button
                type="submit"
                disabled={!canSubmit || isSaving}
                className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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


