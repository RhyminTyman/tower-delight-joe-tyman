"use client";

import { addNote } from "./functions";
import { useState } from "react";

interface AddNoteFormProps {
  towId: string;
}

export function AddNoteForm({ towId }: AddNoteFormProps) {
  const [noteText, setNoteText] = useState("");

  async function handleSubmit(formData: FormData) {
    await addNote(formData);
    setNoteText(""); // Clear the form after save
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <a
            href={`/tow/${towId}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
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
              onChange={(e) => setNoteText(e.target.value)}
              required
              rows={6}
              className="rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter your note here..."
            />
          </div>

          <div className="flex gap-3">
            <a
              href={`/tow/${towId}`}
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-center font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={noteText.trim().length === 0}
              className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

