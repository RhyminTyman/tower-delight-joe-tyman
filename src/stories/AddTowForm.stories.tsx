import type { Meta, StoryObj } from "@storybook/react";

import { AddTowForm } from "@/app/pages/AddTow/AddTowForm";
import type { DriverOption } from "@/app/pages/TowForm/TowForm";

// Mock driver options for the form
const mockDriverOptions: DriverOption[] = [
  {
    id: "driver-001",
    name: "Jordan Alvarez",
    callSign: "HD-12",
    snapshot: {
      id: "driver-001",
      name: "Jordan Alvarez",
      role: "Heavy Duty Operator",
      shift: "Night",
      truck: "Unit HD-12",
      status: "Available",
      contactNumber: "555-0123",
    },
  },
  {
    id: "driver-512",
    name: "Maria Garcia",
    callSign: "HD-08",
    snapshot: {
      id: "driver-512",
      name: "Maria Garcia",
      role: "Light Duty Operator",
      shift: "Day",
      truck: "Unit LD-08",
      status: "Available",
      contactNumber: "555-0124",
    },
  },
  {
    id: "driver-331",
    name: "James Wilson",
    callSign: "HD-15",
    snapshot: {
      id: "driver-331",
      name: "James Wilson",
      role: "Heavy Duty Operator",
      shift: "Day",
      truck: "Unit HD-15",
      status: "Available",
      contactNumber: "555-0125",
    },
  },
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

