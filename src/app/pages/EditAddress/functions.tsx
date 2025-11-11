"use server";

import { db } from "@/db";

console.log("✅ [MODULE LOAD] EditAddress/functions.tsx module loaded at:", new Date().toISOString());
console.log("✅ [MODULE LOAD] updateAddress function defined");

export async function updateAddress(formData: FormData) {
  console.log("🔥 [ENTRY POINT] updateAddress function CALLED at:", new Date().toISOString());
  const timestamp = new Date().toISOString();
  console.log(`[updateAddress ${timestamp}] ========== SERVER ACTION CALLED ==========`);
  console.log(`[updateAddress ${timestamp}] Function invoked at top level`);
  
  const towId = formData.get("towId") as string;
  const addressType = formData.get("addressType") as string;
  const title = formData.get("title") as string;
  const address = formData.get("address") as string;
  const distance = formData.get("distance") as string;

  console.log(`[updateAddress ${timestamp}] Extracted form data:`, { towId, addressType, title, address, distance });
  console.log(`[updateAddress ${timestamp}] towId type: ${typeof towId}, value: "${towId}"`);
  console.log(`[updateAddress ${timestamp}] addressType type: ${typeof addressType}, value: "${addressType}"`);

  try {
    console.log(`[updateAddress ${timestamp}] Starting database query for towId: "${towId}"`);
    console.log(`[updateAddress ${timestamp}] About to call db.selectFrom`);
    
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log(`[updateAddress ${timestamp}] Query executed`);
    console.log(`[updateAddress ${timestamp}] Row found: ${!!row}`);
    console.log(`[updateAddress ${timestamp}] Row type: ${typeof row}`);

    if (row) {
      console.log(`[updateAddress ${timestamp}] Row exists, processing...`);
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
      console.log(`[updateAddress ${timestamp}] Payload type: ${typeof row.payload}`);
      console.log(`[updateAddress ${timestamp}] Current ${addressType}:`, JSON.stringify(data.route[addressType], null, 2));

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

      console.log(`[updateAddress ${timestamp}] About to write to database...`);
      console.log(`[updateAddress ${timestamp}] New ${addressType} value:`, { title, address, distance });
      
      const newUpdatedAt = Math.floor(Date.now() / 1000);
      console.log(`[updateAddress ${timestamp}] Setting updated_at to: ${newUpdatedAt} (${new Date(newUpdatedAt * 1000).toISOString()})`);
      
      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: newUpdatedAt,
        })
        .where("id", "=", towId)
        .execute();
      
      console.log(`[updateAddress ${timestamp}] Database UPDATE executed`);
      console.log(`[updateAddress ${timestamp}] Result:`, JSON.stringify(result, null, 2));
      console.log(`[updateAddress ${timestamp}] ========== UPDATE COMPLETE ==========`);
    } else {
      console.error(`[updateAddress ${timestamp}] ERROR: No row found for towId: "${towId}"`);
      console.error(`[updateAddress ${timestamp}] This means the tow doesn't exist in database`);
    }
  } catch (error) {
    console.error(`[updateAddress ${timestamp}] ========== EXCEPTION CAUGHT ==========`);
    console.error(`[updateAddress ${timestamp}] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`[updateAddress ${timestamp}] Error message:`, error instanceof Error ? error.message : String(error));
    console.error(`[updateAddress ${timestamp}] Stack trace:`, error instanceof Error ? error.stack : 'No stack');
    throw error;
  }

  // After successful update, done
  console.log(`[updateAddress ${timestamp}] ========== ACTION COMPLETE (no errors) ==========`);
  console.log(`[updateAddress ${timestamp}] Function exiting normally`);
}
