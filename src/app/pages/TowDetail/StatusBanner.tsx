"use client";

import { useState } from "react";
import { updateTowStatus } from "./functions";

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
  const [isUpdating, setIsUpdating] = useState(false);

  const config = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG["Waiting"];
  const nextStatus = config.next;

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);
    setIsDropdownOpen(false);
    
    try {
      const formData = new FormData();
      formData.append("towId", towId);
      formData.append("status", newStatus);
      await updateTowStatus(formData);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
      setIsUpdating(false);
    }
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
          <p className="text-lg font-bold text-white uppercase tracking-wide">{currentStatus}</p>
        </div>
        
        <div className="relative flex items-stretch">
          {nextStatus && (
            <button
              onClick={handleNextStatus}
              disabled={isUpdating}
              type="button"
              title={`Advance to ${nextStatus}`}
              className="rounded-l-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30 disabled:opacity-50 border-r border-white/20"
            >
              {isUpdating ? "Updating..." : `→ ${nextStatus}`}
            </button>
          )}
          
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isUpdating}
            type="button"
            title="Change status"
            className={`${nextStatus ? 'rounded-r-lg' : 'rounded-lg'} bg-white/20 px-3 py-2 text-white transition-colors hover:bg-white/30 disabled:opacity-50`}
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
              <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg bg-slate-800 shadow-xl border border-slate-700">
                {ALL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={status === currentStatus}
                    type="button"
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
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

