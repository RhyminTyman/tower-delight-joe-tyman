import type { Meta, StoryObj } from "@storybook/react";

import { Badge, type BadgeProps } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  args: {
    children: "On Call",
  },
  argTypes: {
    variant: {
      control: { type: "inline-radio" },
      options: ["default", "secondary", "accent", "muted", "outline"],
    },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<BadgeProps>;

export const Default: Story = {};

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Priority",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Supervisor",
  },
};

export const Muted: Story = {
  args: {
    variant: "muted",
    children: "2 remaining",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Offline Mode",
  },
};

