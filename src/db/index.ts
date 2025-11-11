import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";

import { migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;

export type DriverDashboardRow = AppDatabase["driver_dashboard"];

// Export a singleton - create the db instance ONCE at module level
console.log("[DB] Creating db instance, env.DATABASE:", !!env.DATABASE);
export const db = createDb<AppDatabase>(env.DATABASE, "tower-delight-driver-dashboard");
console.log("[DB] DB instance created:", typeof db);

