"use client";

import { useState } from "react";
import { Card, AddressAutocompleteInput } from "@/components";
import { updateAddress } from "@/actions";

interface EditAddressFormProps {
  towId: string;
  addressType: "pickup" | "destination";
  ticketId: string;
  title: string;
  address: string;
  distance: string;
}

export function EditAddressForm({ towId, addressType, ticketId, title, address, distance }: EditAddressFormProps) {
  const [selectedAddress, setSelectedAddress] = useState(address);
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    // Add coordinates if available
    if (coordinates) {
      formData.set('lat', coordinates.lat);
      formData.set('lng', coordinates.lng);
    }
    await updateAddress(formData);
    window.location.href = `/tow/${towId}`;
  }

  function handlePlaceSelected(place: { address: string; lat: string; lng: string }) {
    setSelectedAddress(place.address);
    setCoordinates({ lat: place.lat, lng: place.lng });
  }

  return (
    <>
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <a href={`/tow/${towId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Cancel</span>
          </a>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {ticketId}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Edit {addressType === "pickup" ? "Pickup" : "Destination"}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Update the {addressType} location details
        </p>

        <form action={handleSubmit} className="flex flex-col gap-6">
          <input type="hidden" name="towId" value={towId} />
          <input type="hidden" name="addressType" value={addressType} />

          <Card className="glass-card p-5">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-xs text-muted-foreground">
                  Location Name
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={title}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Kyle's Motors"
                />
              </div>

              <AddressAutocompleteInput
                id="address"
                name="address"
                label="Street Address (Start typing to autocomplete)"
                defaultValue={selectedAddress}
                placeholder="e.g. 830 South 17th Street, Columbus OH 43206"
                onPlaceSelected={handlePlaceSelected}
              />

              <div>
                <label htmlFor="distance" className="mb-1.5 block text-xs text-muted-foreground">
                  Distance
                </label>
                <input
                  type="text"
                  id="distance"
                  name="distance"
                  defaultValue={distance}
                  className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. 12 mi (26 m)"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <a
              href={`/tow/${towId}`}
              className="flex-1 rounded-none border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </a>
                <button
                  type="submit"
                  className="flex-1 rounded-none bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Save Changes
                </button>
          </div>
        </form>
      </main>
    </>
  );
}

