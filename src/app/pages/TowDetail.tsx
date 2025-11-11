import type { RequestInfo } from "rwsdk/worker";
import { DriverDashboard } from "@/app/components/DriverDashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { parseDashboardRow } from "@/app/data/driver-dashboard";

// Server Actions
async function capturePhoto(formData: FormData) {
  "use server";

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

async function addNote(formData: FormData) {
  "use server";

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

async function updateStatus(formData: FormData) {
  "use server";

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
    console.error("Failed to update status:", error);
  }
}

async function startCapture(formData: FormData) {
  "use server";

  const towId = formData.get("towId") as string;

  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Mark VIN scan checklist item as complete
      const vinScanItem = data.checklist?.find((item: any) => item.id === "vin-scan");
      if (vinScanItem) {
        vinScanItem.complete = true;
      }

      // Mark photo proof checklist item as complete
      const photoProofItem = data.checklist?.find((item: any) => item.id === "photo-proof");
      if (photoProofItem) {
        photoProofItem.complete = true;
      }

      // Update next action
      data.nextAction = {
        label: "Review captured evidence",
        detail: "VIN and photos captured. Ready for impound intake.",
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
    console.error("Failed to start capture:", error);
  }
}

export const TowDetail = async (requestInfo: RequestInfo) => {
  const towId = requestInfo.params.id;
  const data = await loadTowDetail(towId);

  if (!data) {
    return <div>Tow not found</div>;
  }

  async function capturePhotoAction(formData: FormData) {
    "use server";
    await capturePhoto(formData);
  }

  async function addNoteAction(formData: FormData) {
    "use server";
    await addNote(formData);
  }

  async function updateStatusAction(formData: FormData) {
    "use server";
    await updateStatus(formData);
  }

  async function startCaptureAction(formData: FormData) {
    "use server";
    await startCapture(formData);
  }

  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <a
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            title="Back to all tows"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>

          <div className="flex-1 text-center">
            <span className="text-sm font-semibold text-foreground">TOW #{towId.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={`/tow/${towId}/edit`}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Edit tow"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </a>

            <form action={capturePhotoAction}>
              <input type="hidden" name="towId" value={towId} />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                title="Take photo"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </form>

            <form action={addNoteAction}>
              <input type="hidden" name="towId" value={towId} />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                title="Add note"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>
      <DriverDashboard {...data} towId={towId} updateStatus={updateStatusAction} startCapture={startCaptureAction} />
    </div>
  );
};

async function loadTowDetail(towId: string) {
  try {
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", towId)
      .executeTakeFirst();

    if (row) {
      return parseDashboardRow(row);
    }
  } catch (error) {
    console.error("Failed to load tow detail:", error);
  }

  return null;
}

