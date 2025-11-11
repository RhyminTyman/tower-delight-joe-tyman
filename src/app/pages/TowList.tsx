import type { RequestInfo } from "rwsdk/worker";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TowItem {
  id: string;
  ticketId: string;
  status: string;
  statusTone: "waiting" | "active" | "completed";
  vehicle: string;
  pickup: {
    title: string;
    address: string;
  };
  destination: {
    title: string;
    address: string;
  };
  etaMinutes?: number;
}

export const TowList = async (requestInfo: RequestInfo) => {
  const tows = await loadTowList();
  return <TowListScreen tows={tows} />;
};

const TowListScreen = ({ tows }: { tows: TowItem[] }) => (
  <div className="relative min-h-screen bg-background">
    <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto max-w-md sm:max-w-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Tower Delight · Driver Ops
            </span>
            <h1 className="text-xl font-semibold text-foreground">Active Tows</h1>
          </div>
          <Badge variant="accent" className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
            {tows.length} Active
          </Badge>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-md px-4 py-6 sm:max-w-lg">
      <div className="flex flex-col gap-4">
        {tows.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No active tows</p>
          </Card>
        ) : (
          tows.map((tow) => <TowCard key={tow.id} tow={tow} />)
        )}
      </div>
    </main>
  </div>
);

const TowCard = ({ tow }: { tow: TowItem }) => (
  <a href={`/tow/${tow.id}`} className="block">
    <Card className="glass-card cursor-pointer overflow-hidden p-0 transition-all hover:border-accent/50 hover:shadow-brand">
      <div className="border-l-4 border-accent/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant={tow.statusTone === "active" ? "accent" : tow.statusTone === "completed" ? "default" : "muted"}
              className="px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            >
              {tow.status}
            </Badge>
            <span className="text-sm font-semibold text-foreground">{tow.ticketId}</span>
          </div>
          {tow.etaMinutes !== undefined && tow.etaMinutes > 0 && (
            <span className="text-xs font-medium text-accent">ETA {tow.etaMinutes} min</span>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{tow.vehicle}</p>

        <div className="space-y-3 rounded-xl bg-slate-900/40 p-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pickup</span>
            </div>
            <p className="text-sm font-medium text-foreground">{tow.pickup.title}</p>
            <p className="text-xs text-muted-foreground">{tow.pickup.address}</p>
          </div>

          <div className="flex items-center gap-2 px-2">
            <div className="h-px flex-1 bg-border/40" />
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Destination</span>
            </div>
            <p className="text-sm font-medium text-foreground">{tow.destination.title}</p>
            <p className="text-xs text-muted-foreground">{tow.destination.address}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            View details
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Card>
  </a>
);

async function loadTowList(): Promise<TowItem[]> {
  const { db } = await import("@/db");

  try {
    console.log("[TowList] Loading tows from database...");
    const rows = await db.selectFrom("driver_dashboard").select(["id", "payload"]).execute();
    console.log(`[TowList] Found ${rows.length} rows in database`);

    const tows = rows.map((row) => {
      const data = JSON.parse(row.payload);
      return {
        id: row.id,
        ticketId: data.dispatch.ticketId,
        status: data.route.status,
        statusTone: data.route.statusTone,
        vehicle: data.dispatch.vehicle,
        pickup: {
          title: data.route.pickup.title,
          address: data.route.pickup.address,
        },
        destination: {
          title: data.route.destination.title,
          address: data.route.destination.address,
        },
        etaMinutes: data.dispatch.etaMinutes,
      };
    });
    
    console.log(`[TowList] Returning ${tows.length} tows`);
    return tows;
  } catch (error) {
    console.error("[TowList] Failed to load tow list:", error);
    return [];
  }
}

