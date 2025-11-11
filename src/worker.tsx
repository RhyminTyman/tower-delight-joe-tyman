import type { RequestInfo } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { STATIC_DRIVER_DASHBOARD, loadDashboardFromDatabase } from "@/app/data/driver-dashboard";
import { setCommonHeaders } from "@/app/headers";
import { EditAddress } from "@/app/pages/EditAddress";
import { EditTow } from "@/app/pages/EditTow";
import { Home } from "@/app/pages/Home";
import { TowDetail } from "@/app/pages/TowDetail";
import { TowList } from "@/app/pages/TowList";

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
  ]),
  route("/api/driver-dashboard", async () => {
    const payload = await loadDashboardFromDatabase();
    return Response.json(payload ?? STATIC_DRIVER_DASHBOARD);
  }),
  route("/api/seed", async () => {
    try {
      // Import seed function dynamically
      const seedModule = await import("./scripts/seed");
      await seedModule.default();
      return Response.json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed failed:", error);
      return Response.json(
        { success: false, message: error instanceof Error ? error.message : "Seed failed" },
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
