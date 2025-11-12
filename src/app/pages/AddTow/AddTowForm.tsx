"use client";

import { TowForm, type DriverOption } from "../TowForm/TowForm";
import { createTow } from "./functions";

interface AddTowFormProps {
  driverOptions: DriverOption[];
}

export function AddTowForm({ driverOptions }: AddTowFormProps) {
  const handleSubmit = async (formData: FormData, towId: string) => {
      await createTow(formData);
      window.location.href = `/tow/${towId}`;
  };

  return (
    <TowForm
      mode="create"
      driverOptions={driverOptions}
      cancelHref="/"
      headerTitle="Add Tow"
      submitLabel="Create Tow"
      submittingLabel="Creating..."
      onSubmit={handleSubmit}
    />
  );
}



