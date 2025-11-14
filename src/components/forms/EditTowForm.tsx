"use client";

import { TowForm, type TowTypeOption } from "./TowForm";
import { updateTow } from "@/actions";

interface TowEditData {
  ticketId: string;
  vehicle: string;
  status: string;
  dispatcher: string;
  hasKeys: boolean;
  type: string;
  poNumber: string;
  pickup: {
    title: string;
    address: string;
    distance: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    title: string;
    address: string;
    distance: string;
    lat?: number;
    lng?: number;
  };
  driverCallsign?: string;
  truck?: string;
  etaMinutes?: string;
}

interface EditTowFormProps {
  towId: string;
  data: TowEditData;
}

export function EditTowForm({ towId, data }: EditTowFormProps) {
  async function handleSubmit(formData: FormData, currentTowId: string) {
    await updateTow(formData);
    window.location.href = `/tow/${currentTowId}`;
  }

  return (
    <TowForm
      mode="edit"
      cancelHref={`/tow/${towId}`}
      headerTitle="Edit Tow"
      headerBadge={data.ticketId}
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      onSubmit={handleSubmit}
      initialValues={{
        towId,
        ticketId: data.ticketId,
        vehicle: data.vehicle,
        towType: data.type as TowTypeOption,
        pickupTitle: data.pickup.title,
        pickupAddress: data.pickup.address,
        pickupDistance: data.pickup.distance,
        pickupLat: data.pickup.lat?.toString() ?? "",
        pickupLng: data.pickup.lng?.toString() ?? "",
        destinationTitle: data.destination.title,
        destinationAddress: data.destination.address,
        destinationDistance: data.destination.distance,
        destinationLat: data.destination.lat?.toString() ?? "",
        destinationLng: data.destination.lng?.toString() ?? "",
        dispatcher: data.dispatcher,
        hasKeys: data.hasKeys ? "yes" : "no",
        poNumber: data.poNumber,
        driverCallsign: data.driverCallsign ?? "",
        truck: data.truck ?? "",
        etaMinutes: data.etaMinutes ?? "",
      }}
    />
  );
}


