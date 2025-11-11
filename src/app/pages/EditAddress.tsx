import type { RequestInfo } from "rwsdk/worker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AddressEditData {
  ticketId: string;
  addressType: "pickup" | "destination";
  title: string;
  address: string;
  distance: string;
}

export const EditAddress = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const addressType = requestInfo.params.type as "pickup" | "destination";
  const data = await loadAddressData(towId, addressType);
  
  if (!data) {
    return <div>Address not found</div>;
  }

  return <EditAddressScreen towId={towId} data={data} />;
};

const EditAddressScreen = ({ towId, data }: { towId: string; data: AddressEditData }) => (
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
      <h1 className="mb-2 text-xl font-semibold text-foreground">
        Edit {data.addressType === "pickup" ? "Pickup" : "Destination"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Update the {data.addressType} location details
      </p>

      <form action={updateAddress} className="flex flex-col gap-6">
        <input type="hidden" name="towId" value={towId} />
        <input type="hidden" name="addressType" value={data.addressType} />

        <Card className="glass-card p-5">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-xs text-muted-foreground">
                Location Name
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={data.title}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. Kyle's Motors"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-1.5 block text-xs text-muted-foreground">
                Street Address
              </label>
              <textarea
                id="address"
                name="address"
                defaultValue={data.address}
                rows={2}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label htmlFor="distance" className="mb-1.5 block text-xs text-muted-foreground">
                Distance/ETA
              </label>
              <input
                type="text"
                id="distance"
                name="distance"
                defaultValue={data.distance}
                className="w-full rounded-lg border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="e.g. 12 mi (26 m)"
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

async function updateAddress(formData: FormData) {
  "use server";

  const { db } = await import("@/db");
  
  const towId = formData.get("towId") as string;
  const addressType = formData.get("addressType") as "pickup" | "destination";
  const title = formData.get("title") as string;
  const address = formData.get("address") as string;
  const distance = formData.get("distance") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = JSON.parse(row.payload);

      // Update the specific address
      if (addressType === "pickup") {
        data.route.pickup = {
          title,
          address,
          distance,
        };
      } else {
        data.route.destination = {
          title,
          address,
          distance,
        };
      }

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
    console.error("Failed to update address:", error);
  }
}

async function loadAddressData(towId: string, addressType: "pickup" | "destination"): Promise<AddressEditData | null> {
  const { db } = await import("@/db");
  
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = JSON.parse(row.payload);
      const addressData = addressType === "pickup" ? data.route.pickup : data.route.destination;
      
      return {
        ticketId: data.dispatch.ticketId,
        addressType,
        title: addressData.title,
        address: addressData.address,
        distance: addressData.distance || "",
      };
    }
  } catch (error) {
    console.error("Failed to load address data:", error);
  }

  return null;
}

