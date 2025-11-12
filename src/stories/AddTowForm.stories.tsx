import type { Meta, StoryObj } from "@storybook/react";

import { AddTowForm } from "@/app/pages/AddTow/AddTowForm";

// Mock driver options for the form
const mockDriverOptions = [
  { id: "driver-784", name: "Jordan Alvarez" },
  { id: "driver-512", name: "Maria Garcia" },
  { id: "driver-331", name: "James Wilson" },
];

const meta: Meta<typeof AddTowForm> = {
  title: "Forms/AddTowForm",
  component: AddTowForm,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    driverOptions: mockDriverOptions,
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

