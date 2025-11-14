import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";
import { TowCard } from "@/components";
import type { TowItem } from "@/types/tow";

// Wrapper to provide consistent max-width for card display
const CardWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-md p-4">
    {children}
  </div>
);

const meta = {
  title: "Components/TowCard",
  component: TowCard,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <CardWrapper>
        <Story />
      </CardWrapper>
    ),
  ],
} satisfies Meta<typeof TowCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const baseTow: TowItem = {
  id: "tow-001",
  ticketId: "APD-2024-1847",
  driverName: "Jordan Alvarez",
  status: "En Route",
  statusTone: "active",
  vehicle: "2019 Honda Civic · Silver · ABC-1234",
  pickup: {
    title: "Kyle's Motors",
    address: "830 South 17th Street, Columbus OH 43206",
  },
  destination: {
    title: "City Impound Lot",
    address: "1440 Alum Creek Dr, Columbus OH 43209",
  },
  etaMinutes: 26,
};

export const EnRoute: Story = {
  name: "En Route Status",
  args: {
    tow: baseTow,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tow card showing a driver en route to pickup location with active status badge and ETA display.",
      },
    },
  },
};

export const OnScene: Story = {
  name: "On Scene Status",
  args: {
    tow: {
      ...baseTow,
      id: "tow-002",
      ticketId: "APD-2024-1852",
      driverName: "Sarah Chen",
      status: "On Scene",
      statusTone: "active",
      vehicle: "2021 Ford F-150 · White · XYZ-5678",
      pickup: {
        title: "Walmart Parking Lot",
        address: "3600 Soldano Blvd, Columbus OH 43228",
      },
      destination: {
        title: "West Side Impound",
        address: "2500 McKinley Ave, Columbus OH 43204",
      },
      etaMinutes: 0,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Driver is on scene at pickup location. ETA is 0 so the ETA badge is hidden.",
      },
    },
  },
};

export const Towing: Story = {
  name: "Towing Status",
  args: {
    tow: {
      ...baseTow,
      id: "tow-003",
      ticketId: "APD-2024-1839",
      driverName: "Marcus Williams",
      status: "Towing",
      statusTone: "completed",
      vehicle: "2018 Toyota Camry · Black · DEF-9012",
      pickup: {
        title: "Downtown Parking Garage",
        address: "55 E Spring St, Columbus OH 43215",
      },
      destination: {
        title: "City Impound Lot",
        address: "1440 Alum Creek Dr, Columbus OH 43209",
      },
      etaMinutes: 8,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Vehicle is loaded and being towed to destination. Shows completed badge style with ETA to destination.",
      },
    },
  },
};

export const Dispatched: Story = {
  name: "Dispatched Status",
  args: {
    tow: {
      ...baseTow,
      id: "tow-004",
      ticketId: "APD-2024-1860",
      driverName: "Emily Rodriguez",
      status: "Dispatched",
      statusTone: "waiting",
      vehicle: "2020 Jeep Wrangler · Red · GHI-3456",
      pickup: {
        title: "Ohio State Campus",
        address: "1739 N High St, Columbus OH 43210",
      },
      destination: {
        title: "North Impound Facility",
        address: "3232 Morse Rd, Columbus OH 43231",
      },
      etaMinutes: 32,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tow has been dispatched to driver but they haven't started traveling yet. Shows muted status badge.",
      },
    },
  },
};

export const Waiting: Story = {
  name: "Waiting Status",
  args: {
    tow: {
      ...baseTow,
      id: "tow-005",
      ticketId: "APD-2024-1865",
      driverName: "David Thompson",
      status: "Waiting",
      statusTone: "waiting",
      vehicle: "2017 Nissan Altima · Blue · JKL-7890",
      pickup: {
        title: "Easton Town Center",
        address: "160 Easton Town Center, Columbus OH 43219",
      },
      destination: {
        title: "East Side Storage",
        address: "5500 E Livingston Ave, Columbus OH 43232",
      },
      etaMinutes: 38,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Initial waiting state before dispatch. Shows muted badge and longer ETA.",
      },
    },
  },
};

export const NoETA: Story = {
  name: "Without ETA",
  args: {
    tow: {
      ...baseTow,
      etaMinutes: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Card without ETA information. The ETA badge area is completely hidden.",
      },
    },
  },
};

export const LongAddresses: Story = {
  name: "Long Address Text",
  args: {
    tow: {
      ...baseTow,
      pickup: {
        title: "Very Long Business Name Auto Repair and Collision Center of Columbus",
        address: "12345 North West East South Boulevard, Columbus OH 43206, United States of America",
      },
      destination: {
        title: "Another Really Long Impound Storage Facility Name Here",
        address: "67890 Super Long Street Name That Goes On And On, Columbus OH 43209, United States",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests how the card handles long business names and addresses. Text should wrap appropriately.",
      },
    },
  },
};

export const ShortNames: Story = {
  name: "Minimal Text",
  args: {
    tow: {
      ...baseTow,
      driverName: "Jo",
      vehicle: "Car",
      pickup: {
        title: "A",
        address: "123 St",
      },
      destination: {
        title: "B",
        address: "456 Rd",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests the card layout with minimal text content to ensure proper spacing.",
      },
    },
  },
};

export const Completed: Story = {
  name: "Completed Status",
  args: {
    tow: {
      ...baseTow,
      id: "tow-006",
      status: "Completed",
      statusTone: "completed",
      etaMinutes: undefined,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Completed tow with default badge variant. No ETA is shown for completed tows.",
      },
    },
  },
};

export const HoverState: Story = {
  name: "Interactive States",
  args: {
    tow: baseTow,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Card is clickable and shows hover effects (border accent and shadow). Try hovering over the card to see the interaction.",
      },
    },
  },
};

