/**
 * Type definitions for TowForm component
 */

import type { DriverSnapshot } from "@/app/data/driver-dashboard";

export const STATUS_OPTIONS = ["Light", "Medium", "Heavy"] as const;

export type TowTypeOption = (typeof STATUS_OPTIONS)[number];

export type TowFormMode = "create" | "edit";

export interface TowFormValues {
  towId: string;
  ticketId: string;
  vehicle: string;
  driverId: string;
  towType: TowTypeOption;
  etaMinutes: string;
  pickupTitle: string;
  pickupAddress: string;
  pickupDistance: string;
  pickupLat: string;
  pickupLng: string;
  destinationTitle: string;
  destinationAddress: string;
  destinationDistance: string;
  destinationLat: string;
  destinationLng: string;
  poNumber: string;
  dispatcher: string;
  hasKeys: string;
  driverCallsign: string;
  truck: string;
}

export interface DriverOption {
  id: string;
  name: string;
  snapshot: DriverSnapshot;
  callSign?: string;
}

export interface TowFormProps {
  mode: TowFormMode;
  driverOptions?: DriverOption[];
  initialValues?: Partial<TowFormValues>;
  cancelHref: string;
  headerTitle: string;
  headerBadge?: string;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (formData: FormData, towId: string) => Promise<void>;
}

