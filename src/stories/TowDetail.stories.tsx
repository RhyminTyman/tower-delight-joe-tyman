import type { Meta, StoryObj } from "@storybook/react";
import { TowDetail } from "@/app/pages/TowDetail";

const meta = {
  title: "Screens/DriverOps/TowDetail",
  component: TowDetail,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "night-operations" },
  },
} satisfies Meta<typeof TowDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithToolbar: Story = {
  name: "Tow Detail with Toolbar",
  parameters: {
    docs: {
      description: {
        story:
          "Complete tow detail view with sticky toolbar. Toolbar includes: back button (←), centered tow number (TOW #PRIMARY), and action icons (edit, camera, note). All icons are fully functional with backend integration. Edit icon opens address form, camera captures photos and updates checklist, note adds driver notes to tow record.",
      },
    },
  },
};

