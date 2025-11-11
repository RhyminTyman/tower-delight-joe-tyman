import type { RequestInfo } from "rwsdk/worker";
import { render, route } from "rwsdk/router";
import { defineApp } from "rwsdk/worker";

import { Document } from "@/app/Document";
import { STATIC_DRIVER_DASHBOARD } from "@/app/data/driver-dashboard";
import { setCommonHeaders } from "@/app/headers";
import { Home } from "@/app/pages/Home";

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
  render(Document, [route("/", Home)]),
  route("/api/driver-dashboard", {
    get: () => Response.json(STATIC_DRIVER_DASHBOARD),
  }),
]);

export default {
  fetch(request: Request, env: Env & { TOWER_API_BASE_URL?: string }, cf: ExecutionContext) {
    globalThis.__TOWER_API_BASE_URL = env.TOWER_API_BASE_URL;
    return app.fetch(request, env, cf);
  },
};
