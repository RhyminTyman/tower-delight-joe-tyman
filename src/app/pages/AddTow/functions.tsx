"use server";

import { STATIC_DRIVER_DASHBOARD } from "@/app/data/driver-dashboard";
import { db } from "@/db";

type DashboardPayload = typeof STATIC_DRIVER_DASHBOARD;

function cloneDashboard(): DashboardPayload {
  return JSON.parse(JSON.stringify(STATIC_DRIVER_DASHBOARD));
}

// Generate random GPS coordinates around Columbus, OH
function generateRandomCoordinates() {
  // Columbus, OH is approximately at 39.9612° N, 82.9988° W
  const centerLat = 39.9612;
  const centerLng = -82.9988;
  
  // Generate random offset within ~20 miles (roughly 0.3 degrees)
  const latOffset = (Math.random() - 0.5) * 0.3;
  const lngOffset = (Math.random() - 0.5) * 0.3;
  
  return {
    lat: Number((centerLat + latOffset).toFixed(4)),
    lng: Number((centerLng + lngOffset).toFixed(4)),
  };
}

// Generate map URL from GPS coordinates
function generateMapUrl(pickup: any, destination: any) {
  if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
    return undefined;
  }
  
  // Use Mapbox Static API format
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s-a+ff0000(${pickup.lng},${pickup.lat}),pin-s-b+00ff00(${destination.lng},${destination.lat})/auto/600x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
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

  // Generate random GPS coordinates for pickup and destination
  const pickupCoords = generateRandomCoordinates();
  const destinationCoords = generateRandomCoordinates();

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

  payload.route = {
    ...payload.route,
    status: "Waiting",
    statusTone: "waiting",
    pickup: pickupWithCoords,
    destination: destinationWithCoords,
    mapUrl: mapUrl,
    mapImage: mapUrl || payload.route.mapImage,
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


