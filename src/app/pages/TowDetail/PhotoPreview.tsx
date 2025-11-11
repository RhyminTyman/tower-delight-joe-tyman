"use client";

import { useState } from "react";

interface PhotoPreviewProps {
  towId: string;
  imageUrl: string;
}

export function PhotoPreview({ towId, imageUrl }: PhotoPreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const shouldDelete = window.confirm("Remove this photo?");
    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tow/${towId}/photo`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("[PhotoPreview] Failed to delete photo", response.status);
        setIsDeleting(false);
        return;
      }
      window.location.reload();
    } catch (error) {
      console.error("[PhotoPreview] Error deleting photo:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Tow photo"
        className="h-72 w-full object-cover"
      />
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white transition hover:bg-black/80 disabled:opacity-50"
      >
        {isDeleting ? "Removing…" : "✕"}
      </button>
    </div>
  );
}


