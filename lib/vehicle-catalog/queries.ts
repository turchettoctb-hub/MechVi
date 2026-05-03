import { AU_VEHICLE_CATALOG } from "./catalog";
import type { AuMake, AuModelLine, AuVariant, AuYearBand } from "./types";

/** Expand inclusive year band to individual years, descending. */
function yearsInBand(band: AuYearBand): number[] {
  const out: number[] = [];
  for (let y = band.toYear; y >= band.fromYear; y--) out.push(y);
  return out;
}

/** All distinct calendar years covered by this make’s catalog (descending). */
export function listYearsForMake(make: AuMake): number[] {
  const set = new Set<number>();
  for (const line of make.modelLines) {
    for (const band of line.yearBands) {
      for (let y = band.fromYear; y <= band.toYear; y++) set.add(y);
    }
  }
  return Array.from(set).sort((a, b) => b - a);
}

export function findMakeByBrandDisplayName(brandName: string): AuMake | undefined {
  return AU_VEHICLE_CATALOG.makes.find((m) => m.name === brandName);
}

/**
 * When non-null: use this list for the year step (catalog-backed).
 * When null: caller should keep legacy full year range (make not in AU seed catalog).
 */
export function getCatalogYearListForBrandName(brandDisplayName: string): number[] | null {
  const make = findMakeByBrandDisplayName(brandDisplayName);
  if (!make) return null;
  const years = listYearsForMake(make);
  return years.length > 0 ? years : null;
}

export function isCatalogBrand(brandDisplayName: string): boolean {
  return findMakeByBrandDisplayName(brandDisplayName) !== undefined;
}

/** Future: model lines available for a given make + model year. */
export function listModelLinesForMakeYear(make: AuMake, year: number): AuModelLine[] {
  return make.modelLines.filter((line) =>
    line.yearBands.some((b) => year >= b.fromYear && year <= b.toYear),
  );
}

/** Future: variants for a specific line + year. */
export function variantsForModelLineYear(line: AuModelLine, year: number): AuVariant[] {
  const band = line.yearBands.find((b) => year >= b.fromYear && year <= b.toYear);
  return band?.variants ?? [];
}

/** Exported for tests / debugging */
export { yearsInBand };
