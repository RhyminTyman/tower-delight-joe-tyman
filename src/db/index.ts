import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";

import { migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;

export type DriverDashboardRow = AppDatabase["driver_dashboard"];

// Export a singleton - create the db instance ONCE at module level
export const db = createDb<AppDatabase>(env.DATABASE, "tower-delight-driver-dashboard");

