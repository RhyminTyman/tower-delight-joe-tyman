import { db } from "@/db";
import { STATIC_DRIVER_DASHBOARD } from "@/app/data/driver-dashboard";

const DRIVER_DASHBOARD_TABLE = "driver_dashboard" as const;
const DASHBOARD_ROW_ID = "primary" as const;

export default async () => {
  console.log("... Seeding driver dashboard");

  await db.deleteFrom(DRIVER_DASHBOARD_TABLE).where("id", "=", DASHBOARD_ROW_ID).execute();

  await db
    .insertInto(DRIVER_DASHBOARD_TABLE)
    .values({
      id: DASHBOARD_ROW_ID,
      payload: JSON.stringify(STATIC_DRIVER_DASHBOARD),
      updated_at: Math.floor(Date.now() / 1000),
    })
    .execute();

  console.log("Done seeding driver dashboard");
};

