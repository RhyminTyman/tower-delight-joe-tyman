"use server";

import { DASHBOARD_TEMPLATE, type DriverDashboardData } from "@/app/data/driver-dashboard";
import { db } from "@/db";
import { generateMapUrl } from "@/utils/maps";
import { DISPATCHER_ID } from "@/config/constants";

function cloneDashboard(): DriverDashboardData {
  return JSON.parse(JSON.stringify(DASHBOARD_TEMPLATE));
}

async function getDispatcher() {
  const dispatcher = await db
    .selectFrom("driver_dashboard")
    .select("payload")
    .where("id", "=", DISPATCHER_ID)
    .executeTakeFirst();

  if (!dispatcher?.payload) {
    throw new Error("Dispatcher not found. Please seed the dispatcher first by visiting /api/seed/dispatcher");
  }

  const data = typeof dispatcher.payload === "string" 
    ? JSON.parse(dispatcher.payload) 
    : dispatcher.payload;
  
  if (!data.name || !data.contactNumber) {
    throw new Error("Dispatcher data is incomplete");
  }

  return {
    name: data.name,
    contactNumber: data.contactNumber,
  };
}

async function resolveDriverSnapshot(driverId: string | null) {
  if (!driverId) {
    throw new Error("Driver ID is required. Please select a driver.");
  }

  // Query specific driver directly instead of fetching all rows
  const row = await db
    .selectFrom("driver_dashboard")
    .select("payload")
    .where("id", "=", driverId)
    .executeTakeFirst();

  if (!row?.payload) {
    throw new Error(`Driver ${driverId} not found. Please seed drivers first by visiting /api/seed/drivers`);
  }

  const data = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
  
  if (!data.driver || !data.route?.driverCallsign || !data.route?.truck) {
    throw new Error(`Driver ${driverId} data is incomplete`);
  }

  return {
    driver: data.driver,
    driverCallsign: data.route.driverCallsign,
    truck: data.route.truck,
  };
}

export async function createTow(formData: FormData) {
  const towId = (formData.get("towId") as string | null)?.trim();
  if (!towId) {
    throw new Error("[createTow] Missing towId");
  }

  const ticketId = (formData.get("ticketId") as string | null)?.trim();
  if (!ticketId) {
    throw new Error("Ticket ID is required");
  }
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
  const hasKeys = formData.get("hasKeys") === "yes";

  const etaMinutes = etaMinutesRaw ? Number(etaMinutesRaw) : 0;

  const { driver, driverCallsign, truck } = await resolveDriverSnapshot(driverId);
  const dispatcherInfo = await getDispatcher();

  // Use provided GPS coordinates (no fallback to random coordinates)
  const pickupLatStr = (formData.get("pickupLat") as string | null)?.trim();
  const pickupLngStr = (formData.get("pickupLng") as string | null)?.trim();
  const destinationLatStr = (formData.get("destinationLat") as string | null)?.trim();
  const destinationLngStr = (formData.get("destinationLng") as string | null)?.trim();
  
  const pickupCoords = (pickupLatStr && pickupLngStr) 
    ? { lat: parseFloat(pickupLatStr), lng: parseFloat(pickupLngStr) }
    : null;
  const destinationCoords = (destinationLatStr && destinationLngStr)
    ? { lat: parseFloat(destinationLatStr), lng: parseFloat(destinationLngStr) }
    : null;

  const payload = cloneDashboard();

  payload.driver = driver;
  payload.dispatch = {
    ...payload.dispatch,
    ticketId,
    vehicle,
    etaMinutes: Number.isFinite(etaMinutes) ? etaMinutes : payload.dispatch.etaMinutes,
    location: pickupTitle || payload.dispatch.location,
  };

  // Build pickup and destination objects with coordinates (if available)
  const pickupWithCoords = {
    title: pickupTitle || payload.route.pickup.title,
    address: pickupAddress || payload.route.pickup.address,
    distance: pickupDistance || payload.route.pickup.distance,
    ...(pickupCoords && { lat: pickupCoords.lat, lng: pickupCoords.lng }),
  };

  const destinationWithCoords = {
    title: destinationTitle || payload.route.destination.title,
    address: destinationAddress || payload.route.destination.address,
    distance: destinationDistance || payload.route.destination.distance,
    ...(destinationCoords && { lat: destinationCoords.lat, lng: destinationCoords.lng }),
  };

  // Only generate map URL if both locations have coordinates
  const mapUrl = (pickupCoords && destinationCoords) 
    ? generateMapUrl(pickupWithCoords as any, destinationWithCoords as any)
    : undefined;

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
    hasKeys: hasKeys,
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

  try {
    await db
      .insertInto("driver_dashboard")
      .values({
        id: towId,
        payload: JSON.stringify(payload),
        updated_at: now,
      })
      .execute();
  } catch (error) {
    console.error("[createTow] Database insert failed:", error);
    console.error("[createTow] Payload size:", JSON.stringify(payload).length);
    throw new Error("Failed to save tow to database. Please try again.");
  }
}


