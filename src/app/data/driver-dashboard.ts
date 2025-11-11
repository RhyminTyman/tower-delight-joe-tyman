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

type RemoteDashboardResponse = {
  driver: Partial<DriverSnapshot>;
  dispatch: Partial<DispatchTicket>;
  workflow?: Array<Partial<DispatchWorkflowStage>>;
  actions?: Array<Partial<DriverDashboardData["actions"][number]>>;
  checklist?: Array<Partial<ChecklistItem>>;
  impoundPreparation?: Array<Partial<ImpoundPreparationItem>>;
  nextAction?: Partial<DriverDashboardData["nextAction"]>;
  route?: Partial<RouteOverview> & {
    statuses?: Array<Partial<RouteTimelineEntry>>;
  };
};

const FALLBACK_DASHBOARD: DriverDashboardData = {
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
    mapImage:
      "https://images.unsplash.com/photo-1524678714210-9917a6c619c4?q=80&w=1800&auto=format&fit=crop",
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
): Promise<DriverDashboardData> {
  const dashboardFromDb = await loadDashboardFromDatabase();
  if (dashboardFromDb) {
    return dashboardFromDb;
  }

  const apiBaseUrl = resolveApiBaseUrl(requestInfo);
  if (!apiBaseUrl) {
    return FALLBACK_DASHBOARD;
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
      console.warn(
        `[driver-dashboard] Non-OK response (${response.status}) from ${apiBaseUrl}/driver-dashboard`,
      );
      return FALLBACK_DASHBOARD;
    }

    const payload = (await response.json()) as RemoteDashboardResponse;
    return mergeDashboard(payload);
  } catch (error) {
    if (error instanceof Error) {
      console.warn("[driver-dashboard] Falling back to static data:", error.message);
    } else {
      console.warn("[driver-dashboard] Falling back to static data:", error);
    }
    return FALLBACK_DASHBOARD;
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

function mergeDashboard(remote: RemoteDashboardResponse): DriverDashboardData {
  const driver = { ...FALLBACK_DASHBOARD.driver, ...remote.driver };
  const dispatch = { ...FALLBACK_DASHBOARD.dispatch, ...remote.dispatch };
  const workflow =
    remote.workflow?.map((stage, index) => {
      const fallback =
        (stage.key
          ? FALLBACK_DASHBOARD.workflow.find((item) => item.key === stage.key)
          : FALLBACK_DASHBOARD.workflow[index]) ?? FALLBACK_DASHBOARD.workflow[index]!;
      return {
        key: stage.key ?? fallback.key,
        label: stage.label ?? fallback.label,
        detail: stage.detail ?? fallback.detail,
        occurredAt: stage.occurredAt ?? fallback.occurredAt,
        status: stage.status ?? fallback.status,
      };
    }) ?? FALLBACK_DASHBOARD.workflow;
  const actions =
    remote.actions?.map((action, index) => {
      const fallback =
        (action.id
          ? FALLBACK_DASHBOARD.actions.find((item) => item.id === action.id)
          : FALLBACK_DASHBOARD.actions[index]) ?? FALLBACK_DASHBOARD.actions[index]!;
      return {
        id: action.id ?? fallback.id,
        label: action.label ?? fallback.label,
        variant:
          (action.variant as DriverDashboardData["actions"][number]["variant"]) ??
          fallback.variant ??
          "default",
      };
    }) ?? FALLBACK_DASHBOARD.actions;
  const checklist =
    remote.checklist?.map((item, index) => {
      const fallback =
        (item.id
          ? FALLBACK_DASHBOARD.checklist.find((entry) => entry.id === item.id)
          : FALLBACK_DASHBOARD.checklist[index]) ?? FALLBACK_DASHBOARD.checklist[index]!;
      return {
        id: item.id ?? fallback.id,
        label: item.label ?? fallback.label,
        critical: item.critical ?? fallback.critical,
        complete: item.complete ?? fallback.complete,
      };
    }) ?? FALLBACK_DASHBOARD.checklist;
  const impoundPreparation =
    remote.impoundPreparation?.map((item, index) => {
      const fallback =
        (item.id
          ? FALLBACK_DASHBOARD.impoundPreparation.find((entry) => entry.id === item.id)
          : FALLBACK_DASHBOARD.impoundPreparation[index]) ??
        FALLBACK_DASHBOARD.impoundPreparation[index]!;
      return {
        id: item.id ?? fallback.id,
        title: item.title ?? fallback.title,
        value: item.value ?? fallback.value,
      };
    }) ?? FALLBACK_DASHBOARD.impoundPreparation;
  const nextAction = { ...FALLBACK_DASHBOARD.nextAction, ...remote.nextAction };
  const routeStatuses =
    remote.route?.statuses?.map((entry, index) => {
      const fallback =
        (entry.label
          ? FALLBACK_DASHBOARD.route.statuses.find((status) => status.label === entry.label)
          : FALLBACK_DASHBOARD.route.statuses[index]) ??
        FALLBACK_DASHBOARD.route.statuses[index]!;
      return {
        label: entry.label ?? fallback.label,
        time: entry.time ?? fallback.time,
        status: entry.status ?? fallback.status,
      };
    }) ?? FALLBACK_DASHBOARD.route.statuses;
  const route: RouteOverview = {
    ...FALLBACK_DASHBOARD.route,
    ...remote.route,
    statuses: routeStatuses,
  };

  return {
    driver,
    dispatch: {
      ...dispatch,
      etaMinutes: Number(
        dispatch.etaMinutes ?? FALLBACK_DASHBOARD.dispatch.etaMinutes,
      ),
    },
    workflow,
    actions,
    checklist,
    impoundPreparation,
    nextAction,
    route,
  };
}

export const STATIC_DRIVER_DASHBOARD = FALLBACK_DASHBOARD;

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

function parseDashboardRow(row: Pick<DriverDashboardRow, "payload">): DriverDashboardData | null {
  try {
    return JSON.parse(row.payload) as DriverDashboardData;
  } catch (error) {
    console.warn("[driver-dashboard] Failed to parse database payload:", error);
    return null;
  }
}

