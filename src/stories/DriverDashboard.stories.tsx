import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";

import {
  type DriverDashboardData,
  STATIC_DRIVER_DASHBOARD,
} from "@/app/data/driver-dashboard";
import { HomeScreen } from "@/app/pages/Home";

const baseData: DriverDashboardData = STATIC_DRIVER_DASHBOARD;

const cloneDashboard = (data: DriverDashboardData): DriverDashboardData => ({
  driver: { ...data.driver },
  dispatch: { ...data.dispatch },
  workflow: data.workflow.map((stage) => ({ ...stage })),
  actions: data.actions.map((action) => ({ ...action })),
  checklist: data.checklist.map((item) => ({ ...item })),
  impoundPreparation: data.impoundPreparation.map((item) => ({ ...item })),
  nextAction: { ...data.nextAction },
  route: {
    ...data.route,
    pickup: { ...data.route.pickup },
    destination: { ...data.route.destination },
    statuses: data.route.statuses.map((status) => ({ ...status })),
  },
});

const meta = {
  title: "Screens/DriverOps/RouteDashboard",
  component: HomeScreen,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
} satisfies Meta<typeof HomeScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EnRoutePrimary: Story = {
  args: cloneDashboard(baseData),
};

export const BlizzardDetour: Story = {
  args: {
    ...cloneDashboard(baseData),
    route: {
      ...baseData.route,
      status: "Dispatched",
      statusTone: "active",
      updateCta: "Acknowledge Hazard",
      pickup: {
        ...baseData.route.pickup,
        distance: "412 mi (7 h 45 m)",
      },
      destination: {
        title: "City Storage Lot",
        address: "1440 Snowmelt Ave, Denver CO 80204",
        distance: "12 mi (26 m)",
      },
      statuses: baseData.route.statuses.map((status) =>
        status.label === "Dispatched"
          ? { ...status, status: "active", time: "10:56 AM" }
          : status.label === "En Route"
            ? { ...status, status: "waiting", time: "--" }
            : status,
      ),
    },
    nextAction: {
      label: "Salt ramps before loading",
      detail: "Snow alert from dispatch · verify traction kit",
    },
  },
};

export const TowComplete: Story = {
  args: {
    ...cloneDashboard(baseData),
    driver: {
      ...baseData.driver,
      status: "Impound Run",
    },
    route: {
      ...baseData.route,
      status: "Towing",
      statusTone: "completed",
      updateCta: "Close Ticket",
      statuses: baseData.route.statuses.map((status) =>
        status.label === "Towing"
          ? { ...status, status: "active", time: "11:32 AM" }
          : status.label === "On Scene"
            ? { ...status, status: "completed", time: "11:15 AM" }
            : { ...status, status: "completed" },
      ),
    },
    nextAction: {
      label: "Submit tow photos to APD",
      detail: "4-angle set required before lot arrival",
    },
  },
};

