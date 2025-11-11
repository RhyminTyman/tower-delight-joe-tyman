"use server";

import { db } from "@/db";

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
    console.error("Failed to capture photo:", error);
  }
}

export async function addNote(formData: FormData) {
  const towId = formData.get("towId") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Add a note to the route
      if (!data.route.notes) {
        data.route.notes = [];
      }

      data.route.notes.push({
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        text: "Driver note added from toolbar",
        author: data.driver.name,
      });

      // Update next action
      data.nextAction = {
        label: "Note added to tow record",
        detail: "Continue with current workflow step.",
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
    console.error("Failed to add note:", error);
  }
}

