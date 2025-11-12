"use client";

import { TowForm, type DriverOption } from "../TowForm/TowForm";
import { createTow } from "./functions";

interface AddTowFormProps {
  driverOptions: DriverOption[];
}

export function AddTowForm({ driverOptions }: AddTowFormProps) {
  const handleSubmit = async (formData: FormData, towId: string) => {
    try {
      await createTow(formData);
      // Use replace to ensure navigation happens
      window.location.replace(`/tow/${towId}`);
    } catch (error) {
      // Error will be caught and displayed by TowForm
      throw error;
    }
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



