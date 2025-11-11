"use client";

import { addNote } from "./functions";
import { useCallback, useMemo, useState, type MouseEvent } from "react";

interface AddNoteFormProps {
  towId: string;
  lastSavedNote: string;
}

export function AddNoteForm({ towId, lastSavedNote }: AddNoteFormProps) {
  const [noteText, setNoteText] = useState(lastSavedNote ?? "");
  const [lastSaved, setLastSaved] = useState(lastSavedNote ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    const trimmed = noteText.trim();
    if (trimmed.length === 0) {
      return false;
    }
    return noteText !== (lastSaved ?? "");
  }, [noteText, lastSaved]);

  const handleSubmit = useCallback(async (formData: FormData) => {
    if (!hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);
    try {
      formData.set("note", noteText);
      await addNote(formData);
      setLastSaved(noteText);
    } catch (error) {
      console.error("[AddNoteForm] Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, noteText]);

  const handleCancel = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm("You have unsaved changes. Leave without saving?");
      if (!shouldLeave) {
        return;
      }
    }
    window.location.href = `/tow/${towId}`;
  }, [hasUnsavedChanges, towId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-9 w-9 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Back to tow"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-foreground">Add Note</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <form action={handleSubmit} className="flex flex-col gap-6">
          <input type="hidden" name="towId" value={towId} />

          <div className="flex flex-col gap-2">
            <label htmlFor="note" className="text-sm font-medium text-foreground">
              Note
            </label>
            <textarea
              id="note"
              name="note"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              required
              rows={6}
              className="rounded-none border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter your note here..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-none border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasUnsavedChanges || isSaving}
              className="flex-1 rounded-none bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

