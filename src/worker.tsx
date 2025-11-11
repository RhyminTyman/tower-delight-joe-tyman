import type { RequestInfo } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { STATIC_DRIVER_DASHBOARD, loadDashboardFromDatabase } from "@/app/data/driver-dashboard";
import { setCommonHeaders } from "@/app/headers";
import { AddNote } from "@/app/pages/AddNote";
import { EditAddress } from "@/app/pages/EditAddress";
import { EditTow } from "@/app/pages/EditTow";
import { Home } from "@/app/pages/Home";
import { TowDetail } from "@/app/pages/TowDetail";
import { TowList } from "@/app/pages/TowList";
import { db } from "@/db";

export type AppContext = {
  apiBaseUrl?: string;
};

declare global {
  // biome-ignore lint/style/noVar: Cloudflare worker safe global
  var __TOWER_API_BASE_URL: string | undefined;
}

const hydrateAppContext = (requestInfo: RequestInfo<any, AppContext>) => {
  if (!requestInfo.ctx.apiBaseUrl) {
    requestInfo.ctx.apiBaseUrl =
      globalThis.__TOWER_API_BASE_URL ?? import.meta.env.VITE_TOWER_API_BASE_URL ?? undefined;
  }
};

const app = defineApp([
  setCommonHeaders(),
  hydrateAppContext,
  render(Document, [
    route("/", TowList),
    route("/tow/:id", TowDetail),
    route("/tow/:id/edit", EditTow),
    route("/tow/:id/address/:type", EditAddress),
    route("/tow/:id/note", AddNote),
  ]),
  route("/api/driver-dashboard", async () => {
    const payload = await loadDashboardFromDatabase();
    return Response.json(payload ?? STATIC_DRIVER_DASHBOARD);
  }),
  route("/api/debug/tows", async () => {
    try {
      const rows = await db.selectFrom("driver_dashboard").select(["id", "payload"]).execute();
      return Response.json({
        count: rows.length,
        ids: rows.map(r => r.id),
        rows: rows.map(r => ({
          id: r.id,
          payload: JSON.parse(r.payload)
        }))
      });
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
  }),
  route("/api/seed", async () => {
    try {
      console.log("[Seed] Starting seed process...");

      const SEED_TOWS = [
        {
          id: "tow-001",
          ticketId: "APD-2024-1847",
          status: "En Route",
          statusTone: "active" as const,
          vehicle: "2019 Honda Civic · Silver · ABC-1234",
          pickup: { title: "Kyle's Motors", address: "830 South 17th Street, Columbus OH 43206", distance: "12 mi (26 m)" },
          destination: { title: "City Impound Lot", address: "1440 Alum Creek Dr, Columbus OH 43209", distance: "8 mi (18 m)" },
          etaMinutes: 26,
        },
        {
          id: "tow-002",
          ticketId: "APD-2024-1852",
          status: "On Scene",
          statusTone: "active" as const,
          vehicle: "2021 Ford F-150 · White · XYZ-5678",
          pickup: { title: "Walmart Parking Lot", address: "3600 Soldano Blvd, Columbus OH 43228", distance: "0 mi (0 m)" },
          destination: { title: "West Side Impound", address: "2500 McKinley Ave, Columbus OH 43204", distance: "5 mi (12 m)" },
          etaMinutes: 0,
        },
        {
          id: "tow-003",
          ticketId: "APD-2024-1839",
          status: "Towing",
          statusTone: "completed" as const,
          vehicle: "2018 Toyota Camry · Black · DEF-9012",
          pickup: { title: "Downtown Parking Garage", address: "55 E Spring St, Columbus OH 43215", distance: "0 mi (0 m)" },
          destination: { title: "City Impound Lot", address: "1440 Alum Creek Dr, Columbus OH 43209", distance: "3 mi (8 m)" },
          etaMinutes: 8,
        },
        {
          id: "tow-004",
          ticketId: "APD-2024-1860",
          status: "Dispatched",
          statusTone: "waiting" as const,
          vehicle: "2020 Jeep Wrangler · Red · GHI-3456",
          pickup: { title: "Ohio State Campus", address: "1739 N High St, Columbus OH 43210", distance: "18 mi (32 m)" },
          destination: { title: "North Impound Facility", address: "3232 Morse Rd, Columbus OH 43231", distance: "6 mi (14 m)" },
          etaMinutes: 32,
        },
        {
          id: "tow-005",
          ticketId: "APD-2024-1865",
          status: "Waiting",
          statusTone: "waiting" as const,
          vehicle: "2017 Nissan Altima · Blue · JKL-7890",
          pickup: { title: "Easton Town Center", address: "160 Easton Town Center, Columbus OH 43219", distance: "22 mi (38 m)" },
          destination: { title: "East Side Storage", address: "5500 E Livingston Ave, Columbus OH 43232", distance: "9 mi (20 m)" },
          etaMinutes: 38,
        },
      ];

      // Clear existing tows
      console.log("[Seed] Clearing existing tows...");
      await db.deleteFrom("driver_dashboard").execute();
      console.log("[Seed] Cleared existing tows");

      // Insert all seed tows
      console.log(`[Seed] Inserting ${SEED_TOWS.length} tows...`);
      for (const tow of SEED_TOWS) {
        const dashboardData = {
          ...STATIC_DRIVER_DASHBOARD,
          dispatch: {
            ...STATIC_DRIVER_DASHBOARD.dispatch,
            ticketId: tow.ticketId,
            vehicle: tow.vehicle,
            etaMinutes: tow.etaMinutes,
          },
          route: {
            ...STATIC_DRIVER_DASHBOARD.route,
            status: tow.status,
            statusTone: tow.statusTone,
            pickup: tow.pickup,
            destination: tow.destination,
            statuses: STATIC_DRIVER_DASHBOARD.route.statuses.map((s) => {
              if (tow.status === "Waiting") {
                return s.label === "Waiting" ? { ...s, status: "active" } : { ...s, status: "waiting" };
              }
              if (tow.status === "Dispatched") {
                return s.label === "Dispatched"
                  ? { ...s, status: "active" }
                  : s.label === "Waiting"
                    ? { ...s, status: "completed" }
                    : { ...s, status: "waiting" };
              }
              if (tow.status === "En Route") {
                return s.label === "En Route"
                  ? { ...s, status: "active" }
                  : s.label === "Waiting" || s.label === "Dispatched"
                    ? { ...s, status: "completed" }
                    : { ...s, status: "waiting" };
              }
              if (tow.status === "On Scene") {
                return s.label === "On Scene"
                  ? { ...s, status: "active" }
                  : s.label === "Waiting" || s.label === "Dispatched" || s.label === "En Route"
                    ? { ...s, status: "completed" }
                    : { ...s, status: "waiting" };
              }
              if (tow.status === "Towing") {
                return s.label === "Towing" ? { ...s, status: "active" } : { ...s, status: "completed" };
              }
              return s;
            }),
          },
        };

        await db
          .insertInto("driver_dashboard")
          .values({
            id: tow.id,
            payload: JSON.stringify(dashboardData),
            updated_at: Math.floor(Date.now() / 1000),
          })
          .execute();
        console.log(`[Seed] Inserted tow: ${tow.id}`);
      }

      // Verify the insert
      const verifyRows = await db.selectFrom("driver_dashboard").select(["id"]).execute();
      console.log(`[Seed] Verification: ${verifyRows.length} rows in database`);

      const response = Response.json({ 
        success: true, 
        message: `Database seeded successfully with ${SEED_TOWS.length} tows`,
        verification: {
          inserted: SEED_TOWS.length,
          found: verifyRows.length,
          ids: verifyRows.map(r => r.id)
        }
      });
      
      // Add cache control headers to prevent caching
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      
      return response;
    } catch (error) {
      console.error("Seed failed:", error);
      return Response.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : "Seed failed",
          error: error instanceof Error ? error.stack : String(error)
        },
        { status: 500 }
      );
    }
  }),
]);

export default {
  fetch(request: Request, env: Env & { TOWER_API_BASE_URL?: string }, cf: ExecutionContext) {
    globalThis.__TOWER_API_BASE_URL = env.TOWER_API_BASE_URL;
    return app.fetch(request, env, cf);
  },
};

export { Database } from "@/db/durable-object";
