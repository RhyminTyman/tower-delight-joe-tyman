export interface TowItem {
  id: string;
  ticketId: string;
  driverName: string;
  status: string;
  statusTone: "waiting" | "active" | "completed";
  vehicle: string;
  pickup: {
    title: string;
    address: string;
  };
  destination: {
    title: string;
    address: string;
  };
  etaMinutes?: number;
}

