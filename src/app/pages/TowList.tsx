import type { RequestInfo } from "rwsdk/worker";
import { db } from "@/db";
import { TowListScreen } from "./TowList/TowListScreen";
import type { TowItem } from "@/types/tow";

export const TowList = async (requestInfo: RequestInfo) => {
  const tows = await loadTowList();
  
  return <TowListScreen tows={tows} />;
};

async function loadTowList(): Promise<TowItem[]> {
  try {
    const rows = await db
      .selectFrom("driver_dashboard")
      .select(["id", "payload"])
      .execute();
    
    const tows = rows
      .filter(row => row.payload && row.id.startsWith("tow-"))
      .map((row) => {
      try {
        const data = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
        return {
          id: row.id,
          ticketId: data?.dispatch?.ticketId || '',
          driverName: data?.driver?.name || 'Unknown Driver',
          status: data?.route?.status || '',
          statusTone: (data?.route?.statusTone || 'waiting') as "waiting" | "active" | "completed",
          vehicle: data?.dispatch?.vehicle || '',
          pickup: {
            title: data?.route?.pickup?.title || '',
            address: data?.route?.pickup?.address || '',
          },
          destination: {
            title: data?.route?.destination?.title || '',
            address: data?.route?.destination?.address || '',
          },
          etaMinutes: data?.dispatch?.etaMinutes,
        };
      } catch (err) {
        console.error("[TowList] Error parsing row:", row.id, err);
        throw err;
      }
    });
    
    // Sort by ID descending (newest first, since IDs are tow-{timestamp})
    tows.sort((a, b) => b.id.localeCompare(a.id));
    
    return tows;
  } catch (error) {
    console.error("[TowList] Failed to load tow list:", error);
    return [];
  }
}

