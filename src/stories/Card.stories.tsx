import type { Meta, StoryObj } from "@storybook/react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Tow Details</CardTitle>
        <CardDescription>Information about the current tow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Ticket ID</p>
            <p className="text-sm font-semibold">TD-15001</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vehicle</p>
            <p className="text-sm font-semibold">2022 Ford F-150 · Blue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Basic card with header, description, and content.",
      },
    },
  },
};

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Tow Assignment</CardTitle>
        <CardDescription>Review details before accepting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-semibold">830 South 17th Street, Columbus OH</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-semibold">12.4 mi (18 min)</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="secondary" className="flex-1">Decline</Button>
        <Button className="flex-1">Accept</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Card with action buttons in the footer.",
      },
    },
  },
};

export const RouteDetails: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Route Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Pickup</h4>
            <p className="text-sm font-semibold">Kyle's Motors</p>
            <p className="text-xs text-muted-foreground">830 South 17th Street</p>
            <p className="text-xs text-muted-foreground">12.4 mi (18 min)</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Destination</h4>
            <p className="text-sm font-semibold">City Storage Lot</p>
            <p className="text-xs text-muted-foreground">1440 Snowmelt Ave</p>
            <p className="text-xs text-muted-foreground">3.2 mi (8 min)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Card showing pickup and destination information for a tow route.",
      },
    },
  },
};

