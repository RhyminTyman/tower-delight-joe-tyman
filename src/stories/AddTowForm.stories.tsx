import type { Meta, StoryObj } from "@storybook/react";

import { AddTowForm } from "@/app/pages/AddTow/AddTowForm";

const meta: Meta<typeof AddTowForm> = {
  title: "Forms/AddTowForm",
  component: AddTowForm,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-4">
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
        story: "Form for creating a new tow. Includes fields for ticket ID, vehicle, pickup/destination addresses with Google Maps autocomplete, and other tow details.",
      },
    },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Mobile view of the add tow form with responsive layout.",
      },
    },
  },
};

