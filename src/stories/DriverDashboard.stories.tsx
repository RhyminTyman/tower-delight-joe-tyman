import type { Meta, StoryObj } from "@storybook/react";

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
});

const meta: Meta<typeof HomeScreen> = {
  title: "Screens/DriverWorkflow",
  component: HomeScreen,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
};

export default meta;

type Story = StoryObj<typeof HomeScreen>;

export const ActiveDispatch: Story = {
  args: cloneDashboard(baseData),
};

export const ImpoundHold: Story = {
  args: {
    ...cloneDashboard(baseData),
    driver: {
      ...baseData.driver,
      status: "Impound Hold",
    },
    workflow: baseData.workflow.map((stage) =>
      stage.key === "impound"
        ? {
            ...stage,
            detail: "Awaiting lot manager sign-off · photo set flagged",
            status: "active",
          }
        : stage.key === "load"
          ? { ...stage, status: "complete", occurredAt: "21:34" }
          : stage,
    ),
    checklist: baseData.checklist.map((item) =>
      item.id === "photo-proof" ? { ...item, complete: true } : item,
    ),
    nextAction: {
      label: "Check impound paperwork exceptions",
      detail: "Officer notes uploaded · expedite before 22:00 curfew.",
    },
  },
};

export const OfflineFallback: Story = {
  args: {
    ...cloneDashboard(baseData),
    driver: {
      ...baseData.driver,
      status: "Offline Mode",
    },
    actions: baseData.actions.map((action) =>
      action.id === "navigate"
        ? { ...action, label: "Retry Navigation" }
        : action.id === "record-damage"
          ? { ...action, label: "Queue Photos (4)" }
          : action,
    ),
    impoundPreparation: baseData.impoundPreparation.map((item) =>
      item.id === "paperwork"
        ? { ...item, value: "Offline cache · sync pending" }
        : item,
    ),
    nextAction: {
      label: "Restore connectivity to sync damage photos",
      detail: "Upload required before impound release.",
    },
  },
};

