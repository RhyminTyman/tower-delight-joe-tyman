import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";

import type { DriverDashboardData } from "@/app/data/driver-dashboard";

// Mock the TowDetail page component for Storybook
// We need to simulate what the actual page renders
const TowDetailStory = ({ data, towId }: { data: DriverDashboardData; towId: string }) => {
  const { driver, dispatch, route } = data;

  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <a
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            title="Back to all tows"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-foreground">TOW #{towId.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`/tow/${towId}/edit`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Edit tow"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </a>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="More actions"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <a
              href={`/tow/${towId}/note`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Add note"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div className={`sticky top-[57px] z-20 border-b px-4 py-4 ${getStatusColor(route.status)}`}>
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <h1 className="text-lg font-bold uppercase tracking-wide text-white">
            {route.status}
          </h1>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-4 sm:max-w-lg">
        {/* Vehicle Info Card */}
        <div className="border-x border-t border-border/60 bg-secondary/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Vehicle</p>
          <p className="text-base font-semibold text-foreground">{dispatch.vehicle}</p>
        </div>

        {/* Route Map Card */}
        <div className="border border-border/60 bg-secondary/40">
          <details className="group" open>
            <summary className="cursor-pointer border-b border-border/60 px-4 py-2 bg-card/50 list-none">
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Route Map</h2>
              </div>
            </summary>

            {/* Map Image */}
            {(route.mapUrl || route.mapImage) && (
              <div className="overflow-hidden bg-slate-900">
                <img
                  src={route.mapUrl || route.mapImage}
                  alt="Route map showing pickup and destination"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Pickup and Destination Details */}
            <div className="border-t border-border/60 p-4 text-foreground">
              <div className="bg-card/50 p-3">
                {/* Pickup Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Pickup</p>
                      <a
                        href={`/tow/${towId}/address/pickup`}
                        className="rounded p-1 transition-colors hover:bg-muted"
                        title="Edit pickup"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{route.pickup.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {route.pickup.address}
                    </p>
                    {route.pickup.distance && (
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {route.pickup.distance}
                      </p>
                    )}
                    {route.pickup.lat && route.pickup.lng && (
                      <div className="mt-2">
                        <a
                          href={`https://maps.google.com/?q=${route.pickup.lat},${route.pickup.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20 active:bg-blue-500/30"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Navigate to Pickup
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-3 h-px bg-border" />

                {/* Destination Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Destination</p>
                      <a
                        href={`/tow/${towId}/address/destination`}
                        className="rounded p-1 transition-colors hover:bg-muted"
                        title="Edit destination"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{route.destination.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {route.destination.address}
                    </p>
                    {route.destination.distance && (
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        {route.destination.distance}
                      </p>
                    )}
                    {route.destination.lat && route.destination.lng && (
                      <div className="mt-2">
                        <a
                          href={`https://maps.google.com/?q=${route.destination.lat},${route.destination.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 active:bg-emerald-500/30"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Navigate to Destination
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Open in Maps Button */}
              {route.pickup.lat && route.pickup.lng && route.destination.lat && route.destination.lng && (
                <div className="mt-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${route.pickup.lat},${route.pickup.lng}&destination=${route.destination.lat},${route.destination.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 text-base font-semibold text-accent-foreground transition-colors hover:bg-accent/90 active:bg-accent/80"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Open Route in Maps
                  </a>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Vehicle Photo Card - Collapsible */}
        {route.lastPhoto && hasPhoto(route.lastPhoto.dataUrl) && (
          <div className="border border-border/60 bg-secondary/40">
            <details className="group">
              <summary className="cursor-pointer border-b border-border/60 px-4 py-2 bg-card/50 list-none">
                <div className="flex items-center gap-3">
                  <svg className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Vehicle Photo</h2>
                </div>
              </summary>
              <div className="overflow-hidden">
                <div className="relative aspect-video w-full bg-slate-900">
                  <img
                    src={route.lastPhoto.dataUrl}
                    alt="Vehicle"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Route Detail Card */}
        <div className="border border-border/60 bg-secondary/40 flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">PO #</p>
              <p className="text-base font-semibold text-foreground">{route.poNumber}</p>
            </div>
            <button className="px-5 py-2 text-sm rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Call Dispatch
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm text-foreground">
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dispatcher</dt>
              <dd className="font-medium">{route.dispatcher}</dd>
            </div>
            <div className="space-y-1 text-right">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Has Keys</dt>
              <dd className="font-medium">{route.hasKeys ? "Yes" : "No"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Type</dt>
              <dd className="font-medium">{route.type}</dd>
            </div>
            <div className="space-y-1 text-right">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Driver</dt>
              <dd className="font-medium">{route.driverCallsign}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Truck</dt>
              <dd className="font-medium">{route.truck}</dd>
            </div>
          </dl>
        </div>

        {/* Status Timeline */}
        <div className="border border-border/60 bg-secondary/40 p-4">
          <h2 className="text-sm font-semibold text-foreground">Statuses</h2>
          <div className="mt-4 flex flex-col gap-4">
            {route.statuses.map((status, index) => {
              const indicatorClasses =
                status.status === "completed" ? "bg-emerald-500 border-emerald-400" :
                status.status === "active" ? "bg-amber-400 border-amber-300 animate-pulse" :
                "bg-muted border-border";

              return (
                <div className="flex items-start gap-3" key={status.label}>
                  <div className="flex flex-col items-center">
                    <span className={`h-3.5 w-3.5 rounded-full border ${indicatorClasses}`} />
                    {index < route.statuses.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{status.label}</p>
                    <p className="text-xs text-muted-foreground">{status.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

function hasPhoto(image?: string | null): boolean {
  if (!image) {
    return false;
  }
  const trimmed = image.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return trimmed.startsWith("data:") || trimmed.startsWith("http");
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower === "completed") return "bg-emerald-600";
  if (statusLower === "towing") return "bg-blue-600";
  if (statusLower === "on scene") return "bg-purple-600";
  if (statusLower === "en route") return "bg-amber-600";
  if (statusLower === "dispatched") return "bg-orange-600";
  return "bg-slate-600"; // waiting
}

// Mock data matching NYC locations from actual app
const createMockData = (status: string, statusTone: "waiting" | "active" | "completed"): DriverDashboardData => ({
  driver: {
    id: "driver-1",
    name: "Jordan Alvarez",
    role: "Heavy Duty Operator",
    shift: "Night",
    truck: "Unit HD-12",
    status: status,
    contactNumber: "555-0123",
  },
  dispatch: {
    ticketId: "TD-15001",
    etaMinutes: 12,
    location: "1275 York Ave, New York, NY",
    vehicle: "2022 Ford Bronco",
    customer: "Bob Autoplace",
  },
  workflow: [],
  actions: [],
  checklist: [],
  impoundPreparation: [],
  nextAction: {
    label: "Arrive at pickup location",
    detail: "Contact customer upon arrival",
  },
  route: {
    status,
    statusTone,
    mapImage: "",
    mapUrl: `https://maps.googleapis.com/maps/api/staticmap?size=600x400&markers=color:green%7Clabel:B%7C40.7649,-73.9567&markers=color:red%7Clabel:A%7C40.7678,-73.9543&path=color:0x4285F4%7Cweight:3%7C40.7649,-73.9567%7C40.7678,-73.9543&key=AIzaSyAYGV_tW6Af3_mW8NQqLOvzfN7Xd3kBkXU`,
    updateCta: "Mark En Route",
    pickup: {
      title: "Bob Autoplace",
      address: "1275 York Ave, New York, NY 10065, USA",
      distance: "3.3 mi (16 mins)",
      lat: 40.7678,
      lng: -73.9543,
    },
    destination: {
      title: "Destination",
      address: "830 South 17th Street, Columbus OH 43206",
      distance: "1 ft (1 min)",
      lat: 40.7649,
      lng: -73.9567,
    },
    dispatcher: "Sarah Chen",
    hasKeys: false,
    type: "Private Property",
    poNumber: "PO-2024-1127",
    driverCallsign: "HD-12",
    truck: "Peterbilt 567",
    statuses: [
      { label: "Waiting", time: "10:55 AM", status: "completed" },
      { label: "Dispatched", time: "10:56 AM", status: "completed" },
      { label: "En Route", time: "11:05 AM", status: status === "En Route" ? "active" : status === "Waiting" || status === "Dispatched" ? "waiting" : "completed" },
      { label: "On Scene", time: status === "On Scene" || status === "Towing" || status === "Completed" ? "11:20 AM" : "--", status: status === "On Scene" ? "active" : status === "Towing" || status === "Completed" ? "completed" : "waiting" },
      { label: "Towing", time: status === "Towing" || status === "Completed" ? "11:35 AM" : "--", status: status === "Towing" ? "active" : status === "Completed" ? "completed" : "waiting" },
      { label: "Completed", time: status === "Completed" ? "11:50 AM" : "--", status: status === "Completed" ? "completed" : "waiting" },
    ],
    lastPhoto: status === "On Scene" || status === "Towing" || status === "Completed" ? {
      dataUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop",
      timestamp: "11:22 AM",
    } : undefined,
  },
});

const meta = {
  title: "Screens/DriverOps/TowDetail",
  component: TowDetailStory,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TowDetailStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Waiting: Story = {
  name: "Waiting - Initial State",
  args: {
    towId: "tow-1762923325608",
    data: createMockData("Waiting", "waiting"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Initial state when a tow request is created but not yet dispatched to a driver.",
      },
    },
  },
};

export const Dispatched: Story = {
  name: "Dispatched - Assigned to Driver",
  args: {
    towId: "tow-1762923325608",
    data: createMockData("Dispatched", "active"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tow has been assigned to a driver but they haven't started traveling yet.",
      },
    },
  },
};

export const EnRoute: Story = {
  name: "En Route - Traveling to Pickup",
  args: {
    towId: "tow-1762923325608",
    data: createMockData("En Route", "active"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Driver is actively traveling to the pickup location. Shows distance and ETA to pickup.",
      },
    },
  },
};

export const OnScene: Story = {
  name: "On Scene - At Pickup Location",
  args: {
    towId: "tow-1762923325608",
    data: createMockData("On Scene", "active"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Driver has arrived at the pickup location and is preparing to load the vehicle. Vehicle photo is now visible.",
      },
    },
  },
};

export const Towing: Story = {
  name: "Towing - Vehicle Loaded",
  args: {
    towId: "tow-1762923325608",
    data: createMockData("Towing", "active"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Vehicle has been loaded and driver is now traveling to the destination.",
      },
    },
  },
};

export const Completed: Story = {
  name: "Completed - Tow Finished",
  args: {
    towId: "tow-1762923325608",
    data: createMockData("Completed", "completed"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tow has been completed. All statuses are marked complete and the job is finished.",
      },
    },
  },
};

