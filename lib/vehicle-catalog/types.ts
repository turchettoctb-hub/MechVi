/** Australian market vehicle catalog — parallel to legacy VehicleSelector lists. */

export type Fuel = "petrol" | "diesel" | "hybrid" | "ev";
export type Transmission = "automatic" | "manual";

export type Cylinders = 3 | 4 | 5 | 6 | 8 | 10 | 12;

/** One trim/engine row for a model generation sold in AU for the given years. */
export interface AuVariant {
  key: string;
  displayName: string;
  engineCode?: string;
  cylinders: Cylinders;
  fuel: Fuel;
  transmissions: Transmission[];
  notes?: string;
}

export interface AuYearBand {
  fromYear: number;
  toYear: number;
  variants: AuVariant[];
}

export interface AuModelLine {
  key: string;
  name: string;
  chassisCode?: string;
  bodyStyle?: string;
  yearBands: AuYearBand[];
}

export interface AuMake {
  /** Stable key, e.g. "bmw" */
  key: string;
  /** Must match VehicleSelector BRANDS `name` for integration */
  name: string;
  logo: string;
  modelLines: AuModelLine[];
}

export interface AuVehicleCatalog {
  schemaVersion: 1;
  region: "AU";
  makes: AuMake[];
}
