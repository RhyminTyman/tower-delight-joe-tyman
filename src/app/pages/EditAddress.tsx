import type { RequestInfo } from "rwsdk/worker";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { EditAddressForm } from "./EditAddress/EditAddressForm";

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <EditAddressForm
        towId={towId}
        addressType={data.addressType}
        ticketId={data.ticketId}
        title={data.title}
        address={data.address}
        distance={data.distance}
      />
    </div>
  );
};

async function loadAddressData(towId: string, addressType: "pickup" | "destination"): Promise<AddressEditData | null> {
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
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

