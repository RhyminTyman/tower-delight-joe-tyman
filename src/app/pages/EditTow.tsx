import type { RequestInfo } from "rwsdk/worker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TowEditData {
  ticketId: string;
  vehicle: string;
  status: string;
  dispatcher: string;
  hasKeys: boolean;
  type: string;
  poNumber: string;
  pickup: {
    title: string;
    address: string;
    distance: string;
  };
  destination: {
    title: string;
    address: string;
    distance: string;
  };
}

export const EditTow = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const data = await loadTowData(towId);
  
  if (!data) {
    return <div>Tow not found</div>;
  }

  return <EditTowScreen towId={towId} data={data} />;
};

const EditTowScreen = ({ towId, data }: { towId: string; data: TowEditData }) => (
  <div className="relative min-h-screen bg-background">
    <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <a href={`/tow/${towId}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Cancel</span>
        </a>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {data.ticketId}
        </span>
      </div>
    </header>

    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Edit Tow</h1>

      <form action={updateTow} className="flex flex-col gap-6">
        <input type="hidden" name="towId" value={towId} />

        <Card className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
            Tow Information
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="ticketId" className="mb-1.5 block text-xs text-muted-foreground">
                Ticket ID
              </label>
              <input
                type="text"
                id="ticketId"
                name="ticketId"
                defaultValue={data.ticketId}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. APD-2024-1847"
              />
            </div>

            <div>
              <label htmlFor="vehicle" className="mb-1.5 block text-xs text-muted-foreground">
                Vehicle Description
              </label>
              <input
                type="text"
                id="vehicle"
                name="vehicle"
                defaultValue={data.vehicle}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. 2019 Honda Civic · Silver · ABC-1234"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="poNumber" className="mb-1.5 block text-xs text-muted-foreground">
                  PO Number
                </label>
                <input
                  type="text"
                  id="poNumber"
                  name="poNumber"
                  defaultValue={data.poNumber}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. 123"
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-1.5 block text-xs text-muted-foreground">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue={data.type}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dispatcher" className="mb-1.5 block text-xs text-muted-foreground">
                  Dispatcher
                </label>
                <input
                  type="text"
                  id="dispatcher"
                  name="dispatcher"
                  defaultValue={data.dispatcher}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Kyle Ed"
                />
              </div>

              <div>
                <label htmlFor="hasKeys" className="mb-1.5 block text-xs text-muted-foreground">
                  Has Keys
                </label>
                <select
                  id="hasKeys"
                  name="hasKeys"
                  defaultValue={data.hasKeys ? "yes" : "no"}
                  className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
            Pickup Location
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="pickupTitle" className="mb-1.5 block text-xs text-muted-foreground">
                Location Name
              </label>
              <input
                type="text"
                id="pickupTitle"
                name="pickupTitle"
                defaultValue={data.pickup.title}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. Parking Lot A"
              />
            </div>

            <div>
              <label htmlFor="pickupAddress" className="mb-1.5 block text-xs text-muted-foreground">
                Street Address
              </label>
              <textarea
                id="pickupAddress"
                name="pickupAddress"
                defaultValue={data.pickup.address}
                rows={2}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label htmlFor="pickupDistance" className="mb-1.5 block text-xs text-muted-foreground">
                Distance/ETA
              </label>
              <input
                type="text"
                id="pickupDistance"
                name="pickupDistance"
                defaultValue={data.pickup.distance}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. 12 mi (26 m)"
              />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
            Destination
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="destinationTitle" className="mb-1.5 block text-xs text-muted-foreground">
                Location Name
              </label>
              <input
                type="text"
                id="destinationTitle"
                name="destinationTitle"
                defaultValue={data.destination.title}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. City Impound Lot"
              />
            </div>

            <div>
              <label htmlFor="destinationAddress" className="mb-1.5 block text-xs text-muted-foreground">
                Street Address
              </label>
              <textarea
                id="destinationAddress"
                name="destinationAddress"
                defaultValue={data.destination.address}
                rows={2}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label htmlFor="destinationDistance" className="mb-1.5 block text-xs text-muted-foreground">
                Distance/ETA
              </label>
              <input
                type="text"
                id="destinationDistance"
                name="destinationDistance"
                defaultValue={data.destination.distance}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. 8 mi (18 m)"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          Save Changes
        </Button>
      </form>
    </main>
  </div>
);

async function updateTow(formData: FormData) {
  "use server";

  const { db } = await import("@/db");
  
  const towId = formData.get("towId") as string;
  const ticketId = formData.get("ticketId") as string;
  const vehicle = formData.get("vehicle") as string;
  const poNumber = formData.get("poNumber") as string;
  const type = formData.get("type") as string;
  const dispatcher = formData.get("dispatcher") as string;
  const hasKeys = formData.get("hasKeys") === "yes";
  const pickupTitle = formData.get("pickupTitle") as string;
  const pickupAddress = formData.get("pickupAddress") as string;
  const pickupDistance = formData.get("pickupDistance") as string;
  const destinationTitle = formData.get("destinationTitle") as string;
  const destinationAddress = formData.get("destinationAddress") as string;
  const destinationDistance = formData.get("destinationDistance") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = JSON.parse(row.payload);

      // Update tow information
      data.dispatch.ticketId = ticketId;
      data.dispatch.vehicle = vehicle;
      
      // Update route details
      data.route.poNumber = poNumber;
      data.route.type = type;
      data.route.dispatcher = dispatcher;
      data.route.hasKeys = hasKeys;
      
      // Update addresses
      data.route.pickup = {
        title: pickupTitle,
        address: pickupAddress,
        distance: pickupDistance,
      };

      data.route.destination = {
        title: destinationTitle,
        address: destinationAddress,
        distance: destinationDistance,
      };

      // Save back to database
      await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
    }
  } catch (error) {
    console.error("Failed to update tow:", error);
  }
}

async function loadTowData(towId: string): Promise<TowEditData | null> {
  const { db } = await import("@/db");
  
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = JSON.parse(row.payload);
      return {
        ticketId: data.dispatch.ticketId,
        vehicle: data.dispatch.vehicle,
        status: data.route.status,
        dispatcher: data.route.dispatcher,
        hasKeys: data.route.hasKeys,
        type: data.route.type,
        poNumber: data.route.poNumber,
        pickup: data.route.pickup,
        destination: data.route.destination,
      };
    }
  } catch (error) {
    console.error("Failed to load tow data:", error);
  }

  return null;
}

