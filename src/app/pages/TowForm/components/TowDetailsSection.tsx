/**
 * Tow Details Section Component
 * Handles ticket ID, vehicle info, driver selection, type, ETA, and PO number
 */

import { Card } from "@/components/ui/card";
import type { TowTypeOption, DriverOption } from "../types";

interface TowDetailsSectionProps {
  mode: "create" | "edit";
  values: {
    ticketId: string;
    vehicle: string;
    driverId: string;
    towType: TowTypeOption;
    etaMinutes: string;
    poNumber: string;
  };
  driverOptions: DriverOption[];
  requiresDriver: boolean;
  onChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const STATUS_OPTIONS: TowTypeOption[] = ["Light", "Medium", "Heavy"];

export function TowDetailsSection({
  mode,
  values,
  driverOptions,
  requiresDriver,
  onChange,
}: TowDetailsSectionProps) {
  const towTypeFieldName = mode === "edit" ? "type" : "towType";

  return (
    <Card className="glass-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
        Tow Details
      </h2>

      <div className="space-y-4">
        {/* Ticket ID */}
        <div>
          <label htmlFor="ticketId" className="mb-1.5 block text-xs text-muted-foreground">
            Ticket ID*
          </label>
          <input
            type="text"
            id="ticketId"
            name="ticketId"
            value={values.ticketId}
            onChange={onChange("ticketId")}
            required
            className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="e.g. APD-2024-1847"
          />
        </div>

        {/* Vehicle Info */}
        <div>
          <label htmlFor="vehicle" className="mb-1.5 block text-xs text-muted-foreground">
            Vehicle Info*
          </label>
          <input
            type="text"
            id="vehicle"
            name="vehicle"
            value={values.vehicle}
            onChange={onChange("vehicle")}
            required
            className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="e.g. 2019 Honda Civic · Silver · ABC-1234"
          />
        </div>

        {/* Driver Dropdown (Create mode only) */}
        {mode === "create" && requiresDriver && (
          <div>
            <label htmlFor="driverId" className="mb-1.5 block text-xs text-muted-foreground">
              Driver
            </label>
            <select
              id="driverId"
              name="driverId"
              value={values.driverId}
              onChange={onChange("driverId")}
              className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {driverOptions.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} {driver.callSign ? `(${driver.callSign})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Type */}
        <div>
          <label htmlFor={towTypeFieldName} className="mb-1.5 block text-xs text-muted-foreground">
            Type
          </label>
          <select
            id={towTypeFieldName}
            name={towTypeFieldName}
            value={values.towType}
            onChange={onChange("towType")}
            className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Grid for ETA and PO Number */}
        <div className="grid grid-cols-2 gap-3">
          {/* ETA */}
          <div>
            <label htmlFor="etaMinutes" className="mb-1.5 block text-xs text-muted-foreground">
              ETA (minutes)
            </label>
            <input
              id="etaMinutes"
              name="etaMinutes"
              type="number"
              min={0}
              value={values.etaMinutes}
              onChange={onChange("etaMinutes")}
              className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Optional"
            />
          </div>

          {/* PO Number */}
          <div>
            <label htmlFor="poNumber" className="mb-1.5 block text-xs text-muted-foreground">
              PO Number
            </label>
            <input
              id="poNumber"
              name="poNumber"
              value={values.poNumber}
              onChange={onChange("poNumber")}
              className="w-full rounded-none border border-border/60 bg-slate-900/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Optional"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

