"use server";

import { db } from "@/db";

export async function addNote(formData: FormData) {
  const towId = formData.get("towId") as string;
  const noteText = formData.get("note") as string;

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
        text: noteText,
        author: data.driver.name,
      });

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

