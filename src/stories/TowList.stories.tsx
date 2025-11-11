import type { Meta, StoryObj } from "@storybook/react";
import { TowList } from "@/app/pages/TowList";

const meta = {
  title: "Screens/DriverOps/TowList",
  component: TowList,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
} satisfies Meta<typeof TowList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveTows: Story = {
  name: "Active Tows - List View",
  parameters: {
    docs: {
      description: {
        story:
          "Overview of all active tows assigned to the driver. Shows status, vehicle info, and addresses at a glance. Clicking any tow navigates to the detailed dashboard view.",
      },
    },
  },
};

