import type { AuMake } from "../types";

/** Holden Barina TK hatch — AU 2005–2012 seed scope. */
export const HOLDEN_BARINA_SEED: AuMake = {
  key: "holden",
  name: "Holden",
  logo: "holden.svg",
  modelLines: [
    {
      key: "holden-barina-tk",
      name: "Barina",
      chassisCode: "TK",
      bodyStyle: "Hatch",
      yearBands: [
        {
          fromYear: 2005,
          toYear: 2012,
          variants: [
            {
              key: "barina-16",
              displayName: "1.6",
              engineCode: "F16D3",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
            },
            {
              key: "barina-cdx",
              displayName: "CDX",
              cylinders: 4,
              fuel: "petrol",
              transmissions: ["automatic", "manual"],
              notes: "Higher trim — confirm equipment at purchase",
            },
          ],
        },
      ],
    },
  ],
};
