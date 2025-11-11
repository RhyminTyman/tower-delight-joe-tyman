import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";

import {
  type DriverDashboardData,
  STATIC_DRIVER_DASHBOARD,
} from "@/app/data/driver-dashboard";
import { DriverDashboard } from "@/app/components/DriverDashboard";

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
  component: DriverDashboard,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
} satisfies Meta<typeof DriverDashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EnRoutePrimary: Story = {
  name: "En Route - Primary Flow",
  args: {
    ...cloneDashboard(baseData),
    towId: "primary",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default active route scenario. Driver has acknowledged dispatch and is en route to pickup location. Shows standard workflow progression with VIN scan as next action. Edit icon appears next to pickup address.",
      },
    },
  },
};

export const OnScene: Story = {
  name: "On Scene - Active Capture",
  args: {
    ...cloneDashboard(baseData),
    towId: "primary",
    driver: {
      ...baseData.driver,
      status: "On Scene",
    },
    route: {
      ...baseData.route,
      status: "On Scene",
      statusTone: "active",
      updateCta: "Mark Loading",
      statuses: baseData.route.statuses.map((status) =>
        status.label === "On Scene"
          ? { ...status, status: "active", time: "11:15 AM" }
          : status.label === "Waiting" || status.label === "Dispatched" || status.label === "En Route"
            ? { ...status, status: "completed" }
            : { ...status, status: "waiting", time: "--" },
      ),
    },
    nextAction: {
      label: "Scan VIN & capture 4-angle photos",
      detail: "Pre-fills impound intake and officer sign-off.",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Driver has arrived on scene. Critical capture phase where VIN scanning and photo documentation must be completed before loading vehicle. Edit icon appears next to pickup address.",
      },
    },
  },
};

export const BlizzardDetour: Story = {
  name: "Dispatched - Weather Hazard",
  args: {
    ...cloneDashboard(baseData),
    towId: "primary",
    driver: {
      ...baseData.driver,
      status: "Dispatched",
    },
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
          : status.label === "Waiting"
            ? { ...status, status: "completed", time: "10:55 AM" }
            : { ...status, status: "waiting", time: "--" },
      ),
    },
    nextAction: {
      label: "Salt ramps before loading",
      detail: "Snow alert from dispatch · verify traction kit",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Weather hazard scenario. Driver receives dispatch with special instructions for winter conditions. Demonstrates how environmental factors affect next actions. Edit icon appears next to pickup address.",
      },
    },
  },
};

export const TowComplete: Story = {
  name: "Towing - Final Documentation",
  args: {
    ...cloneDashboard(baseData),
    towId: "primary",
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
          : { ...status, status: "completed" },
      ),
    },
    nextAction: {
      label: "Submit tow photos to APD",
      detail: "4-angle set required before lot arrival",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Final stage of workflow. Vehicle is loaded and being towed to impound. Driver must submit documentation to APD before completing ticket. Edit icon appears next to pickup address.",
      },
    },
  },
};

