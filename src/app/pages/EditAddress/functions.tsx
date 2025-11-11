"use server";

import { db } from "@/db";

export async function updateAddress(formData: FormData) {
  console.log("[updateAddress] ========== SERVER ACTION CALLED ==========");
  
  const towId = formData.get("towId") as string;
  const addressType = formData.get("addressType") as string;
  const title = formData.get("title") as string;
  const address = formData.get("address") as string;
  const distance = formData.get("distance") as string;

  console.log("[updateAddress] Form data:", { towId, addressType, title, address, distance });

  try {
    console.log("[updateAddress] Querying database for towId:", towId);
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log("[updateAddress] Row found:", !!row);

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
      console.log("[updateAddress] Current data:", JSON.stringify(data.route[addressType], null, 2));

      if (addressType === "pickup") {
        data.route.pickup = {
          title,
          address,
          distance,
        };
        console.log("[updateAddress] Updated pickup to:", JSON.stringify(data.route.pickup, null, 2));
      } else if (addressType === "destination") {
        data.route.destination = {
          title,
          address,
          distance,
        };
        console.log("[updateAddress] Updated destination to:", JSON.stringify(data.route.destination, null, 2));
      }

      console.log("[updateAddress] Writing to database...");
      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
      
      console.log("[updateAddress] Database update result:", result);
      console.log("[updateAddress] ========== UPDATE COMPLETE ==========");
    } else {
      console.error("[updateAddress] No row found for towId:", towId);
    }
  } catch (error) {
    console.error("[updateAddress] ERROR:", error);
    throw error;
  }
}
