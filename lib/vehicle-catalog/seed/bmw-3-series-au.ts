import type { AuMake } from "../types";

/** BMW 3 Series E46 — AU sales ~2000–2006 for this seed scope (facelift mid-run simplified). */
export const BMW_SEED: AuMake = {
  key: "bmw",
  name: "BMW",
  logo: "bmw.svg",
  modelLines: [
    {
      key: "bmw-3-series-e46",
      name: "3 Series",
      chassisCode: "E46",
      bodyStyle: "Sedan / Touring / Coupe / Convertible (model-dependent)",
      yearBands: [
        {
          fromYear: 2000,
          toYear: 2006,
          variants: [
            {
              key: "e46-318i",
              displayName: "318i",
              engineCode: "N42 / M43",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "e46-320i",
              displayName: "320i",
              engineCode: "M54B22",
              cylinders: 6,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "e46-325i",
              displayName: "325i",
              engineCode: "M54B25",
              cylinders: 6,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "e46-330i",
              displayName: "330i",
              engineCode: "M54B30",
              cylinders: 6,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "e46-m3",
              displayName: "M3",
              engineCode: "S54",
              cylinders: 6,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
              notes: "Coupe / convertible availability varies by year",
            },
          ],
        },
      ],
    },
  ],
};
