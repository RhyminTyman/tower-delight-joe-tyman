import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";
import { TowListScreen } from "@/app/pages/TowList/TowListScreen";
import type { TowItem } from "@/types/tow";

// Mock tow data factory
const createTow = (
  id: string,
  ticketId: string,
  driverName: string,
  status: string,
  statusTone: "waiting" | "active" | "completed",
  vehicle: string,
  pickupTitle: string,
  pickupAddress: string,
  destTitle: string,
  destAddress: string,
  etaMinutes?: number
): TowItem => ({
  id,
  ticketId,
  driverName,
  status,
  statusTone,
  vehicle,
  pickup: {
    title: pickupTitle,
    address: pickupAddress,
  },
  destination: {
    title: destTitle,
    address: destAddress,
  },
  etaMinutes,
});

// Sample tow data
const sampleTows: TowItem[] = [
  createTow(
    "tow-001",
    "APD-2024-1847",
    "Jordan Alvarez",
    "En Route",
    "active",
    "2019 Honda Civic · Silver · ABC-1234",
    "Kyle's Motors",
    "830 South 17th Street, Columbus OH 43206",
    "City Impound Lot",
    "1440 Alum Creek Dr, Columbus OH 43209",
    26
  ),
  createTow(
    "tow-002",
    "APD-2024-1852",
    "Sarah Chen",
    "On Scene",
    "active",
    "2021 Ford F-150 · White · XYZ-5678",
    "Walmart Parking Lot",
    "3600 Soldano Blvd, Columbus OH 43228",
    "West Side Impound",
    "2500 McKinley Ave, Columbus OH 43204",
    0
  ),
  createTow(
    "tow-003",
    "APD-2024-1839",
    "Marcus Williams",
    "Towing",
    "completed",
    "2018 Toyota Camry · Black · DEF-9012",
    "Downtown Parking Garage",
    "55 E Spring St, Columbus OH 43215",
    "City Impound Lot",
    "1440 Alum Creek Dr, Columbus OH 43209",
    8
  ),
  createTow(
    "tow-004",
    "APD-2024-1860",
    "Emily Rodriguez",
    "Dispatched",
    "waiting",
    "2020 Jeep Wrangler · Red · GHI-3456",
    "Ohio State Campus",
    "1739 N High St, Columbus OH 43210",
    "North Impound Facility",
    "3232 Morse Rd, Columbus OH 43231",
    32
  ),
  createTow(
    "tow-005",
    "APD-2024-1865",
    "David Thompson",
    "Waiting",
    "waiting",
    "2017 Nissan Altima · Blue · JKL-7890",
    "Easton Town Center",
    "160 Easton Town Center, Columbus OH 43219",
    "East Side Storage",
    "5500 E Livingston Ave, Columbus OH 43232",
    38
  ),
];

const meta = {
  title: "Screens/DriverOps/TowList",
  component: TowListScreen,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TowListScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ActiveTows: Story = {
  name: "Multiple Active Tows",
  args: {
    tows: sampleTows,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default view showing multiple active tows with different statuses (En Route, On Scene, Towing, Dispatched, Waiting). Displays driver name, vehicle info, pickup/destination, status badges, and ETAs.",
      },
    },
  },
};

export const EmptyState: Story = {
  name: "No Active Tows",
  args: {
    tows: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Empty state shown when there are no active tows. Displays a helpful message and a button to create the first tow.",
      },
    },
  },
};

export const SingleTow: Story = {
  name: "Single Active Tow",
  args: {
    tows: [sampleTows[0]],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dashboard with only one active tow. Shows minimal layout with the floating action button for adding more tows.",
      },
    },
  },
};

export const ManyTows: Story = {
  name: "Many Active Tows",
  args: {
    tows: [
      ...sampleTows,
      createTow(
        "tow-006",
        "APD-2024-1870",
        "Alex Johnson",
        "En Route",
        "active",
        "2023 Tesla Model 3 · White · TES-1234",
        "Short North Area",
        "789 N High St, Columbus OH 43215",
        "Downtown Impound",
        "100 E Main St, Columbus OH 43215",
        15
      ),
      createTow(
        "tow-007",
        "APD-2024-1875",
        "Jamie Lee",
        "Dispatched",
        "waiting",
        "2022 BMW X5 · Black · BMW-5678",
        "German Village",
        "588 S 3rd St, Columbus OH 43215",
        "City Impound Lot",
        "1440 Alum Creek Dr, Columbus OH 43209",
        22
      ),
      createTow(
        "tow-008",
        "APD-2024-1880",
        "Chris Martinez",
        "On Scene",
        "active",
        "2019 Chevy Silverado · Gray · CHV-9012",
        "Brewery District",
        "65 Parsons Ave, Columbus OH 43215",
        "South Side Storage",
        "2800 S High St, Columbus OH 43207",
        5
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dashboard showing many active tows to demonstrate scrolling behavior and how the layout handles multiple items.",
      },
    },
  },
};

export const AllCompleted: Story = {
  name: "All Tows Completed",
  args: {
    tows: [
      createTow(
        "tow-009",
        "APD-2024-1885",
        "Jordan Alvarez",
        "Completed",
        "completed",
        "2020 Honda Accord · Blue · HND-1111",
        "North Market",
        "59 Spruce St, Columbus OH 43215",
        "City Impound Lot",
        "1440 Alum Creek Dr, Columbus OH 43209"
      ),
      createTow(
        "tow-010",
        "APD-2024-1890",
        "Sarah Chen",
        "Completed",
        "completed",
        "2021 Mazda CX-5 · Red · MZD-2222",
        "Arena District",
        "200 W Nationwide Blvd, Columbus OH 43215",
        "West Side Impound",
        "2500 McKinley Ave, Columbus OH 43204"
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "View showing only completed tows with completed status badges. Demonstrates how finished jobs are displayed.",
      },
    },
  },
};

export const MixedStatuses: Story = {
  name: "Mixed Status Badges",
  args: {
    tows: [
      createTow(
        "tow-011",
        "APD-2024-1895",
        "Marcus Williams",
        "En Route",
        "active",
        "2022 Subaru Outback · Green · SUB-3333",
        "Clintonville",
        "3000 N High St, Columbus OH 43202",
        "North Impound Facility",
        "3232 Morse Rd, Columbus OH 43231",
        18
      ),
      createTow(
        "tow-012",
        "APD-2024-1900",
        "Emily Rodriguez",
        "Waiting",
        "waiting",
        "2020 Kia Soul · Orange · KIA-4444",
        "Grandview Heights",
        "1234 W 1st Ave, Columbus OH 43212",
        "West Side Impound",
        "2500 McKinley Ave, Columbus OH 43204",
        45
      ),
      createTow(
        "tow-013",
        "APD-2024-1905",
        "David Thompson",
        "Completed",
        "completed",
        "2019 Volkswagen Jetta · Silver · VW-5555",
        "Victorian Village",
        "900 Neil Ave, Columbus OH 43215",
        "City Impound Lot",
        "1440 Alum Creek Dr, Columbus OH 43209"
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates the different status badge variants: active (accent), completed (default), and waiting (muted).",
      },
    },
  },
};

export const NoETA: Story = {
  name: "Tows Without ETA",
  args: {
    tows: [
      createTow(
        "tow-014",
        "APD-2024-1910",
        "Jordan Alvarez",
        "On Scene",
        "active",
        "2021 Hyundai Tucson · White · HYN-6666",
        "Franklinton",
        "400 W Broad St, Columbus OH 43215",
        "South Side Storage",
        "2800 S High St, Columbus OH 43207",
        0
      ),
      createTow(
        "tow-015",
        "APD-2024-1915",
        "Sarah Chen",
        "Waiting",
        "waiting",
        "2020 Nissan Rogue · Blue · NIS-7777",
        "Hilltop",
        "3800 W Broad St, Columbus OH 43228",
        "West Side Impound",
        "2500 McKinley Ave, Columbus OH 43204"
      ),
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows tows without ETA information or with ETA of 0 (on scene). The ETA badge is hidden in these cases.",
      },
    },
  },
};

