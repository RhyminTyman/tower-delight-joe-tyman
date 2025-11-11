import type { RequestInfo } from "rwsdk/worker";

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
}

export interface DispatchTicket {
  ticketId: string;
  etaMinutes: number;
  location: string;
  vehicle: string;
  customer: string;
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
}

type RemoteDashboardResponse = {
  driver: Partial<DriverSnapshot>;
  dispatch: Partial<DispatchTicket>;
  workflow?: Array<Partial<DispatchWorkflowStage>>;
  actions?: Array<Partial<DriverDashboardData["actions"][number]>>;
  checklist?: Array<Partial<ChecklistItem>>;
  impoundPreparation?: Array<Partial<ImpoundPreparationItem>>;
  nextAction?: Partial<DriverDashboardData["nextAction"]>;
};

const FALLBACK_DASHBOARD: DriverDashboardData = {
  driver: {
    id: "driver-784",
    name: "Jordan Alvarez",
    role: "Heavy Duty Operator",
    shift: "Night Shift · 6:00p — 2:00a",
    truck: "Unit HD-12 · Peterbilt 567",
    status: "On Call",
  },
  dispatch: {
    ticketId: "TD-4827",
    etaMinutes: 11,
    location: "I-35 Frontage Rd & 5th St, Austin",
    vehicle: "2022 Ford F-150 · Blue · TX 9KP-3821",
    customer: "APD · Officer Nguyen",
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
  };
}

export const STATIC_DRIVER_DASHBOARD = FALLBACK_DASHBOARD;

