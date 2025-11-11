import type { RequestInfo } from "rwsdk/worker";

import { loadDriverDashboard } from "@/app/data/driver-dashboard";
import { DriverDashboard } from "@/app/components/DriverDashboard";

export const Home = async (requestInfo: RequestInfo) => {
  const data = await loadDriverDashboard(requestInfo);
  return <DriverDashboard {...data} />;
};
