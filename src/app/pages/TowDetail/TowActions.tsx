"use client";

import { useRef, useState, type ChangeEvent } from "react";

interface TowActionsProps {
  towId: string;
  currentStatus: string;
}

export function TowActions({ towId, currentStatus }: TowActionsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await readFileAsDataURL(file);

      const formData = new FormData();
      formData.append("photoData", base64);
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type || "image/jpeg");

      const response = await fetch(`/api/tow/${towId}/photo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("[TowActions] API returned error:", response.status);
        setIsUploading(false);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("[TowActions] Failed to upload photo:", error);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={handlePhotoClick}
        disabled={isUploading}
        className="flex h-9 w-9 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground disabled:opacity-50"
        title="Capture photo"
      >
        {isUploading ? (
          <svg className="h-5 w-5 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

