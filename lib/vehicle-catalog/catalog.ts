import type { AuVehicleCatalog } from "./types";
import { BMW_SEED } from "./seed/bmw-3-series-au";
import { TOYOTA_COROLLA_SEED } from "./seed/toyota-corolla-au";
import { HOLDEN_BARINA_SEED } from "./seed/holden-barina-au";
import { JEEP_GRAND_CHEROKEE_SEED } from "./seed/jeep-grand-cherokee-au";

export const AU_VEHICLE_CATALOG: AuVehicleCatalog = {
  schemaVersion: 1,
  region: "AU",
  makes: [BMW_SEED, TOYOTA_COROLLA_SEED, HOLDEN_BARINA_SEED, JEEP_GRAND_CHEROKEE_SEED],
};
