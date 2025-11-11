"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import type { DriverSnapshot } from "@/app/data/driver-dashboard";
import { createTow } from "./functions";

type DriverOption = {
  id: string;
  name: string;
  snapshot: DriverSnapshot;
  callSign?: string;
};

interface AddTowFormProps {
  driverOptions: DriverOption[];
}

const STATUS_OPTIONS = ["Light", "Medium", "Heavy"] as const;

export function AddTowForm({ driverOptions }: AddTowFormProps) {
  const [ticketId, setTicketId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [pickupTitle, setPickupTitle] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupDistance, setPickupDistance] = useState("");
  const [destinationTitle, setDestinationTitle] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationDistance, setDestinationDistance] = useState("");
  const [driverId, setDriverId] = useState(driverOptions[0]?.id ?? "");
  const [towType, setTowType] = useState<(typeof STATUS_OPTIONS)[number]>("Light");
  const [etaMinutes, setEtaMinutes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const towId = useMemo(() => `tow-${Date.now()}`, []);

  const canSubmit =
    ticketId.trim().length > 0 &&
    vehicle.trim().length > 0 &&
    pickupTitle.trim().length > 0 &&
    pickupAddress.trim().length > 0 &&
    destinationTitle.trim().length > 0 &&
    destinationAddress.trim().length > 0 &&
    driverId.trim().length > 0;

  const handleSubmit = async (formData: FormData) => {
    if (!canSubmit || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      formData.set("towId", towId);
      await createTow(formData);
      window.location.href = `/tow/${towId}`;
    } catch (error) {
      console.error("[AddTowForm] Failed to create tow:", error);
      setIsSaving(false);
    }
  };

  if (driverOptions.length === 0) {
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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <a
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cancel"
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
        <form action={handleSubmit} className="flex flex-col gap-6">
          <input type="hidden" name="towId" value={towId} />

          <Card className="glass-card p-5">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="ticketId" className="mb-1.5 block text-xs text-muted-foreground">
                  Ticket ID
                </label>
                <input
                  id="ticketId"
                  name="ticketId"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
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
                  value={vehicle}
                  onChange={(event) => setVehicle(event.target.value)}
                  required
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. 2022 Ford F-150 · Blue · TX 9KP-3821"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="driverId" className="mb-1.5 block text-xs text-muted-foreground">
                    Driver
                  </label>
                  <select
                    id="driverId"
                    name="driverId"
                    value={driverId}
                    onChange={(event) => setDriverId(event.target.value)}
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
                <div>
                  <label htmlFor="towType" className="mb-1.5 block text-xs text-muted-foreground">
                    Tow Type
                  </label>
                  <select
                    id="towType"
                    name="towType"
                    value={towType}
                    onChange={(event) => setTowType(event.target.value as typeof towType)}
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

              <div>
                <label htmlFor="etaMinutes" className="mb-1.5 block text-xs text-muted-foreground">
                  ETA (minutes)
                </label>
                <input
                  id="etaMinutes"
                  name="etaMinutes"
                  type="number"
                  min={0}
                  value={etaMinutes}
                  onChange={(event) => setEtaMinutes(event.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
                />
              </div>
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
                  value={pickupTitle}
                  onChange={(event) => setPickupTitle(event.target.value)}
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
                  value={pickupAddress}
                  onChange={(event) => setPickupAddress(event.target.value)}
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
                  value={pickupDistance}
                  onChange={(event) => setPickupDistance(event.target.value)}
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
                  value={destinationTitle}
                  onChange={(event) => setDestinationTitle(event.target.value)}
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
                  value={destinationAddress}
                  onChange={(event) => setDestinationAddress(event.target.value)}
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
                  value={destinationDistance}
                  onChange={(event) => setDestinationDistance(event.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Optional"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <a
              href="/"
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Creating..." : "Create Tow"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}


