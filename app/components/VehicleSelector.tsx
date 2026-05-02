"use client";

import { useMemo, useState } from "react";

export type SelectedVehicle = {
  make: string;
  year: number;
  model: string;
  transmission: "automatic" | "manual" | "unknown";
  fuel: "petrol" | "diesel" | "hybrid" | "ev" | "unknown";
  cylinders: "3" | "4" | "5" | "6" | "8" | "10" | "12" | "unknown";
  km: number | null;
};

type Props = { open: boolean; onClose: () => void; onSelect: (v: SelectedVehicle) => void };

const BRANDS = [
  { name: "Toyota", file: "toyota.svg" },
  { name: "Mazda", file: "mazda.svg" },
  { name: "Hyundai", file: "hyundai.svg" },
  { name: "Kia", file: "kia.svg" },
  { name: "Ford", file: "ford.svg" },
  { name: "Holden", file: "holden.svg" },
  { name: "Mitsubishi", file: "mitsubishi.svg" },
  { name: "Subaru", file: "subaru.svg" },
  { name: "Nissan", file: "nissan.svg" },
  { name: "Honda", file: "honda.svg" },
  { name: "BMW", file: "bmw.svg" },
  { name: "Mercedes-Benz", file: "mercedes.svg" },
  { name: "Audi", file: "audi.svg" },
];

const BRAND_MODELS: Record<string, string[]> = {
  BMW: ["320i","325i","330i","318i","X3","X5","1 Series","3 Series","5 Series"],
  Toyota: ["Corolla","Camry","RAV4","Hilux","Yaris","Prado"],
  Mazda: ["Mazda3","Mazda2","CX-5","CX-3","BT-50"],
  Hyundai: ["i30","Tucson","Santa Fe","Kona"],
  Kia: ["Cerato","Sportage","Sorento","Picanto"],
  Ford: ["Ranger","Focus","Falcon","Everest"],
  Holden: ["Commodore","Cruze","Colorado"],
  Mitsubishi: ["Triton","Outlander","Pajero"],
  Subaru: ["Forester","Outback","Impreza","WRX"],
  Nissan: ["X-Trail","Navara","Pathfinder"],
  Honda: ["Civic","CR-V","Accord"],
  "Mercedes-Benz": ["C-Class","E-Class","GLC","A-Class"],
  Audi: ["A3","A4","Q5","A6"],
};

function controlStyle() {
  return {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 750 as const,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    MozAppearance: "none" as const,
    outline: "none",
  };
}

function tileStyle(active: boolean) {
  return {
    padding: 14,
    borderRadius: 18,
    border: active ? "1px solid rgba(0,0,0,0.16)" : "1px solid rgba(0,0,0,0.10)",
    background: active ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.86)",
    cursor: "pointer",
    display: "grid",
    placeItems: "center" as const,
    gap: 10,
    boxShadow: active ? "0 18px 40px rgba(0,0,0,0.10)" : "0 10px 24px rgba(0,0,0,0.06)",
    transition: "transform 120ms ease, box-shadow 120ms ease",
    transform: active ? "translateY(-1px)" : "translateY(0px)",
  };
}

export default function VehicleSelector({ open, onClose, onSelect }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [brand, setBrand] = useState<string>("");
  const [year, setYear] = useState<number | null>(null);
  const [yearSearch, setYearSearch] = useState("");
  const [model, setModel] = useState<string>("");
  const [modelSearch, setModelSearch] = useState("");
  const [trans, setTrans] = useState<"automatic" | "manual" | "unknown">("unknown");
  const [fuel, setFuel] = useState<"petrol" | "diesel" | "hybrid" | "ev" | "unknown">("unknown");
  const [cyl, setCyl] = useState<"3"|"4"|"5"|"6"|"8"|"10"|"12"|"unknown">("unknown");
  const [km, setKm] = useState<string>("");

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const list: number[] = [];
    for (let y = now; y >= 1900; y--) list.push(y);
    const s = yearSearch.trim();
    if (!s) return list;
    return list.filter((x) => String(x).includes(s));
  }, [yearSearch]);

  const modelOptions = useMemo(() => {
    const base = BRAND_MODELS[brand] || [];
    const s = modelSearch.trim().toLowerCase();
    const filtered = s ? base.filter((m) => m.toLowerCase().includes(s)) : base;
    return filtered.slice(0, 24);
  }, [brand, modelSearch]);

  function resetAll() {
    setStep(1); setBrand(""); setYear(null); setYearSearch("");
    setModel(""); setModelSearch(""); setTrans("unknown");
    setFuel("unknown"); setCyl("unknown"); setKm("");
  }

  function close() { resetAll(); onClose(); }

  function confirm() {
    if (!brand || !year || !model.trim()) return;
    onSelect({ make: brand, year, model: model.trim(), transmission: trans, fuel, cylinders: cyl, km: km ? Number(km) : null });
    close();
  }

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 50, padding: 16 }} onMouseDown={close}>
      <div onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "min(980px, 100%)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", boxShadow: "0 22px 70px rgba(0,0,0,0.18)", color: "#111" }}>
        <div style={{ padding: 18, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 18 }}>Select your vehicle</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Brand → Year → Model → Options</div>
          </div>
          <button onClick={close} style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#fff", color: "#111", fontWeight: 900 }}>
            Close
          </button>
        </div>

        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", opacity: 0.85, fontSize: 12 }}>
            <span style={{ fontWeight: 900 }}>Step {step}/3</span>
            <span>•</span><span>{brand || "Choose brand"}</span>
            <span>•</span><span>{year || "Choose year"}</span>
            <span>•</span><span>{model || "Choose model"}</span>
          </div>

          {step === 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Pick a brand</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12 }}>
                {BRANDS.map((b) => (
                  <div
                    key={b.name}
                    style={tileStyle(brand === b.name)}
                    onClick={() => { setBrand(b.name); setModel(""); setStep(2); }}  // AUTO ADVANCE
                  >
                    <div style={{ width: 64, height: 34, display: "grid", placeItems: "center" }}>
                      <img
                        src={`/brands/${b.file}`}
                        alt={`${b.name} logo`}
                        style={{ maxWidth: 64, maxHeight: 34, objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, textAlign: "center" }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>Pick a year</div>
                <input placeholder="Search year (e.g. 2004)" value={yearSearch} onChange={(e) => setYearSearch(e.target.value.replace(/\D/g, ""))} style={controlStyle()} />
              </div>

              <div style={{ marginTop: 10, maxHeight: 300, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 8 }}>
                {years.slice(0, 160).map((y) => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setStep(3); }}   // AUTO ADVANCE
                    style={{ padding: "10px 0", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "rgba(255,255,255,0.92)", color: "#111", fontWeight: 900, cursor: "pointer" }}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#fff", fontWeight: 900 }}>
                  Change brand
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>Pick a model</div>
                <input placeholder="Search model (e.g. 320i)" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} style={controlStyle()} />
              </div>

              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                {modelOptions.map((m) => (
                  <button key={m} onClick={() => setModel(m)}
                    style={{ padding: 12, borderRadius: 16, border: model === m ? "1px solid rgba(0,0,0,0.20)" : "1px solid rgba(0,0,0,0.10)", background: "rgba(255,255,255,0.92)", color: "#111", fontWeight: 950, cursor: "pointer", textAlign: "left" }}>
                    {m}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <select value={trans} onChange={(e) => setTrans(e.target.value as any)} style={controlStyle()}>
                  <option value="unknown">Transmission (unknown)</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>

                <select value={fuel} onChange={(e) => setFuel(e.target.value as any)} style={controlStyle()}>
                  <option value="unknown">Fuel (unknown)</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="ev">EV</option>
                </select>

                <select value={cyl} onChange={(e) => setCyl(e.target.value as any)} style={controlStyle()}>
                  <option value="unknown">Cylinders (unknown)</option>
                  <option value="3">3 cyl</option>
                  <option value="4">4 cyl</option>
                  <option value="5">5 cyl</option>
                  <option value="6">6 cyl</option>
                  <option value="8">V8</option>
                  <option value="10">V10</option>
                  <option value="12">V12</option>
                </select>

                <input placeholder="Km (optional)" value={km} onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} style={controlStyle()} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
                <button onClick={() => setStep(2)} style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#fff", fontWeight: 900 }}>
                  Change year
                </button>

                <button onClick={confirm} disabled={!model.trim()}
                  style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.10)", background: "#0b0b0d", color: "#fff", fontWeight: 950, opacity: !model.trim() ? 0.6 : 1 }}>
                  Use this vehicle
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
