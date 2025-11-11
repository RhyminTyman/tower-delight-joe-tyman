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

// Generate map URL from GPS coordinates using Google Maps Static API
function generateMapUrl(pickup: any, destination: any) {
  if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
    return undefined;
  }
  
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBa684TfLdTXSODlil08SYZNWvm5yCqApQ';
  
  // Google Maps Static API with markers and path
  const markers = [
    `color:red|label:A|${pickup.lat},${pickup.lng}`,
    `color:green|label:B|${destination.lat},${destination.lng}`
  ].join('&markers=');
  
  // Add a path line between pickup and destination
  const path = `color:0x0066ff|weight:3|${pickup.lat},${pickup.lng}|${destination.lat},${destination.lng}`;
  
  return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&scale=2&maptype=roadmap&markers=${markers}&path=${path}&key=${GOOGLE_MAPS_API_KEY}`;
}

async function getDispatcher() {
  try {
    const dispatcher = await db
      .selectFrom("driver_dashboard")
      .select("payload")
      .where("id", "=", "dispatcher-001")
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


