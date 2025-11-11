"use server";

import { db } from "@/db";

export async function updateStatus(formData: FormData) {
  const towId = formData.get("towId") as string;
  console.log("[updateStatus] Starting for towId:", towId);

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log("[updateStatus] Row found:", !!row);

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
      console.log("[updateStatus] Current status:", data.route.status);

      // Advance the workflow to next status
      const currentActiveIndex = data.route.statuses.findIndex((s: any) => s.status === "active");
      console.log("[updateStatus] Current active index:", currentActiveIndex);
      
      if (currentActiveIndex >= 0 && currentActiveIndex < data.route.statuses.length - 1) {
        // Mark current as completed
        data.route.statuses[currentActiveIndex].status = "completed";
        data.route.statuses[currentActiveIndex].time = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        // Mark next as active
        data.route.statuses[currentActiveIndex + 1].status = "active";
        data.route.statuses[currentActiveIndex + 1].time = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        // Update route status label
        data.route.status = data.route.statuses[currentActiveIndex + 1].label;
        console.log("[updateStatus] New status:", data.route.status);
      }

      // Save back to database
      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
      
      console.log("[updateStatus] Database update result:", result);
    }
  } catch (error) {
    console.error("[updateStatus] Failed to update status:", error);
  }

}

export async function capturePhoto(formData: FormData) {
  const towId = formData.get("towId") as string;
  console.log("[capturePhoto] Starting for towId:", towId);

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log("[capturePhoto] Row found:", !!row);

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Mark photo proof checklist item as complete
      const photoProofItem = data.checklist?.find((item: any) => item.id === "photo-proof");
      console.log("[capturePhoto] Photo proof item found:", !!photoProofItem);
      
      if (photoProofItem) {
        photoProofItem.complete = true;
        console.log("[capturePhoto] Marked photo proof as complete");
      }

      // Update next action
      data.nextAction = {
        label: "Photo captured successfully",
        detail: "4-angle documentation complete. Ready for next step.",
      };

      // Save back to database
      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
      
      console.log("[capturePhoto] Database update result:", result);
    }
  } catch (error) {
    console.error("[capturePhoto] Failed to capture photo:", error);
  }

}
