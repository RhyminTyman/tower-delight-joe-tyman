import type { Meta, StoryObj } from "@storybook/react";

import { StatusBanner } from "@/components";

const meta: Meta<typeof StatusBanner> = {
  title: "Components/StatusBanner",
  component: StatusBanner,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    towId: "tow-123",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Waiting: Story = {
  args: {
    currentStatus: "Waiting",
  },
  parameters: {
    docs: {
      description: {
        story: "Initial state when a tow is created and waiting for dispatch.",
      },
    },
  },
};

export const Dispatched: Story = {
  args: {
    currentStatus: "Dispatched",
  },
  parameters: {
    docs: {
      description: {
        story: "Driver has been assigned and notified of the tow.",
      },
    },
  },
};

export const EnRoute: Story = {
  args: {
    currentStatus: "En Route",
  },
  parameters: {
    docs: {
      description: {
        story: "Driver is actively traveling to the pickup location.",
      },
    },
  },
};

export const OnScene: Story = {
  args: {
    currentStatus: "On Scene",
  },
  parameters: {
    docs: {
      description: {
        story: "Driver has arrived at the pickup location and is preparing to load the vehicle.",
      },
    },
  },
};

export const Towing: Story = {
  args: {
    currentStatus: "Towing",
  },
  parameters: {
    docs: {
      description: {
        story: "Vehicle is loaded and being transported to the destination.",
      },
    },
  },
};

export const Completed: Story = {
  args: {
    currentStatus: "Completed",
  },
  parameters: {
    docs: {
      description: {
        story: "Tow has been successfully completed. No next status available.",
      },
    },
  },
};

