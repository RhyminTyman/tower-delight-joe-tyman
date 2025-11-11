import { db } from "@/db";

export default async () => {
  console.log("Checking database contents...");
  
  const rows = await db
    .selectFrom("driver_dashboard")
    .select(["id", "payload"])
    .execute();
  
  console.log(`\n✅ Found ${rows.length} rows in database\n`);
  
  rows.forEach((row) => {
    const data = JSON.parse(row.payload);
    console.log(`ID: ${row.id}`);
    console.log(`  Ticket: ${data.dispatch.ticketId}`);
    console.log(`  Vehicle: ${data.dispatch.vehicle}`);
    console.log(`  Status: ${data.route.status}`);
    console.log(`  Pickup: ${data.route.pickup.title}`);
    console.log(`  Destination: ${data.route.destination.title}`);
    console.log("");
  });
  
  if (rows.length === 0) {
    console.log("❌ Database is empty! Run: npm run seed");
  }
};

