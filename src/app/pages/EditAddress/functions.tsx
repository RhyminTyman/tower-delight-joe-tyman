"use server";

import { db } from "@/db";

export async function updateAddress(formData: FormData) {
  const towId = formData.get("towId") as string;
  const addressType = formData.get("addressType") as string;
  const title = formData.get("title") as string;
  const address = formData.get("address") as string;
  const distance = formData.get("distance") as string;

  const row = await db
    .selectFrom("driver_dashboard")
    .select("payload")
    .where("id", "=", towId)
    .executeTakeFirst();

  if (!row) {
    throw new Error(`Tow ${towId} not found`);
  }

  const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

  if (addressType === "pickup") {
    data.route.pickup = { title, address, distance };
  } else if (addressType === "destination") {
    data.route.destination = { title, address, distance };
  }

  await db
    .updateTable("driver_dashboard")
    .set({
      payload: JSON.stringify(data),
      updated_at: Math.floor(Date.now() / 1000),
    })
    .where("id", "=", towId)
    .execute();

  // Use relative path to work in both dev and production
  return new Response(null, {
    status: 303,
    headers: { Location: `/tow/${towId}` }
  });
}
