import type { RequestInfo } from "rwsdk/worker";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TowItem {
  id: string;
  ticketId: string;
  status: string;
  statusTone: "waiting" | "active" | "completed";
  vehicle: string;
  pickup: string;
  destination: string;
  etaMinutes?: number;
}

export const TowList = async (requestInfo: RequestInfo) => {
  const tows = await loadTowList();
  return <TowListScreen tows={tows} />;
};

const TowListScreen = ({ tows }: { tows: TowItem[] }) => (
  <div className="relative min-h-screen bg-background">
    <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Tower Delight · Driver Ops
            </span>
            <h1 className="text-xl font-semibold text-foreground">Active Tows</h1>
          </div>
          <Badge variant="accent" className="px-3 py-1 text-xs font-semibold">
            {tows.length} Active
          </Badge>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-4">
        {tows.map((tow) => (
          <TowCard key={tow.id} tow={tow} />
        ))}
      </div>
    </main>
  </div>
);

const TowCard = ({ tow }: { tow: TowItem }) => (
  <a href={`/tow/${tow.id}`}>
    <Card className="glass-card cursor-pointer p-5 transition-all hover:border-accent/50 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Badge
              variant={tow.statusTone === "active" ? "accent" : tow.statusTone === "completed" ? "default" : "muted"}
              className="text-xs uppercase tracking-wide"
            >
              {tow.status}
            </Badge>
            <span className="text-sm font-semibold text-foreground">{tow.ticketId}</span>
            {tow.etaMinutes && (
              <span className="text-xs text-muted-foreground">ETA {tow.etaMinutes} min</span>
            )}
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{tow.vehicle}</p>

          <div className="mt-3 grid gap-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">Pickup:</span>
              <span className="flex-1 text-foreground">{tow.pickup}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">Drop-off:</span>
              <span className="flex-1 text-foreground">{tow.destination}</span>
            </div>
          </div>
        </div>

        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  </a>
);

async function loadTowList(): Promise<TowItem[]> {
  const { db } = await import("@/db");
  
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", "primary")
      .executeTakeFirst();

    if (row) {
      const data = JSON.parse(row.payload);
      
      // For now, return the current tow as a single-item list
      // In production, you'd query a tows table
      return [
        {
          id: "primary",
          ticketId: data.dispatch.ticketId,
          status: data.route.status,
          statusTone: data.route.statusTone,
          vehicle: data.dispatch.vehicle,
          pickup: data.route.pickup.address,
          destination: data.route.destination.address,
          etaMinutes: data.dispatch.etaMinutes,
        },
      ];
    }
  } catch (error) {
    console.error("Failed to load tow list:", error);
  }

  return [];
}

