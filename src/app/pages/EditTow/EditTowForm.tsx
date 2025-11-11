"use client";

import { TowForm, type TowTypeOption } from "../TowForm/TowForm";
import { updateTow } from "./functions";

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
  };
  destination: {
    title: string;
    address: string;
    distance: string;
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
        destinationTitle: data.destination.title,
        destinationAddress: data.destination.address,
        destinationDistance: data.destination.distance,
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


