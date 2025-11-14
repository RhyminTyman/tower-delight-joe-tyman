import type { RequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { AddNoteForm } from "@/components";

export const AddNote = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const lastSavedNote = await loadLastNoteForTow(towId);

  return <AddNoteForm towId={towId} lastSavedNote={lastSavedNote ?? ""} />;
};

async function loadLastNoteForTow(towId: string): Promise<string | null> {
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (!row) {
      return null;
    }

    const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    const notes = Array.isArray(data?.route?.notes) ? data.route.notes : [];

    if (notes.length === 0) {
      return null;
    }

    const latestNote = notes[notes.length - 1];
    return typeof latestNote?.text === "string" ? latestNote.text : null;
  } catch (error) {
    console.error("[AddNote] Failed to load last note:", error);
    return null;
  }
}

export default AddNote;

