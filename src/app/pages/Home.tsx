import type { RequestInfo } from "rwsdk/worker";

import { loadDriverDashboard } from "@/app/data/driver-dashboard";
import { DriverDashboard } from "@/components";

export const Home = async (requestInfo: RequestInfo) => {
  const data = await loadDriverDashboard(requestInfo);
  
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Dashboard Data</h1>
          <p className="text-muted-foreground mb-6">
            Please seed the database first to view the dashboard.
          </p>
          <a
            href="/api/seed"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-none hover:bg-primary/90"
          >
            Seed Database
          </a>
        </div>
      </div>
    );
  }
  
  return <DriverDashboard {...data} />;
};
