import type { Meta, StoryObj } from "@storybook/react";

import { Button, type ButtonProps } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "Start Capture",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "ghost", "destructive"],
    },
    size: {
      control: { type: "inline-radio" },
      options: ["default", "sm", "lg", "icon"],
    },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Call Dispatch",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "View Checklist",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Cancel Ticket",
  },
};

