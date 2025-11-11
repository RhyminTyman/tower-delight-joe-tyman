"use server";

import { STATIC_DRIVER_DASHBOARD } from "@/app/data/driver-dashboard";
import { db } from "@/db";
import { generateMapUrl, generateRandomCoordinates } from "@/utils/maps";
import { DISPATCHER_ID } from "@/config/constants";

type DashboardPayload = typeof STATIC_DRIVER_DASHBOARD;

function cloneDashboard(): DashboardPayload {
  return JSON.parse(JSON.stringify(STATIC_DRIVER_DASHBOARD));
}

async function getDispatcher() {
  try {
    const dispatcher = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", DISPATCHER_ID)
      .executeTakeFirst();

    if (dispatcher?.payload) {
      const data = typeof dispatcher.payload === "string" 
        ? JSON.parse(dispatcher.payload) 
        : dispatcher.payload;
      return {
        name: data.name || "Dispatch",
        contactNumber: data.contactNumber || "+1 (512) 555-9999",
      };
    }
  } catch (error) {
    console.warn("[createTow] Failed to fetch dispatcher", error);
  }

  // Fallback to default
  return {
    name: "Dispatch",
    contactNumber: "+1 (512) 555-9999",
  };
}

function getDefaultDriverSnapshot() {
  return {
    driver: STATIC_DRIVER_DASHBOARD.driver,
    driverCallsign: STATIC_DRIVER_DASHBOARD.route.driverCallsign,
    truck: STATIC_DRIVER_DASHBOARD.route.truck,
  };
}

async function resolveDriverSnapshot(driverId: string | null) {
  if (!driverId) {
    return getDefaultDriverSnapshot();
  }

  try {
    // Query specific driver directly instead of fetching all rows
    const row = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", driverId)
      .executeTakeFirst();

    if (!row?.payload) {
      console.warn("[resolveDriverSnapshot] Driver not found:", driverId);
      return getDefaultDriverSnapshot();
    }

    const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
    
    return {
      driver: data.driver ?? STATIC_DRIVER_DASHBOARD.driver,
      driverCallsign: data.route?.driverCallsign ?? STATIC_DRIVER_DASHBOARD.route.driverCallsign,
      truck: data.route?.truck ?? STATIC_DRIVER_DASHBOARD.route.truck,
    };
  } catch (error) {
    console.error("[resolveDriverSnapshot] Failed to resolve driver:", error);
    return getDefaultDriverSnapshot();
  }
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
  const poNumber = (formData.get("poNumber") as string | null)?.trim() ?? "";
  const pickupTitle = (formData.get("pickupTitle") as string | null)?.trim() ?? "";
  const pickupAddress = (formData.get("pickupAddress") as string | null)?.trim() ?? "";
  const pickupDistance = (formData.get("pickupDistance") as string | null)?.trim() ?? "";
  const destinationTitle = (formData.get("destinationTitle") as string | null)?.trim() ?? "";
  const destinationAddress = (formData.get("destinationAddress") as string | null)?.trim() ?? "";
  const destinationDistance = (formData.get("destinationDistance") as string | null)?.trim() ?? "";

  const etaMinutes = etaMinutesRaw ? Number(etaMinutesRaw) : STATIC_DRIVER_DASHBOARD.dispatch.etaMinutes;

  const { driver, driverCallsign, truck } = await resolveDriverSnapshot(driverId);
  const dispatcherInfo = await getDispatcher();

  // Use provided GPS coordinates or generate random ones
  const pickupLatStr = (formData.get("pickupLat") as string | null)?.trim();
  const pickupLngStr = (formData.get("pickupLng") as string | null)?.trim();
  const destinationLatStr = (formData.get("destinationLat") as string | null)?.trim();
  const destinationLngStr = (formData.get("destinationLng") as string | null)?.trim();
  
  const pickupCoords = (pickupLatStr && pickupLngStr) 
    ? { lat: parseFloat(pickupLatStr), lng: parseFloat(pickupLngStr) }
    : generateRandomCoordinates();
  const destinationCoords = (destinationLatStr && destinationLngStr)
    ? { lat: parseFloat(destinationLatStr), lng: parseFloat(destinationLngStr) }
    : generateRandomCoordinates();

  const payload = cloneDashboard();

  payload.driver = driver;
  payload.dispatch = {
    ...payload.dispatch,
    ticketId,
    vehicle,
    etaMinutes: Number.isFinite(etaMinutes) ? etaMinutes : payload.dispatch.etaMinutes,
    location: pickupTitle || payload.dispatch.location,
  };

  // Generate map URL with GPS coordinates
  const pickupWithCoords = {
    title: pickupTitle || payload.route.pickup.title,
    address: pickupAddress || payload.route.pickup.address,
    distance: pickupDistance || payload.route.pickup.distance,
    lat: pickupCoords.lat,
    lng: pickupCoords.lng,
  };

  const destinationWithCoords = {
    title: destinationTitle || payload.route.destination.title,
    address: destinationAddress || payload.route.destination.address,
    distance: destinationDistance || payload.route.destination.distance,
    lat: destinationCoords.lat,
    lng: destinationCoords.lng,
  };

  const mapUrl = generateMapUrl(pickupWithCoords, destinationWithCoords);

  // Get current time for the timestamp
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  payload.route = {
    ...payload.route,
    status: "Waiting",
    statusTone: "waiting",
    pickup: pickupWithCoords,
    destination: destinationWithCoords,
    mapUrl: mapUrl,
    mapImage: mapUrl || payload.route.mapImage,
    dispatcher: dispatcherInfo.name,
    hasKeys: false,
    type,
    poNumber: poNumber,
    driverCallsign,
    truck,
    statuses: payload.route.statuses.map((status) => {
      if (status.label === "Waiting") {
        return {
          ...status,
          status: "active",
          time: currentTime,
        };
      }
      return {
        ...status,
        status: "waiting",
        time: "--",
      };
    }),
  };

  // Update driver info with dispatcher contact
  payload.driver = {
    ...payload.driver,
    contactNumber: dispatcherInfo.contactNumber,
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


