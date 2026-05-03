import type { AuMake } from "../types";

/** Jeep Grand Cherokee WK2 — AU 2011–2015 seed scope (engine lineup simplified). */
export const JEEP_GRAND_CHEROKEE_SEED: AuMake = {
  key: "jeep",
  name: "Jeep",
  logo: "jeep.svg",
  modelLines: [
    {
      key: "jeep-grand-cherokee-wk2",
      name: "Grand Cherokee",
      chassisCode: "WK2",
      bodyStyle: "SUV",
      yearBands: [
        {
          fromYear: 2011,
          toYear: 2015,
          variants: [
            {
              key: "gc-v6-petrol",
              displayName: "V6 Pentastar",
              cylinders: 6,
              fuel: "petrol",
              transmissions: ["automatic"],
            },
            {
              key: "gc-v8-petrol",
              displayName: "V8 HEMI",
              cylinders: 8,
              fuel: "petrol",
              transmissions: ["automatic"],
            },
            {
              key: "gc-v6-diesel",
              displayName: "V6 CRD",
              cylinders: 6,
              fuel: "diesel",
              transmissions: ["automatic"],
              notes: "Common AU diesel option — verify emissions gear on older stock",
            },
            {
              key: "gc-srt",
              displayName: "SRT8",
              cylinders: 8,
              fuel: "petrol",
              transmissions: ["automatic"],
              notes: "Performance variant — limited availability",
            },
          ],
        },
      ],
    },
  ],
};
