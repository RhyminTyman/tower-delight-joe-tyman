import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TowCard } from "./TowCard";
import type { TowItem } from "@/types/tow";

export const TowListScreen = ({ tows }: { tows: TowItem[] }) => (
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

    <main className="mx-auto max-w-md px-4 py-6 pb-24 sm:max-w-lg">
      <div className="flex flex-col gap-4">
        {tows.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="mb-4 text-muted-foreground">No active tows</p>
            <a
              href="/tow/new"
              className="inline-flex items-center gap-2 rounded-none bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Tow
            </a>
          </Card>
        ) : (
          tows.map((tow) => <TowCard key={tow.id} tow={tow} />)
        )}
      </div>
    </main>

    {/* Floating Action Button */}
    <a
      href="/tow/new"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg transition-all hover:scale-105 hover:bg-accent/90 hover:shadow-xl sm:h-16 sm:w-16"
      title="Add New Tow"
      aria-label="Add New Tow"
    >
      <svg 
        className="h-6 w-6 text-accent-foreground sm:h-7 sm:w-7" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </a>
  </div>
);

