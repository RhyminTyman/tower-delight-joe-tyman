import type { Meta, StoryObj } from "@storybook/react";

import { EditTowForm } from "@/components";

// Mock tow data for editing
const mockTowData = {
  ticketId: "TD-15001",
  vehicle: "2022 Ford F-150 · Blue · TX 9KP-3821",
  status: "En Route",
  dispatcher: "Kyle Ed",
  hasKeys: false,
  type: "Light",
  poNumber: "PO-123",
  pickup: {
    title: "Kyle's Motors",
    address: "830 South 17th Street, Columbus OH 43206",
    distance: "1241 mi (18 h 4 m)",
    lat: 39.9612,
    lng: -82.9988,
  },
  destination: {
    title: "City Impound Lot",
    address: "830 South 17th Street, Columbus OH 43206",
    distance: "1 ft (1 min)",
    lat: 39.9615,
    lng: -82.9990,
  },
  driverCallsign: "Kyle Ed",
  truck: "Richie",
  etaMinutes: "15",
};

const meta: Meta<typeof EditTowForm> = {
  title: "Forms/EditTowForm",
  component: EditTowForm,
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
  args: {
    towId: "tow-123",
    data: mockTowData,
  },
  parameters: {
    docs: {
      description: {
        story: "Form for editing an existing tow. Pre-populated with current tow data.",
      },
    },
  },
};

export const WithLongAddresses: Story = {
  args: {
    towId: "tow-456",
    data: {
      ...mockTowData,
      pickup: {
        title: "International Convention Center Parking Structure Level 5",
        address: "123 Convention Center Boulevard, Suite 500, Downtown Business District, Los Angeles CA 90015",
        distance: "24.7 mi (42 min)",
        lat: 34.0407,
        lng: -118.2691,
      },
      destination: {
        title: "Municipal Impound Lot - South Bay Operations Center",
        address: "9876 Industrial Drive, Building C, Bay Area Storage Facility Complex, Torrance CA 90501",
        distance: "18.3 mi (28 min)",
        lat: 33.8358,
        lng: -118.3406,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Edit form with very long address names to test text truncation and layout.",
      },
    },
  },
};

