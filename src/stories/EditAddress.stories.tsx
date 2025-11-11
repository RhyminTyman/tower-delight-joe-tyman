import type { Meta, StoryObj } from "@storybook/react";
import { EditAddress } from "@/app/pages/EditAddress";

const meta = {
  title: "Screens/DriverOps/EditAddress",
  component: EditAddress,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
} satisfies Meta<typeof EditAddress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditPickup: Story = {
  name: "Edit Pickup Address",
  parameters: {
    docs: {
      description: {
        story:
          "Quick edit form for updating just the pickup location. Accessed by clicking the edit icon next to 'Pickup' in the route map card. Includes location name, street address, and distance/ETA fields.",
      },
    },
  },
};

export const EditDestination: Story = {
  name: "Edit Destination Address",
  parameters: {
    docs: {
      description: {
        story:
          "Quick edit form for updating just the destination. Accessed by clicking the edit icon next to 'Destination' in the route map card. Streamlined interface for fast address corrections.",
      },
    },
  },
};

