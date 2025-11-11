import type { RequestInfo } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { STATIC_DRIVER_DASHBOARD, loadDashboardFromDatabase } from "@/app/data/driver-dashboard";
import { setCommonHeaders } from "@/app/headers";
import { AddNote } from "@/app/pages/AddNote";
import { AddTow } from "@/app/pages/AddTow";
import { EditAddress } from "@/app/pages/EditAddress";
import { EditTow } from "@/app/pages/EditTow";
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
    route("/tow/new", AddTow),
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
      const rows = await db.selectFrom("driver_dashboard").select(["id", "payload", "updated_at"]).execute();
      return Response.json({
        count: rows.length,
        ids: rows.map(r => r.id),
        rows: rows.map(r => {
          const data = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload;
          return {
            id: r.id,
            updated_at: r.updated_at,
            updated_date: new Date(r.updated_at * 1000).toISOString(),
            pickup: data.route.pickup,
            destination: data.route.destination
          };
        })
      });
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
  }),
  route("/api/tow/:id/photo", async (requestInfo: RequestInfo) => {
    const towId = requestInfo.params.id;
    console.log("[API capturePhoto] Starting for towId:", towId);
    const request = requestInfo.request;

    if (request.method === "DELETE") {
      try {
        const row = await db
          .selectFrom("driver_dashboard")
          .select("payload")
          .where("id", "=", towId)
          .executeTakeFirst();

        if (!row) {
          return Response.json({ error: "Tow not found" }, { status: 404 });
        }

        const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;

        if (data.route) {
          if (data.route.lastPhoto) {
            delete data.route.lastPhoto;
          }
        }

        const photoProofItem = data.checklist?.find((item: any) => item.id === "photo-proof");
        if (photoProofItem) {
          photoProofItem.complete = false;
        }

        data.nextAction = {
          label: "Photo capture needed",
          detail: "Upload fresh documentation to complete this step.",
        };

        await db
          .updateTable("driver_dashboard")
          .set({
            payload: JSON.stringify(data),
            updated_at: Math.floor(Date.now() / 1000),
          })
          .where("id", "=", towId)
          .execute();

        console.log("[API capturePhoto] Photo removed");
        return Response.json({ success: true, mapImageUpdated: false });
      } catch (error) {
        console.error("[API capturePhoto] Error removing photo:", error);
        return Response.json({ error: String(error) }, { status: 500 });
      }
    }

    let photoData: string | null = null;
    let fileName: string | null = null;
    let mimeType: string | null = null;

    try {
      const contentType = request.headers.get("content-type") ?? "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        photoData = (formData.get("photoData") as string) ?? null;
        fileName = (formData.get("fileName") as string) ?? null;
        mimeType = (formData.get("mimeType") as string) ?? null;
      } else if (contentType.includes("application/json")) {
        const body = await request.json() as { photoData?: unknown; fileName?: unknown; mimeType?: unknown };
        photoData = typeof body.photoData === "string" ? body.photoData : null;
        fileName = typeof body.fileName === "string" ? body.fileName : null;
        mimeType = typeof body.mimeType === "string" ? body.mimeType : null;
      }
    } catch (parseError) {
      console.warn("[API capturePhoto] Failed to parse request body:", parseError);
    }

    try {
      const row = await db
        .selectFrom("driver_dashboard")
        .select("payload")
        .where("id", "=", towId)
        .executeTakeFirst();

      if (row) {
        const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

        if (photoData) {
          const isDataUrl = photoData.startsWith("data:image");
          let photoDataUrl: string;
          
          if (!isDataUrl && mimeType) {
            photoDataUrl = `data:${mimeType};base64,${photoData}`;
          } else {
            photoDataUrl = photoData;
          }

          // Store the photo in lastPhoto, not mapImage (which is for the route map)
          data.route.lastPhoto = {
            dataUrl: photoDataUrl,
            fileName: fileName ?? `tow-${towId}-photo`,
            mimeType: mimeType ?? "image/jpeg",
            timestamp: new Date().toISOString(),
          };
        }

        const photoProofItem = data.checklist?.find((item: any) => item.id === "photo-proof");
        if (photoProofItem) {
          photoProofItem.complete = true;
        }

        data.nextAction = photoData
          ? {
              label: "Photo captured successfully",
              detail: "4-angle documentation complete. Ready for next step.",
            }
          : {
              label: "Awaiting photo confirmation",
              detail: "No photo data received. Please try uploading again.",
            };

        await db
          .updateTable("driver_dashboard")
          .set({
            payload: JSON.stringify(data),
            updated_at: Math.floor(Date.now() / 1000),
          })
          .where("id", "=", towId)
          .execute();

        console.log("[API capturePhoto] Success");
        return Response.json({
          success: true,
          mapImageUpdated: Boolean(photoData),
        });
      }

      return Response.json({ error: "Tow not found" }, { status: 404 });
    } catch (error) {
      console.error("[API capturePhoto] Error:", error);
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }),
  route("/api/tow/:id/status", async (requestInfo: RequestInfo) => {
    const towId = requestInfo.params.id;
    console.log("[API updateStatus] Starting for towId:", towId);

    try {
      const row = await db
        .selectFrom("driver_dashboard")
        .select("payload")
        .where("id", "=", towId)
        .executeTakeFirst();

      if (row) {
        const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

        const currentActiveIndex = data.route.statuses.findIndex((s: any) => s.status === "active");
        if (currentActiveIndex >= 0 && currentActiveIndex < data.route.statuses.length - 1) {
          data.route.statuses[currentActiveIndex].status = "completed";
          data.route.statuses[currentActiveIndex].time = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          data.route.statuses[currentActiveIndex + 1].status = "active";
          data.route.statuses[currentActiveIndex + 1].time = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });

          data.route.status = data.route.statuses[currentActiveIndex + 1].label;
        }

        await db
          .updateTable("driver_dashboard")
          .set({
            payload: JSON.stringify(data),
            updated_at: Math.floor(Date.now() / 1000),
          })
          .where("id", "=", towId)
          .execute();

        console.log("[API updateStatus] Success");
        return Response.json({ success: true });
      }

      return Response.json({ error: "Tow not found" }, { status: 404 });
    } catch (error) {
      console.error("[API updateStatus] Error:", error);
      return Response.json({ error: String(error) }, { status: 500 });
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
          pickup: { 
            title: "Kyle's Motors", 
            address: "830 South 17th Street, Columbus OH 43206", 
            distance: "12 mi (26 m)",
            lat: 39.9467,
            lng: -82.9923
          },
          destination: { 
            title: "City Impound Lot", 
            address: "1440 Alum Creek Dr, Columbus OH 43209", 
            distance: "8 mi (18 m)",
            lat: 39.9573,
            lng: -82.9621
          },
          etaMinutes: 26,
        },
        {
          id: "tow-002",
          ticketId: "APD-2024-1852",
          status: "On Scene",
          statusTone: "active" as const,
          vehicle: "2021 Ford F-150 · White · XYZ-5678",
          pickup: { 
            title: "Walmart Parking Lot", 
            address: "3600 Soldano Blvd, Columbus OH 43228", 
            distance: "0 mi (0 m)",
            lat: 39.9445,
            lng: -83.1252
          },
          destination: { 
            title: "West Side Impound", 
            address: "2500 McKinley Ave, Columbus OH 43204", 
            distance: "5 mi (12 m)",
            lat: 39.9526,
            lng: -83.0892
          },
          etaMinutes: 0,
        },
        {
          id: "tow-003",
          ticketId: "APD-2024-1839",
          status: "Towing",
          statusTone: "completed" as const,
          vehicle: "2018 Toyota Camry · Black · DEF-9012",
          pickup: { 
            title: "Downtown Parking Garage", 
            address: "55 E Spring St, Columbus OH 43215", 
            distance: "0 mi (0 m)",
            lat: 39.9612,
            lng: -82.9988
          },
          destination: { 
            title: "City Impound Lot", 
            address: "1440 Alum Creek Dr, Columbus OH 43209", 
            distance: "3 mi (8 m)",
            lat: 39.9573,
            lng: -82.9621
          },
          etaMinutes: 8,
        },
        {
          id: "tow-004",
          ticketId: "APD-2024-1860",
          status: "Dispatched",
          statusTone: "waiting" as const,
          vehicle: "2020 Jeep Wrangler · Red · GHI-3456",
          pickup: { 
            title: "Ohio State Campus", 
            address: "1739 N High St, Columbus OH 43210", 
            distance: "18 mi (32 m)",
            lat: 40.0067,
            lng: -83.0305
          },
          destination: { 
            title: "North Impound Facility", 
            address: "3232 Morse Rd, Columbus OH 43231", 
            distance: "6 mi (14 m)",
            lat: 40.0465,
            lng: -82.9355
          },
          etaMinutes: 32,
        },
        {
          id: "tow-005",
          ticketId: "APD-2024-1865",
          status: "Waiting",
          statusTone: "waiting" as const,
          vehicle: "2017 Nissan Altima · Blue · JKL-7890",
          pickup: { 
            title: "Easton Town Center", 
            address: "160 Easton Town Center, Columbus OH 43219", 
            distance: "22 mi (38 m)",
            lat: 40.0502,
            lng: -82.9188
          },
          destination: { 
            title: "East Side Storage", 
            address: "5500 E Livingston Ave, Columbus OH 43232", 
            distance: "9 mi (20 m)",
            lat: 39.9567,
            lng: -82.8821
          },
          etaMinutes: 38,
        },
      ];

      // Clear existing tows
      console.log("[Seed] Clearing existing tows...");
      await db.deleteFrom("driver_dashboard").execute();
      console.log("[Seed] Cleared existing tows");

      // Helper function to generate map URL using Google Maps Static API
      const generateMapUrl = (pickup: any, destination: any) => {
        if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
          return undefined;
        }
        
        const GOOGLE_MAPS_API_KEY = 'AIzaSyBa684TfLdTXSODlil08SYZNWvm5yCqApQ';
        
        // Google Maps Static API with markers and path
        const markers = [
          `color:red|label:A|${pickup.lat},${pickup.lng}`,
          `color:green|label:B|${destination.lat},${destination.lng}`
        ].join('&markers=');
        
        // Add a path line between pickup and destination
        const path = `color:0x0066ff|weight:3|${pickup.lat},${pickup.lng}|${destination.lat},${destination.lng}`;
        
        return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&scale=2&maptype=roadmap&markers=${markers}&path=${path}&key=${GOOGLE_MAPS_API_KEY}`;
      };

      // Insert all seed tows
      console.log(`[Seed] Inserting ${SEED_TOWS.length} tows...`);
      for (const tow of SEED_TOWS) {
        const mapUrl = generateMapUrl(tow.pickup, tow.destination);
        
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
            mapUrl: mapUrl,
            mapImage: mapUrl || STATIC_DRIVER_DASHBOARD.route.mapImage,
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
  route("/api/seed/drivers/reset", async () => {
    try {
      console.log("[Reset Drivers] Deleting all driver entries...");
      
      // Delete all driver entries (they all have IDs starting with "driver-")
      const result = await db
        .deleteFrom("driver_dashboard")
        .where("id", "like", "driver-%")
        .execute();
      
      console.log(`[Reset Drivers] Deleted driver entries`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "All drivers deleted. Visit /api/seed/drivers to reseed."
        }),
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("[Reset Drivers] Error:", error);
      return new Response(
        JSON.stringify({ success: false, error: String(error) }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }),

  route("/api/seed/drivers", async () => {
    try {
      console.log("[Seed Drivers] Starting seed operation...");

      const SEED_DRIVERS = [
        {
          id: "driver-001",
          name: "Jordan Alvarez",
          role: "Heavy Duty Operator",
          shift: "Night Shift · 6:00p — 2:00a",
          truck: "Unit HD-12 · Peterbilt 567",
          status: "On Call",
          contactNumber: "+1 (512) 555-0114",
          callSign: "Tango-12",
        },
        {
          id: "driver-002",
          name: "Sarah Chen",
          role: "Light Duty Operator",
          shift: "Day Shift · 7:00a — 3:00p",
          truck: "Unit LD-04 · Ford F-450",
          status: "Active",
          contactNumber: "+1 (512) 555-0201",
          callSign: "Alpha-04",
        },
        {
          id: "driver-003",
          name: "Marcus Williams",
          role: "Medium Duty Operator",
          shift: "Swing Shift · 3:00p — 11:00p",
          truck: "Unit MD-07 · International DuraStar",
          status: "On Break",
          contactNumber: "+1 (512) 555-0338",
          callSign: "Bravo-07",
        },
        {
          id: "driver-004",
          name: "Emily Rodriguez",
          role: "Light Duty Operator",
          shift: "Day Shift · 6:00a — 2:00p",
          truck: "Unit LD-02 · Chevrolet Silverado 3500",
          status: "Active",
          contactNumber: "+1 (512) 555-0445",
          callSign: "Charlie-02",
        },
        {
          id: "driver-005",
          name: "David Thompson",
          role: "Heavy Duty Operator",
          shift: "Night Shift · 10:00p — 6:00a",
          truck: "Unit HD-15 · Kenworth T880",
          status: "Off Duty",
          contactNumber: "+1 (512) 555-0552",
          callSign: "Delta-15",
        },
      ];

      let insertedCount = 0;

      for (const driver of SEED_DRIVERS) {
        // Check if driver already exists
        const existing = await db
          .selectFrom("driver_dashboard")
          .select("id")
          .where("id", "=", driver.id)
          .executeTakeFirst();

        if (existing) {
          console.log(`[Seed Drivers] Driver ${driver.id} already exists, skipping...`);
          continue;
        }

        const driverData = {
          ...STATIC_DRIVER_DASHBOARD,
          driver: {
            id: driver.id,
            name: driver.name,
            role: driver.role,
            shift: driver.shift,
            truck: driver.truck,
            status: driver.status,
            contactNumber: driver.contactNumber,
          },
          route: {
            ...STATIC_DRIVER_DASHBOARD.route,
            driverCallsign: driver.callSign,
            truck: driver.truck,
          },
          dispatch: {
            ...STATIC_DRIVER_DASHBOARD.dispatch,
            ticketId: `DRIVER-${driver.id}`,
          },
        };

        await db
          .insertInto("driver_dashboard")
          .values({
            id: driver.id,
            payload: JSON.stringify(driverData),
            updated_at: Math.floor(Date.now() / 1000),
          })
          .execute();

        console.log(`[Seed Drivers] Inserted driver: ${driver.id} (${driver.name})`);
        insertedCount++;
      }

      const response = Response.json({
        success: true,
        message: `Seeded ${insertedCount} drivers`,
        drivers: SEED_DRIVERS.map(d => ({ id: d.id, name: d.name, callSign: d.callSign })),
      });

      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    } catch (error) {
      console.error("[Seed Drivers] Failed:", error);
      return Response.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Seed drivers failed",
          error: error instanceof Error ? error.stack : String(error),
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
