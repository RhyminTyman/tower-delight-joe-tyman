import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";

import { migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;

export type DriverDashboardRow = AppDatabase["driver_dashboard"];

// Create a function to get the db instance to ensure we always use the same Durable Object
export function getDb() {
  return createDb<AppDatabase>(env.DATABASE, "tower-delight-driver-dashboard");
}

// Export a singleton for convenience
export const db = getDb();

