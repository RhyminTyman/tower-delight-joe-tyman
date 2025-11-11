"use server";

import { STATIC_DRIVER_DASHBOARD } from "@/app/data/driver-dashboard";
import { db } from "@/db";

type DashboardPayload = typeof STATIC_DRIVER_DASHBOARD;

function cloneDashboard(): DashboardPayload {
  return JSON.parse(JSON.stringify(STATIC_DRIVER_DASHBOARD));
}

async function resolveDriverSnapshot(driverId: string | null) {
  if (!driverId) {
    return {
      driver: STATIC_DRIVER_DASHBOARD.driver,
      driverCallsign: STATIC_DRIVER_DASHBOARD.route.driverCallsign,
      truck: STATIC_DRIVER_DASHBOARD.route.truck,
    };
  }

  const rows = await db.selectFrom("driver_dashboard").select("payload").execute();

  for (const row of rows) {
    if (!row.payload) continue;
    try {
      const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
      if (data?.driver?.id === driverId) {
        return {
          driver: data.driver ?? STATIC_DRIVER_DASHBOARD.driver,
          driverCallsign: data.route?.driverCallsign ?? STATIC_DRIVER_DASHBOARD.route.driverCallsign,
          truck: data.route?.truck ?? STATIC_DRIVER_DASHBOARD.route.truck,
        };
      }
    } catch (error) {
      console.warn("[createTow] Failed to parse driver payload", error);
    }
  }

  return {
    driver: STATIC_DRIVER_DASHBOARD.driver,
    driverCallsign: STATIC_DRIVER_DASHBOARD.route.driverCallsign,
    truck: STATIC_DRIVER_DASHBOARD.route.truck,
  };
}

export async function createTow(formData: FormData) {
  const towId = (formData.get("towId") as string | null)?.trim();
  if (!towId) {
    throw new Error("[createTow] Missing towId");
  }

  const ticketId = (formData.get("ticketId") as string | null)?.trim() ?? "";
  const vehicle = (formData.get("vehicle") as string | null)?.trim() ?? "";
  const driverId = (formData.get("driverId") as string | null)?.trim() ?? null;
  const type = (formData.get("towType") as string | null)?.trim() ?? "Light";
  const etaMinutesRaw = (formData.get("etaMinutes") as string | null)?.trim();
  const pickupTitle = (formData.get("pickupTitle") as string | null)?.trim() ?? "";
  const pickupAddress = (formData.get("pickupAddress") as string | null)?.trim() ?? "";
  const pickupDistance = (formData.get("pickupDistance") as string | null)?.trim() ?? "";
  const destinationTitle = (formData.get("destinationTitle") as string | null)?.trim() ?? "";
  const destinationAddress = (formData.get("destinationAddress") as string | null)?.trim() ?? "";
  const destinationDistance = (formData.get("destinationDistance") as string | null)?.trim() ?? "";

  const etaMinutes = etaMinutesRaw ? Number(etaMinutesRaw) : STATIC_DRIVER_DASHBOARD.dispatch.etaMinutes;

  const { driver, driverCallsign, truck } = await resolveDriverSnapshot(driverId);

  const payload = cloneDashboard();

  payload.driver = driver;
  payload.dispatch = {
    ...payload.dispatch,
    ticketId,
    vehicle,
    etaMinutes: Number.isFinite(etaMinutes) ? etaMinutes : payload.dispatch.etaMinutes,
    location: pickupTitle || payload.dispatch.location,
  };

  payload.route = {
    ...payload.route,
    status: "Waiting",
    statusTone: "waiting",
    pickup: {
      title: pickupTitle || payload.route.pickup.title,
      address: pickupAddress || payload.route.pickup.address,
      distance: pickupDistance || payload.route.pickup.distance,
    },
    destination: {
      title: destinationTitle || payload.route.destination.title,
      address: destinationAddress || payload.route.destination.address,
      distance: destinationDistance || payload.route.destination.distance,
    },
    dispatcher: payload.route.dispatcher,
    hasKeys: false,
    type,
    poNumber: "",
    driverCallsign,
    truck,
    statuses: payload.route.statuses.map((status) => {
      if (status.label === "Waiting") {
        return {
          ...status,
          status: "active",
        };
      }
      return {
        ...status,
        status: "waiting",
        time: "--",
      };
    }),
  };

  const now = Math.floor(Date.now() / 1000);

  await db
    .insertInto("driver_dashboard")
    .values({
      id: towId,
      payload: JSON.stringify(payload),
      updated_at: now,
    })
    .execute();
}


