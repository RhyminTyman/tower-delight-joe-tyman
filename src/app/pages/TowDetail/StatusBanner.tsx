"use client";

import { useState } from "react";
import { updateTowStatus } from "./functions";
import { useOptimisticUpdate } from "@/hooks/useOptimisticUpdate";

interface StatusBannerProps {
  towId: string;
  currentStatus: string;
}

const STATUS_CONFIG = {
  "Waiting": { color: "bg-slate-600", next: "Dispatched" },
  "Dispatched": { color: "bg-blue-600", next: "En Route" },
  "En Route": { color: "bg-green-500", next: "On Scene" },
  "On Scene": { color: "bg-amber-500", next: "Towing" },
  "Towing": { color: "bg-purple-600", next: null },
} as const;

const ALL_STATUSES = ["Waiting", "Dispatched", "En Route", "On Scene", "Towing"];

export function StatusBanner({ towId, currentStatus }: StatusBannerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Optimistic update for status
  const { 
    value: displayStatus, 
    isUpdating, 
    error: updateError,
    update: updateStatus 
  } = useOptimisticUpdate(currentStatus, {
    onSuccess: () => {
      // Reload page to get fresh data after successful update
      window.location.reload();
    },
    onError: (error) => {
      // Error is logged by the hook, status reverted automatically
      alert(`Failed to update status: ${error.message}`);
    }
  });

  const config = STATUS_CONFIG[displayStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["Waiting"];
  const nextStatus = config.next;

  async function handleStatusChange(newStatus: string) {
    setIsDropdownOpen(false);
    
    await updateStatus(newStatus, async (status) => {
      const formData = new FormData();
      formData.append("towId", towId);
      formData.append("status", status);
      await updateTowStatus(formData);
    });
  }

  async function handleNextStatus() {
    if (nextStatus) {
      await handleStatusChange(nextStatus);
    }
  }

  return (
    <div className={`sticky top-0 z-50 ${config.color} px-4 py-3`}>
      <div className="mx-auto flex max-w-md items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-lg font-bold text-white uppercase tracking-wide">{displayStatus}</p>
        </div>
        
        <div className="relative flex items-stretch">
          {nextStatus && (
            <button
              onClick={handleNextStatus}
              disabled={isUpdating}
              type="button"
              title={`Advance to ${nextStatus}`}
              className="bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30 disabled:opacity-50 border-r border-white/20"
            >
              {isUpdating ? "Updating..." : `→ ${nextStatus}`}
            </button>
          )}
          
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isUpdating}
            type="button"
            title="Change status"
            className={`${nextStatus ? '' : ''} bg-white/20 p-2 text-white transition-colors hover:bg-white/30 disabled:opacity-50 aspect-square flex items-center justify-center`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-slate-800 shadow-xl border border-slate-700">
                {ALL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={status === currentStatus}
                    type="button"
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                      status === currentStatus
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "text-white hover:bg-slate-700"
                    }`}
                  >
                    {status}
                    {status === currentStatus && (
                      <span className="ml-2 text-xs text-slate-400">(current)</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

