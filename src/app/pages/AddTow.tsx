import type { RequestInfo } from "rwsdk/worker";

import { db } from "@/db";
import type { DriverSnapshot } from "@/app/data/driver-dashboard";
import { AddTowForm } from "./AddTow/AddTowForm";

type DriverOption = {
  id: string;
  name: string;
  snapshot: DriverSnapshot;
  callSign?: string;
};

export const AddTow = async (_requestInfo: RequestInfo) => {
  const driverOptions = await loadDriverOptions();
  return <AddTowForm driverOptions={driverOptions} />;
};

async function loadDriverOptions(): Promise<DriverOption[]> {
  try {
    // Only load records with IDs starting with "driver-" (actual driver records)
    const rows = await db
      .selectFrom("driver_dashboard")
      .select(["id", "payload"])
      .where("id", "like", "driver-%")
      .execute();
    
    const driverOptions: DriverOption[] = [];

    for (const row of rows) {
      if (!row.payload) continue;
      try {
        const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
        const driver = data?.driver as DriverSnapshot | undefined;
        if (!driver?.id) continue;

        driverOptions.push({
          id: driver.id,
          name: driver.name,
          snapshot: driver,
          callSign: data?.route?.driverCallsign,
        });
      } catch (error) {
        console.warn("[AddTow] Failed to parse driver payload:", error);
      }
    }

    return driverOptions;
  } catch (error) {
    console.error("[AddTow] Failed to load drivers:", error);
    return [];
  }
}

export default AddTow;


