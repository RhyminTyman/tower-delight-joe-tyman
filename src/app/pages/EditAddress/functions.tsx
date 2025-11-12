"use server";

import { db } from "@/db";
import { generateMapUrl } from "@/utils/maps";

export async function updateAddress(formData: FormData) {
  const towId = formData.get("towId") as string;
  const addressType = formData.get("addressType") as string;
  const title = formData.get("title") as string;
  const address = formData.get("address") as string;
  const distance = formData.get("distance") as string;
  const latStr = (formData.get("lat") as string | null)?.trim();
  const lngStr = (formData.get("lng") as string | null)?.trim();

  const row = await db
    .selectFrom("driver_dashboard")
    .select("payload")
    .where("id", "=", towId)
    .executeTakeFirst();

  if (!row) {
    throw new Error(`Tow ${towId} not found`);
  }

  const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

  // Update the address with coordinates if provided
  const updatedAddress: any = { title, address, distance };
  if (latStr && lngStr) {
    updatedAddress.lat = parseFloat(latStr);
    updatedAddress.lng = parseFloat(lngStr);
  }

  if (addressType === "pickup") {
    data.route.pickup = updatedAddress;
  } else if (addressType === "destination") {
    data.route.destination = updatedAddress;
  }

  // Regenerate map URL if both pickup and destination have coordinates
  if (data.route.pickup?.lat && data.route.pickup?.lng && 
      data.route.destination?.lat && data.route.destination?.lng) {
    const mapUrl = generateMapUrl(data.route.pickup, data.route.destination);
    if (mapUrl) {
      data.route.mapUrl = mapUrl;
      data.route.mapImage = mapUrl;
    }
  }

  await db
    .updateTable("driver_dashboard")
    .set({
      payload: JSON.stringify(data),
      updated_at: Math.floor(Date.now() / 1000),
    })
    .where("id", "=", towId)
    .execute();
}
