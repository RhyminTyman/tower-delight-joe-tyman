"use server";

import { db } from "@/db";

export async function updateAddress(formData: FormData) {
  const towId = formData.get("towId") as string;
  const addressType = formData.get("addressType") as string;
  const title = formData.get("title") as string;
  const address = formData.get("address") as string;
  const distance = formData.get("distance") as string;

  console.log("[updateAddress] Starting:", { towId, addressType, title, address, distance });

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log("[updateAddress] Row found:", !!row);

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      if (addressType === "pickup") {
        data.route.pickup = {
          title,
          address,
          distance,
        };
        console.log("[updateAddress] Updated pickup");
      } else if (addressType === "destination") {
        data.route.destination = {
          title,
          address,
          distance,
        };
        console.log("[updateAddress] Updated destination");
      }

      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
      
      console.log("[updateAddress] Database update result:", result);
    }
  } catch (error) {
    console.error("[updateAddress] Failed to update address:", error);
    return;
  }

  // Return a redirect response
  return Response.redirect(`/tow/${towId}`, 303);
}
