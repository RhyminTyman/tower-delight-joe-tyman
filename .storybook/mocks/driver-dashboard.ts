// .storybook/mocks/driver-dashboard.ts
// Re-export only the types and data, without the server-side functions

export type { 
  DriverDashboardData,
  DriverSnapshot,
  DispatchTicket,
  RouteStop,
  RouteTimelineEntry,
  RouteOverview,
  ChecklistItem,
  ImpoundPreparationItem,
  DispatchWorkflowStage
} from "../../src/app/data/driver-dashboard";

// Re-export DASHBOARD_TEMPLATE
export { DASHBOARD_TEMPLATE } from "../../src/app/data/driver-dashboard";

// Mock the server functions so they don't get imported
export async function fetchDriverDashboard() {
  return null;
}

export async function updateDriverDashboard() {
  return;
}

