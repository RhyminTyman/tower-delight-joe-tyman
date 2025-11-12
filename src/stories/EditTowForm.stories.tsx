import type { Meta, StoryObj } from "@storybook/react";

import { EditTowForm } from "@/app/pages/EditTow/EditTowForm";
import { DASHBOARD_TEMPLATE } from "@/app/data/driver-dashboard";

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
    initialData: DASHBOARD_TEMPLATE,
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
    initialData: {
      ...DASHBOARD_TEMPLATE,
      route: {
        ...DASHBOARD_TEMPLATE.route,
        pickup: {
          title: "International Convention Center Parking Structure Level 5",
          address: "123 Convention Center Boulevard, Suite 500, Downtown Business District, Los Angeles CA 90015",
          distance: "24.7 mi (42 min)",
        },
        destination: {
          title: "Municipal Impound Lot - South Bay Operations Center",
          address: "9876 Industrial Drive, Building C, Bay Area Storage Facility Complex, Torrance CA 90501",
          distance: "18.3 mi (28 min)",
        },
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

