import type { AuMake } from "../types";

/** Toyota Corolla — AU 2000–2010 (ZE/AE generations rolled into one guided band for MVP seed). */
export const TOYOTA_COROLLA_SEED: AuMake = {
  key: "toyota",
  name: "Toyota",
  logo: "toyota.svg",
  modelLines: [
    {
      key: "toyota-corolla-au",
      name: "Corolla",
      chassisCode: "AE112 / ZZE122 / ZRE152 (era-dependent)",
      bodyStyle: "Hatch / Sedan",
      yearBands: [
        {
          fromYear: 2000,
          toYear: 2010,
          variants: [
            {
              key: "corolla-ascend",
              displayName: "Ascent",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "corolla-conquest",
              displayName: "Conquest",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "corolla-levin",
              displayName: "Levin",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "corolla-sportivo",
              displayName: "Sportivo",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
              notes: "Later ZZE/ZRE Sportivo — confirm drivetrain when buying",
            },
          ],
        },
      ],
    },
  ],
};
