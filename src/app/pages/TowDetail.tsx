import type { RequestInfo } from "rwsdk/worker";
import { DriverDashboard } from "@/app/components/DriverDashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const TowDetail = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const data = await loadTowDetail(towId);
  
  if (!data) {
    return <div>Tow not found</div>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <TowDetailHeader towId={towId} />
      <DriverDashboard {...data} towId={towId} />
    </div>
  );
};

const TowDetailHeader = ({ towId }: { towId: string }) => (
  <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
    <div className="mx-auto flex max-w-md items-center justify-between">
      <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">All Tows</span>
      </a>
      <EditAddressButton towId={towId} />
    </div>
  </header>
);

const EditAddressButton = ({ towId }: { towId: string }) => (
  <a href={`/tow/${towId}/edit`}>
    <Button variant="ghost" size="sm" className="text-xs">
      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit Addresses
    </Button>
  </a>
);

async function loadTowDetail(towId: string) {
  const { db } = await import("@/db");
  const { parseDashboardRow } = await import("@/app/data/driver-dashboard");
  
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

