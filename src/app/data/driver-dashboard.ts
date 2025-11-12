import type { RequestInfo } from "rwsdk/worker";

import { db } from "@/db";
import type { DriverDashboardRow } from "@/db";

const DRIVER_DASHBOARD_TABLE = "driver_dashboard" as const;
const DASHBOARD_ROW_ID = "primary" as const;

type DispatchWorkflowStageStatus = "complete" | "active" | "upcoming";

export interface DispatchWorkflowStage {
  key: string;
  label: string;
  detail: string;
  occurredAt?: string;
  status: DispatchWorkflowStageStatus;
}

export interface DriverSnapshot {
  id: string;
  name: string;
  role: string;
  shift: string;
  truck: string;
  status: string;
  contactNumber?: string;
}

export interface DispatchTicket {
  ticketId: string;
  etaMinutes: number;
  location: string;
  vehicle: string;
  customer: string;
}

export interface RouteStop {
  title: string;
  address: string;
  distance?: string;
  lat?: number;
  lng?: number;
}

export interface RouteTimelineEntry {
  label: string;
  time: string;
  status: "waiting" | "active" | "completed";
}

export interface RouteOverview {
  status: string;
  statusTone: "waiting" | "active" | "completed";
  mapImage: string;
  mapUrl?: string;
  updateCta: string;
  pickup: RouteStop;
  destination: RouteStop;
  dispatcher: string;
  hasKeys: boolean;
  type: string;
  poNumber: string;
  driverCallsign: string;
  truck: string;
  statuses: RouteTimelineEntry[];
  lastPhoto?: {
    dataUrl: string;
    fileName?: string;
    mimeType?: string;
    timestamp: string;
  };
}

export interface ChecklistItem {
  id: string;
  label: string;
  critical: boolean;
  complete: boolean;
}

export interface ImpoundPreparationItem {
  id: string;
  title: string;
  value: string;
}

export interface DriverDashboardData {
  driver: DriverSnapshot;
  dispatch: DispatchTicket;
  workflow: DispatchWorkflowStage[];
  actions: Array<{ id: string; label: string; variant: "default" | "secondary" | "ghost" }>;
  checklist: ChecklistItem[];
  impoundPreparation: ImpoundPreparationItem[];
  nextAction: {
    label: string;
    detail: string;
  };
  route: RouteOverview;
}


// Template for seeding and testing only - NOT for runtime fallback
export const DASHBOARD_TEMPLATE: DriverDashboardData = {
  driver: {
    id: "driver-784",
    name: "Jordan Alvarez",
    role: "Heavy Duty Operator",
    shift: "Night Shift · 6:00p — 2:00a",
    truck: "Unit HD-12 · Peterbilt 567",
    status: "On Call",
    contactNumber: "+1 (512) 555-0114",
  },
  dispatch: {
    ticketId: "TD-4827",
    etaMinutes: 11,
    location: "I-35 Frontage Rd & 5th St, Austin",
    vehicle: "2022 Ford F-150 · Blue · TX 9KP-3821",
    customer: "APD · Officer Nguyen",
  },
  route: {
    status: "En Route",
    statusTone: "active",
    mapImage: "",
    updateCta: "Update Status",
    pickup: {
      title: "Kyle's Motors",
      address: "830 South 17th Street, Columbus OH 43206",
      distance: "1241 mi (18 h 4 m)",
    },
    destination: {
      title: "Destination",
      address: "830 South 17th Street, Columbus OH 43206",
      distance: "1 ft (1 min)",
    },
    dispatcher: "Kyle Ed",
    hasKeys: false,
    type: "Light",
    poNumber: "123",
    driverCallsign: "Kyle Ed",
    truck: "Richie",
    statuses: [
      { label: "Waiting", time: "10:55 AM", status: "completed" },
      { label: "Dispatched", time: "10:56 AM", status: "completed" },
      { label: "En Route", time: "10:57 AM", status: "active" },
      { label: "On Scene", time: "--", status: "waiting" },
      { label: "Towing", time: "--", status: "waiting" },
      { label: "Completed", time: "--", status: "waiting" },
    ],
  },
  workflow: [
    {
      key: "assigned",
      label: "Dispatch Accepted",
      detail: "Ticket acknowledged · incident brief downloaded",
      occurredAt: "21:12",
      status: "complete",
    },
    {
      key: "enroute",
      label: "En Route",
      detail: "Unit rolling · Waze navigation active",
      occurredAt: "21:17",
      status: "complete",
    },
    {
      key: "onscene",
      label: "On Scene",
      detail: "APD waiting · light traffic shoulder",
      status: "active",
    },
    {
      key: "load",
      label: "Load & Secure",
      detail: "Document damage · verify VIN & keys",
      status: "upcoming",
    },
    {
      key: "impound",
      label: "Impound Intake",
      detail: "Sign off · assign storage bay · upload photos",
      status: "upcoming",
    },
  ],
  actions: [
    { id: "navigate", label: "Navigate", variant: "default" },
    { id: "call-dispatch", label: "Call Dispatch", variant: "secondary" },
    { id: "record-damage", label: "Record Damage", variant: "secondary" },
  ],
  checklist: [
    {
      id: "scene-secured",
      label: "Scene secured with cones & strobes",
      critical: true,
      complete: true,
    },
    {
      id: "driver-id",
      label: "Driver ID confirmed",
      critical: false,
      complete: true,
    },
    {
      id: "vin-scan",
      label: "VIN scanned & verified",
      critical: true,
      complete: false,
    },
    {
      id: "photo-proof",
      label: "Photo evidence captured",
      critical: false,
      complete: false,
    },
  ],
  impoundPreparation: [
    { id: "lot", title: "Impound Lot", value: "South Yard · Bay 4 (reserved)" },
    { id: "paperwork", title: "Paperwork", value: "APD Form 72-B (pre-filled)" },
    { id: "payment", title: "Payment", value: "APD direct bill · no customer hold" },
  ],
  nextAction: {
    label: "Scan VIN & capture 4-angle photos",
    detail: "Pre-fills impound intake and officer sign-off.",
  },
};

export async function loadDriverDashboard(
  requestInfo?: Pick<RequestInfo, "ctx">,
): Promise<DriverDashboardData | null> {
  const dashboardFromDb = await loadDashboardFromDatabase();
  if (dashboardFromDb) {
    return dashboardFromDb;
  }

  const apiBaseUrl = resolveApiBaseUrl(requestInfo);
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 4500);
    const response = await fetch(`${apiBaseUrl}/driver-dashboard`, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        `[driver-dashboard] Non-OK response (${response.status}) from ${apiBaseUrl}/driver-dashboard`,
      );
      return null;
    }

    const payload = (await response.json()) as DriverDashboardData;
    return payload;
  } catch (error) {
    if (error instanceof Error) {
      console.error("[driver-dashboard] Failed to load dashboard:", error.message);
    } else {
      console.error("[driver-dashboard] Failed to load dashboard:", error);
    }
    return null;
  }
}

function resolveApiBaseUrl(requestInfo?: Pick<RequestInfo, "ctx">) {
  const fromCtx = requestInfo?.ctx as { apiBaseUrl?: string } | undefined;
  const fromGlobal =
    typeof globalThis !== "undefined" ? (globalThis as GlobalTowerEnv).__TOWER_API_BASE_URL : undefined;
  const fromVite = import.meta.env?.VITE_TOWER_API_BASE_URL;

  return fromCtx?.apiBaseUrl || fromGlobal || fromVite || null;
}

type GlobalTowerEnv = {
  __TOWER_API_BASE_URL?: string;
};



export async function loadDashboardFromDatabase(): Promise<DriverDashboardData | null> {
  try {
    const row = await db
      .selectFrom(DRIVER_DASHBOARD_TABLE)
      .select("payload")
      .where("id", "=", DASHBOARD_ROW_ID)
      .executeTakeFirst();

    if (!row?.payload) {
      return null;
    }

    return parseDashboardRow(row);
  } catch (error) {
    if (error instanceof Error) {
      console.warn("[driver-dashboard] Failed to load from database:", error.message);
    } else {
      console.warn("[driver-dashboard] Failed to load from database:", error);
    }
    return null;
  }
}

export function parseDashboardRow(row: Pick<DriverDashboardRow, "payload">): DriverDashboardData | null {
  try {
    const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    return data as DriverDashboardData;
  } catch (error) {
    console.warn("[driver-dashboard] Failed to parse database payload:", error);
    return null;
  }
}

