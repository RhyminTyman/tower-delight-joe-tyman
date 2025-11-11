import type { RequestInfo } from "rwsdk/worker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { parseDashboardRow } from "@/app/data/driver-dashboard";
import { capturePhoto, addNote } from "./TowDetail/functions";

const MAP_PLACEHOLDER =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop";

async function updateStatus(formData: FormData) {
  "use server";

  const towId = formData.get("towId") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Advance the workflow to next status
      const currentActiveIndex = data.route.statuses.findIndex((s: any) => s.status === "active");
      if (currentActiveIndex >= 0 && currentActiveIndex < data.route.statuses.length - 1) {
        // Mark current as completed
        data.route.statuses[currentActiveIndex].status = "completed";
        data.route.statuses[currentActiveIndex].time = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        // Mark next as active
        data.route.statuses[currentActiveIndex + 1].status = "active";
        data.route.statuses[currentActiveIndex + 1].time = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        // Update route status label
        data.route.status = data.route.statuses[currentActiveIndex + 1].label;
      }

      // Save back to database
      await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
    }
  } catch (error) {
    console.error("Failed to update status:", error);
  }
}

async function startCapture(formData: FormData) {
  "use server";

  const towId = formData.get("towId") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Mark VIN scan checklist item as complete
      const vinScanItem = data.checklist?.find((item: any) => item.id === "vin-scan");
      if (vinScanItem) {
        vinScanItem.complete = true;
      }

      // Mark photo proof checklist item as complete
      const photoProofItem = data.checklist?.find((item: any) => item.id === "photo-proof");
      if (photoProofItem) {
        photoProofItem.complete = true;
      }

      // Update next action
      data.nextAction = {
        label: "Review captured evidence",
        detail: "VIN and photos captured. Ready for impound intake.",
      };

      // Save back to database
      await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
    }
  } catch (error) {
    console.error("Failed to start capture:", error);
  }
}

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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </a>

            <form action={capturePhoto}>
              <input type="hidden" name="towId" value={towId} />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                title="Take photo"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </form>

            <form action={addNote}>
              <input type="hidden" name="towId" value={towId} />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                title="Add note"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>
      
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 pb-28 pt-6 sm:max-w-lg">
        {/* Driver Header */}
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Tower Delight · Driver Ops
            </span>
            <h1 className="text-2xl font-semibold text-foreground">{data.driver.name}</h1>
            <p className="text-sm text-muted-foreground">
              {data.driver.role} · {data.driver.truck}
            </p>
          </div>
          <Badge variant="accent" className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
            {data.driver.status}
          </Badge>
        </header>

        {/* Route Map Card */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-secondary/40 shadow-card">
          <div className="relative h-56">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${data.route.mapImage || MAP_PLACEHOLDER})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/70" />
            <div className="relative flex h-full flex-col justify-between p-5 text-white">
              <div className="flex items-center justify-between">
                <Badge
                  variant={data.route.statusTone === "active" ? "accent" : "muted"}
                  className="bg-white/10 px-4 py-2 text-xs uppercase tracking-wide"
                >
                  {data.route.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl bg-black/45 p-4 backdrop-blur">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-wide text-white/70">Pickup</p>
                      <a
                        href={`/tow/${towId}/address/pickup`}
                        className="rounded p-1 hover:bg-white/20 transition-colors"
                        title="Edit pickup"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{data.route.pickup.title}</p>
                    <p className="text-xs text-white/70">{data.route.pickup.address}</p>
                    {data.route.pickup.distance && (
                      <p className="mt-1 text-xs text-white/60">{data.route.pickup.distance}</p>
                    )}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-xs uppercase tracking-wide text-white/70">Destination</p>
                      <a
                        href={`/tow/${towId}/address/destination`}
                        className="rounded p-1 hover:bg-white/20 transition-colors"
                        title="Edit destination"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{data.route.destination.title}</p>
                    <p className="text-xs text-white/70">{data.route.destination.address}</p>
                    {data.route.destination.distance && (
                      <p className="mt-1 text-xs text-white/60">{data.route.destination.distance}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Route Detail Card */}
        <Card className="glass-card flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">PO #</p>
              <p className="text-base font-semibold text-foreground">{data.route.poNumber}</p>
            </div>
            <Button asChild variant="secondary" className="rounded-full px-5 py-2 text-sm">
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
        </Card>

        {/* Status Timeline */}
        <Card className="glass-card p-4">
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
        </Card>

        {/* Footer Notes */}
        <footer className="pb-4 pt-2 text-center text-xs text-muted-foreground">
          Designed around the field route view: live map context, dispatcher details, and status
          history keep the operator aligned with Tower Delight policy in a single glance.
        </footer>
      </main>

      {/* Bottom Action CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 px-4 pb-6 pt-4 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 sm:max-w-lg">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Next best action</p>
            <p className="text-sm font-semibold text-foreground">{data.nextAction.label}</p>
            <p className="text-xs text-muted-foreground">{data.nextAction.detail}</p>
          </div>
        </div>
      </div>
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

