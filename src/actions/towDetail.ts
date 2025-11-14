"use server";

import { db } from "@/db";

export async function updateTowStatus(formData: FormData) {
  const towId = formData.get("towId") as string;
  const newStatus = formData.get("status") as string;

  const row = await db
    .selectFrom("driver_dashboard")
    .select("payload")
    .where("id", "=", towId)
    .executeTakeFirst();

  if (!row) {
    throw new Error(`Tow ${towId} not found`);
  }

  const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

  // Update the current status
  data.route.status = newStatus;

  // Update the statuses array - mark the new status as active and update time
  const statusMap: Record<string, string> = {
    "Waiting": "Waiting",
    "Dispatched": "Dispatched",
    "En Route": "En Route",
    "On Scene": "On Scene",
    "Towing": "Towing",
    "Completed": "Completed",
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (data.route.statuses && Array.isArray(data.route.statuses)) {
    data.route.statuses.forEach((statusEntry: any) => {
      // Mark all statuses before and including the new status as completed
      const statusOrder = ["Waiting", "Dispatched", "En Route", "On Scene", "Towing", "Completed"];
      const currentIndex = statusOrder.indexOf(newStatus);
      const entryIndex = statusOrder.indexOf(statusEntry.label);

      if (entryIndex < currentIndex) {
        statusEntry.status = "completed";
        if (statusEntry.time === "--") {
          statusEntry.time = timeString;
        }
      } else if (statusEntry.label === newStatus) {
        statusEntry.status = "active";
        statusEntry.time = timeString;
      } else {
        statusEntry.status = "waiting";
      }
    });
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

export async function updateStatus(formData: FormData) {
  const towId = formData.get("towId") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Advance the workflow to next status
      const currentActiveIndex = data.route.statuses.findIndex((s: any) => s.status === "active");
      
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
    console.error("[updateStatus] Failed to update status:", error);
  }

}

export async function capturePhoto(formData: FormData) {
  const towId = formData.get("towId") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Mark photo proof checklist item as complete
      const photoProofItem = data.checklist?.find((item: any) => item.id === "photo-proof");
      
      if (photoProofItem) {
        photoProofItem.complete = true;
      }

      // Update next action
      data.nextAction = {
        label: "Photo captured successfully",
        detail: "4-angle documentation complete. Ready for next step.",
      };

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
    console.error("[capturePhoto] Failed to capture photo:", error);
  }

}
