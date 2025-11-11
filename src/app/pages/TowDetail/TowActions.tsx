"use client";

interface TowActionsProps {
  towId: string;
  currentStatus: string;
}

export function TowActions({ towId, currentStatus }: TowActionsProps) {
  const handlePhoto = async () => {
    try {
      const response = await fetch(`/api/tow/${towId}/photo`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  };

  return (
    <button
      onClick={handlePhoto}
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
  );
}

interface StatusButtonProps {
  towId: string;
  currentStatus: string;
}

export function StatusButton({ towId, currentStatus }: StatusButtonProps) {
  const handleStatusChange = async () => {
    try {
      const response = await fetch(`/api/tow/${towId}/status`, {
        method: 'POST',
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <button
      onClick={handleStatusChange}
      className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/20"
    >
      {currentStatus}
    </button>
  );
}
