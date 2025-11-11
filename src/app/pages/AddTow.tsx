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
    const rows = await db.selectFrom("driver_dashboard").select(["payload"]).execute();
    const map = new Map<string, DriverOption>();

    for (const row of rows) {
      if (!row.payload) continue;
      try {
        const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
        const driver = data?.driver as DriverSnapshot | undefined;
        if (!driver?.id) continue;
        if (map.has(driver.id)) continue;

        map.set(driver.id, {
          id: driver.id,
          name: driver.name,
          snapshot: driver,
          callSign: data?.route?.driverCallsign,
        });
      } catch (error) {
        console.warn("[AddTow] Failed to parse driver payload:", error);
      }
    }

    if (map.size === 0) {
      return [];
    }

    return Array.from(map.values());
  } catch (error) {
    console.error("[AddTow] Failed to load drivers:", error);
    return [];
  }
}

export default AddTow;


