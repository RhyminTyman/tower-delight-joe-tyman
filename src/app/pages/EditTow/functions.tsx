"use server";

import { db } from "@/db";

export async function updateTow(formData: FormData) {
  const towId = formData.get("towId") as string;
  const ticketId = formData.get("ticketId") as string;
  const vehicle = formData.get("vehicle") as string;
  const pickupTitle = formData.get("pickupTitle") as string;
  const pickupAddress = formData.get("pickupAddress") as string;
  const destinationTitle = formData.get("destinationTitle") as string;
  const destinationAddress = formData.get("destinationAddress") as string;
  const poNumber = formData.get("poNumber") as string;
  const dispatcher = formData.get("dispatcher") as string;
  const hasKeys = formData.get("hasKeys") === "on";
  const type = formData.get("type") as string;
  const driverCallsign = formData.get("driverCallsign") as string;
  const truck = formData.get("truck") as string;

  console.log("[updateTow] Starting for towId:", towId);

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log("[updateTow] Row found:", !!row);

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Update dispatch info
      data.dispatch.ticketId = ticketId;
      data.dispatch.vehicle = vehicle;

      // Update route info
      data.route.pickup.title = pickupTitle;
      data.route.pickup.address = pickupAddress;
      data.route.destination.title = destinationTitle;
      data.route.destination.address = destinationAddress;
      data.route.poNumber = poNumber;
      data.route.dispatcher = dispatcher;
      data.route.hasKeys = hasKeys;
      data.route.type = type;
      data.route.driverCallsign = driverCallsign;
      data.route.truck = truck;

      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
      
      console.log("[updateTow] Database update result:", result);
    }
  } catch (error) {
    console.error("[updateTow] Failed to update tow:", error);
  }
}
