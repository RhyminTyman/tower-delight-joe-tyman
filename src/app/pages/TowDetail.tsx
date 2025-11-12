import type { RequestInfo } from "rwsdk/worker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { parseDashboardRow } from "@/app/data/driver-dashboard";
import { TowActions } from "./TowDetail/TowActions";
import { StatusBanner } from "./TowDetail/StatusBanner";
import { PhotoPreview } from "./TowDetail/PhotoPreview";

export const TowDetail = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const data = await loadTowDetail(towId);

  if (!data) {
    return <div>Tow not found</div>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <a
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            title="Back to all tows"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-foreground">TOW #{towId.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`/tow/${towId}/edit`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Edit tow"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </a>

            <TowActions towId={towId} currentStatus={data.route.status} />

            <a
              href={`/tow/${towId}/note`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Add note"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <StatusBanner towId={towId} currentStatus={data.route.status} />
      
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-28 pt-4 sm:max-w-lg">
        {/* Vehicle Info Card */}
        <div className="border border-border/60 bg-secondary/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Vehicle</p>
          <p className="text-base font-semibold text-foreground">{data.dispatch.vehicle}</p>
        </div>

        {/* Route Map Card - Shows GPS map, pickup/destination details, and vehicle photo */}
        <div className="border border-border/60 bg-secondary/40">
          <details className="group" open>
            <summary className="cursor-pointer border-b border-border/60 px-4 py-2 bg-card/50 list-none">
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Route Map</h2>
              </div>
            </summary>
            
            {/* Map Image */}
            {(data.route.mapUrl || data.route.mapImage) && (
              <div className="overflow-hidden bg-slate-900">
                <img
                  src={data.route.mapUrl || data.route.mapImage}
                  alt="Route map showing pickup and destination"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Pickup and Destination Details */}
            <div className="border-t border-border/60 p-4 text-foreground">
              <div className="bg-card/50 p-3">
                {/* Pickup Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Pickup</p>
                      <a
                        href={`/tow/${towId}/address/pickup`}
                        className="rounded p-1 transition-colors hover:bg-muted"
                        title="Edit pickup"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{data.route.pickup.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.route.pickup.address}
                    </p>
                    {data.route.pickup.distance && (
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {data.route.pickup.distance}
                      </p>
                    )}
                    {data.route.pickup.lat && data.route.pickup.lng && (
                      <div className="mt-2">
                        <a
                          href={`https://maps.google.com/?q=${data.route.pickup.lat},${data.route.pickup.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20 active:bg-blue-500/30"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Navigate to Pickup
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-3 h-px bg-border" />

                {/* Destination Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Destination</p>
                      <a
                        href={`/tow/${towId}/address/destination`}
                        className="rounded p-1 transition-colors hover:bg-muted"
                        title="Edit destination"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{data.route.destination.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.route.destination.address}
                    </p>
                    {data.route.destination.distance && (
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {data.route.destination.distance}
                      </p>
                    )}
                    {data.route.destination.lat && data.route.destination.lng && (
                      <div className="mt-2">
                        <a
                          href={`https://maps.google.com/?q=${data.route.destination.lat},${data.route.destination.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Navigate to Destination
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Open in Maps Button */}
              {data.route.pickup.lat && data.route.pickup.lng && data.route.destination.lat && data.route.destination.lng && (
                <div className="mt-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${data.route.pickup.lat},${data.route.pickup.lng}&destination=${data.route.destination.lat},${data.route.destination.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90 active:bg-accent/80"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Open Route in Maps
                  </a>
                </div>
              )}
            </div>

            {/* Vehicle Photo - at the bottom of the collapsible section */}
            {data.route.lastPhoto && hasPhoto(data.route.lastPhoto.dataUrl) && (
              <div className="border-t border-border/60">
                <div className="px-4 py-2 bg-card/50">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">Vehicle Photo</h3>
                </div>
                <div className="overflow-hidden">
                  <PhotoPreview towId={towId} imageUrl={data.route.lastPhoto.dataUrl} />
                </div>
              </div>
            )}
          </details>
        </div>

        {/* Route Detail Card */}
        <div className="border border-border/60 bg-secondary/40 flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">PO #</p>
              <p className="text-base font-semibold text-foreground">{data.route.poNumber}</p>
            </div>
            <Button asChild variant="secondary" className="px-5 py-2 text-sm rounded-none">
              <a href={data.driver.contactNumber ? `tel:${data.driver.contactNumber}` : "#"}>Call Dispatch</a>
            </Button>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm text-foreground">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dispatcher</dt>
              <dd className="font-medium">{data.route.dispatcher}</dd>
            </div>
            <div className="space-y-1 text-right">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Has Keys</dt>
              <dd className="font-medium">{data.route.hasKeys ? "Yes" : "No"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Type</dt>
              <dd className="font-medium">{data.route.type}</dd>
            </div>
            <div className="space-y-1 text-right">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Driver</dt>
              <dd className="font-medium">{data.route.driverCallsign}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Truck</dt>
              <dd className="font-medium">{data.route.truck}</dd>
            </div>
          </dl>
        </div>

        {/* Status Timeline */}
        <div className="border border-border/60 bg-secondary/40 p-4">
          <h2 className="text-sm font-semibold text-foreground">Statuses</h2>
          <div className="mt-4 flex flex-col gap-4">
            {data.route.statuses.map((status, index) => {
              const indicatorClasses = 
                status.status === "completed" ? "bg-emerald-500 border-emerald-400" :
                status.status === "active" ? "bg-amber-400 border-amber-300 animate-pulse" :
                "bg-muted border-border";
              
              return (
                <div className="flex items-start gap-3" key={status.label}>
                  <div className="flex flex-col items-center">
                    <span className={`h-3.5 w-3.5 rounded-full border ${indicatorClasses}`} />
                    {index < data.route.statuses.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{status.label}</p>
                    <p className="text-xs text-muted-foreground">{status.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
};

async function loadTowDetail(towId: string) {
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      return parseDashboardRow(row);
    }
  } catch (error) {
    console.error("Failed to load tow detail:", error);
  }

  return null;
}

function hasPhoto(image?: string | null): boolean {
  if (!image) {
    return false;
  }
  const trimmed = image.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return trimmed.startsWith("data:") || trimmed.startsWith("http");
}

