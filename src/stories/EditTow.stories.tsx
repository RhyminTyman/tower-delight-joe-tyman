import type { Meta, StoryObj } from "@storybook/react";
import { EditTow } from "@/app/pages/EditTow";

const meta = {
  title: "Screens/DriverOps/EditTow",
  component: EditTow,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
} satisfies Meta<typeof EditTow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditAddresses: Story = {
  name: "Edit Tow Addresses",
  parameters: {
    docs: {
      description: {
        story:
          "Form for updating pickup and destination addresses for a tow. Allows drivers to correct or update location details, including location names, street addresses, and distance/ETA information.",
      },
    },
  },
};

