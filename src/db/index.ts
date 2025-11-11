import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";

import { migrations } from "@/db/migrations";

export type AppDatabase = Database<typeof migrations>;

export type DriverDashboardRow = AppDatabase["driver_dashboard"];

export const db = createDb<AppDatabase>(env.DATABASE, "tower-delight-driver-dashboard");

