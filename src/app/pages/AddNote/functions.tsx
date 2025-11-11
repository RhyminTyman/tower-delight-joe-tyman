"use server";

import { db } from "@/db";

export async function addNote(formData: FormData) {
  const towId = formData.get("towId") as string;
  const noteText = formData.get("note") as string;

  console.log("[addNote] Starting for towId:", towId, "note:", noteText);

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    console.log("[addNote] Row found:", !!row);

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Add a note to the route
      if (!data.route.notes) {
        data.route.notes = [];
      }

      data.route.notes.push({
        id: `note-${Date.now()}`,
        timestamp: new Date().toISOString(),
        text: noteText,
        author: data.driver.name,
      });

      // Save back to database
      const result = await db
        .updateTable("driver_dashboard")
        .set({
          payload: JSON.stringify(data),
          updated_at: Math.floor(Date.now() / 1000),
        })
        .where("id", "=", towId)
        .execute();
      
      console.log("[addNote] Database update result:", result);
    }
  } catch (error) {
    console.error("[addNote] Failed to add note:", error);
    throw error;
  }
}
