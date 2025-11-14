import type { RequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { EditTowForm } from "@/components";

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
    lat?: number;
    lng?: number;
  };
  destination: {
    title: string;
    address: string;
    distance: string;
    lat?: number;
    lng?: number;
  };
}

export const EditTow = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const data = await loadTowData(towId);
  
  if (!data) {
    return <div>Tow not found</div>;
  }

  return <EditTowForm towId={towId} data={data} />;
};

async function loadTowData(towId: string): Promise<TowEditData | null> {
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
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
