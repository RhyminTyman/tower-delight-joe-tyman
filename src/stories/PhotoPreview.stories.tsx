import type { Meta, StoryObj } from "@storybook/react";

import { PhotoPreview } from "@/components";

// Sample base64 encoded 1x1 pixel images for demonstration
const SAMPLE_IMAGES = {
  truck: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%234a5568' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3ETow Truck Photo%3C/text%3E%3C/svg%3E",
  vehicle: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%232d3748' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3EVehicle Photo%3C/text%3E%3C/svg%3E",
  scene: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%231a202c' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3EScene Photo%3C/text%3E%3C/svg%3E",
};

const meta: Meta<typeof PhotoPreview> = {
  title: "Components/PhotoPreview",
  component: PhotoPreview,
  parameters: {
    layout: "padded",
  },
  args: {
    towId: "tow-123",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TruckPhoto: Story = {
  args: {
    imageUrl: SAMPLE_IMAGES.truck,
  },
  parameters: {
    docs: {
      description: {
        story: "Preview of a tow truck photo with delete button overlay.",
      },
    },
  },
};

export const VehiclePhoto: Story = {
  args: {
    imageUrl: SAMPLE_IMAGES.vehicle,
  },
  parameters: {
    docs: {
      description: {
        story: "Preview of a vehicle photo captured on scene.",
      },
    },
  },
};

export const ScenePhoto: Story = {
  args: {
    imageUrl: SAMPLE_IMAGES.scene,
  },
  parameters: {
    docs: {
      description: {
        story: "Preview of a scene photo showing the incident location.",
      },
    },
  },
};

