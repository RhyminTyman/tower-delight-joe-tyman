import type { Meta, StoryObj } from "@storybook/react";

import { TowActions } from "@/app/pages/TowDetail/TowActions";

const meta: Meta<typeof TowActions> = {
  title: "Components/TowActions",
  component: TowActions,
  parameters: {
    layout: "centered",
    backgrounds: { default: "dark" },
  },
  args: {
    towId: "tow-123",
    currentStatus: "On Scene",
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8 bg-slate-900">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Photo capture button for the tow detail page. Shows camera icon by default.",
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
        story: "Photo capture action when driver is on scene.",
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
        story: "Photo capture action when vehicle is being towed.",
      },
    },
  },
};

