import { db } from "@/db";
import { DASHBOARD_TEMPLATE } from "@/app/data/driver-dashboard";

const DRIVER_DASHBOARD_TABLE = "driver_dashboard" as const;

const SEED_TOWS = [
  {
    id: "tow-001",
    ticketId: "APD-2024-1847",
    status: "En Route",
    statusTone: "active" as const,
    vehicle: "2019 Honda Civic · Silver · ABC-1234",
    pickup: {
      title: "Kyle's Motors",
      address: "830 South 17th Street, Columbus OH 43206",
      distance: "12 mi (26 m)",
    },
    destination: {
      title: "City Impound Lot",
      address: "1440 Alum Creek Dr, Columbus OH 43209",
      distance: "8 mi (18 m)",
    },
    etaMinutes: 26,
  },
  {
    id: "tow-002",
    ticketId: "APD-2024-1852",
    status: "On Scene",
    statusTone: "active" as const,
    vehicle: "2021 Ford F-150 · White · XYZ-5678",
    pickup: {
      title: "Walmart Parking Lot",
      address: "3600 Soldano Blvd, Columbus OH 43228",
      distance: "0 mi (0 m)",
    },
    destination: {
      title: "West Side Impound",
      address: "2500 McKinley Ave, Columbus OH 43204",
      distance: "5 mi (12 m)",
    },
    etaMinutes: 0,
  },
  {
    id: "tow-003",
    ticketId: "APD-2024-1839",
    status: "Towing",
    statusTone: "completed" as const,
    vehicle: "2018 Toyota Camry · Black · DEF-9012",
    pickup: {
      title: "Downtown Parking Garage",
      address: "55 E Spring St, Columbus OH 43215",
      distance: "0 mi (0 m)",
    },
    destination: {
      title: "City Impound Lot",
      address: "1440 Alum Creek Dr, Columbus OH 43209",
      distance: "3 mi (8 m)",
    },
    etaMinutes: 8,
  },
  {
    id: "tow-004",
    ticketId: "APD-2024-1860",
    status: "Dispatched",
    statusTone: "waiting" as const,
    vehicle: "2020 Jeep Wrangler · Red · GHI-3456",
    pickup: {
      title: "Ohio State Campus",
      address: "1739 N High St, Columbus OH 43210",
      distance: "18 mi (32 m)",
    },
    destination: {
      title: "North Impound Facility",
      address: "3232 Morse Rd, Columbus OH 43231",
      distance: "6 mi (14 m)",
    },
    etaMinutes: 32,
  },
  {
    id: "tow-005",
    ticketId: "APD-2024-1865",
    status: "Waiting",
    statusTone: "waiting" as const,
    vehicle: "2017 Nissan Altima · Blue · JKL-7890",
    pickup: {
      title: "Easton Town Center",
      address: "160 Easton Town Center, Columbus OH 43219",
      distance: "22 mi (38 m)",
    },
    destination: {
      title: "East Side Storage",
      address: "5500 E Livingston Ave, Columbus OH 43232",
      distance: "9 mi (20 m)",
    },
    etaMinutes: 38,
  },
];

export default async () => {
  console.log("... Seeding driver dashboard with multiple tows");

  // Clear existing tows
  await db.deleteFrom(DRIVER_DASHBOARD_TABLE).execute();

  // Insert all seed tows
  for (const tow of SEED_TOWS) {
    const dashboardData = {
      ...DASHBOARD_TEMPLATE,
      dispatch: {
        ...DASHBOARD_TEMPLATE.dispatch,
        ticketId: tow.ticketId,
        vehicle: tow.vehicle,
        etaMinutes: tow.etaMinutes,
      },
      route: {
        ...DASHBOARD_TEMPLATE.route,
        status: tow.status,
        statusTone: tow.statusTone,
        pickup: tow.pickup,
        destination: tow.destination,
        statuses: DASHBOARD_TEMPLATE.route.statuses.map((s) => {
          if (tow.status === "Waiting") {
            return s.label === "Waiting" ? { ...s, status: "active" } : { ...s, status: "waiting" };
          }
          if (tow.status === "Dispatched") {
            return s.label === "Dispatched"
              ? { ...s, status: "active" }
              : s.label === "Waiting"
                ? { ...s, status: "completed" }
                : { ...s, status: "waiting" };
          }
          if (tow.status === "En Route") {
            return s.label === "En Route"
              ? { ...s, status: "active" }
              : s.label === "Waiting" || s.label === "Dispatched"
                ? { ...s, status: "completed" }
                : { ...s, status: "waiting" };
          }
          if (tow.status === "On Scene") {
            return s.label === "On Scene"
              ? { ...s, status: "active" }
              : s.label === "Waiting" || s.label === "Dispatched" || s.label === "En Route"
                ? { ...s, status: "completed" }
                : { ...s, status: "waiting" };
          }
          if (tow.status === "Towing") {
            return s.label === "Towing"
              ? { ...s, status: "active" }
              : s.label === "Waiting" || s.label === "Dispatched" || s.label === "En Route" || s.label === "On Scene"
                ? { ...s, status: "completed" }
                : { ...s, status: "waiting" };
          }
          if (tow.status === "Completed") {
            return { ...s, status: "completed" };
          }
          return s;
        }),
      },
    };

    await db
      .insertInto(DRIVER_DASHBOARD_TABLE)
      .values({
        id: tow.id,
        payload: JSON.stringify(dashboardData),
        updated_at: Math.floor(Date.now() / 1000),
      })
      .execute();

    console.log(`✓ Seeded tow: ${tow.ticketId} (${tow.status})`);
  }

  console.log(`Done seeding ${SEED_TOWS.length} tows`);
};

