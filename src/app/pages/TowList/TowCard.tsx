import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TowItem } from "@/types/tow";

export const TowCard = ({ tow }: { tow: TowItem }) => (
  <a href={`/tow/${tow.id}`} className="block">
    <Card className="glass-card cursor-pointer overflow-hidden p-0 transition-all hover:border-accent/50 hover:shadow-brand">
      <div className="border-l-4 border-accent/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{tow.driverName}</h3>
          {tow.etaMinutes !== undefined && tow.etaMinutes > 0 && (
            <span className="text-xs font-medium text-accent">ETA {tow.etaMinutes} min</span>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{tow.vehicle}</p>

        <div className="mb-3 flex items-center gap-3">
          <Badge
            variant={tow.statusTone === "active" ? "accent" : tow.statusTone === "completed" ? "default" : "muted"}
            className="px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          >
            {tow.status}
          </Badge>
          <span className="text-sm font-semibold text-foreground">{tow.ticketId}</span>
        </div>

        <div className="space-y-3 rounded-none bg-slate-900/40 p-4">
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

