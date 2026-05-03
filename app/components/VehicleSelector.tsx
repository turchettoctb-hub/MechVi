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

const TRANS_OPTS: { value: SelectedVehicle["transmission"]; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

const FUEL_OPTS: { value: SelectedVehicle["fuel"]; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "ev", label: "EV" },
];

const CYL_OPTS: { value: SelectedVehicle["cylinders"]; label: string }[] = [
  { value: "unknown", label: "Unknown" },
  { value: "3", label: "3 cyl" },
  { value: "4", label: "4 cyl" },
  { value: "5", label: "5 cyl" },
  { value: "6", label: "6 cyl" },
  { value: "8", label: "V8" },
  { value: "10", label: "V10" },
  { value: "12", label: "V12" },
];

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
    border: active ? "2px solid #0b0b0d" : "1px solid rgba(0,0,0,0.12)",
    background: active
      ? "linear-gradient(165deg, rgba(254,243,199,0.98) 0%, rgba(253,230,138,0.5) 45%, rgba(255,255,255,0.95) 100%)"
      : "rgba(255,255,255,0.88)",
    cursor: "pointer",
    display: "grid",
    placeItems: "center" as const,
    gap: 10,
    boxShadow: active
      ? "0 0 0 3px rgba(251, 191, 36, 0.42), 0 14px 34px rgba(0,0,0,0.12)"
      : "0 10px 24px rgba(0,0,0,0.06)",
    transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
    transform: active ? "translateY(-1px)" : "translateY(0px)",
  };
}

function yearBtnStyle(selected: boolean) {
  return {
    padding: "11px 6px",
    minHeight: 44,
    borderRadius: 14,
    border: selected ? "2px solid #0b0b0d" : "1px solid rgba(0,0,0,0.12)",
    background: selected ? "#0b0b0d" : "rgba(255,255,255,0.96)",
    color: selected ? "#fff" : "#111",
    fontWeight: 900,
    fontSize: "clamp(12px, 2.8vw, 14px)",
    cursor: "pointer",
    boxShadow: selected ? "0 0 0 2px rgba(251, 191, 36, 0.48)" : undefined,
  };
}

function modelBtnStyle(selected: boolean) {
  return {
    padding: "12px 14px",
    minHeight: 48,
    borderRadius: 16,
    border: selected ? "2px solid #0b0b0d" : "1px solid rgba(0,0,0,0.12)",
    background: selected ? "#0b0b0d" : "rgba(255,255,255,0.96)",
    color: selected ? "#fff" : "#111",
    fontWeight: 950,
    cursor: "pointer",
    textAlign: "left" as const,
    boxShadow: selected ? "0 0 0 2px rgba(251, 191, 36, 0.48)" : undefined,
  };
}

function optionChipStyle(selected: boolean) {
  return {
    padding: "10px 14px",
    minHeight: 44,
    borderRadius: 14,
    border: selected ? "2px solid #0b0b0d" : "1px solid rgba(0,0,0,0.14)",
    background: selected ? "#0b0b0d" : "#fff",
    color: selected ? "#fff" : "#111",
    fontWeight: 850,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: selected ? "0 0 0 2px rgba(251, 191, 36, 0.45)" : undefined,
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
    <div
      className="mechvi-safe-pad mechvi-safe-pad-bottom"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 50, paddingTop: 12 }}
      onMouseDown={close}
    >
      <div
        className="mechvi-selector-shell"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 22px 70px rgba(0,0,0,0.18)",
          color: "#111",
        }}
      >
        <div style={{ padding: "clamp(14px, 3vw, 18px)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: "clamp(16px, 3.5vw, 18px)" }}>Select your vehicle</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Brand → Year → Model → Options</div>
          </div>
          <button type="button" onClick={close} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#fff", color: "#111", fontWeight: 900, minHeight: 44 }}>
            Close
          </button>
        </div>

        <div className="mechvi-selector-scroll" style={{ padding: "0 clamp(14px, 3vw, 18px) clamp(14px, 3vw, 18px)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", opacity: 0.85, fontSize: "clamp(11px, 2.6vw, 12px)", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 900 }}>Step {step}/3</span>
            <span>•</span><span>{brand || "Choose brand"}</span>
            <span>•</span><span>{year ?? "Choose year"}</span>
            <span>•</span><span>{model || "Choose model"}</span>
          </div>

          {step === 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Pick a brand</div>
              <div className="mechvi-selector-brand-grid">
                {BRANDS.map((b) => (
                  <div
                    key={b.name}
                    role="button"
                    tabIndex={0}
                    style={tileStyle(brand === b.name)}
                    onClick={() => {
                      setBrand(b.name);
                      setModel("");
                      setStep(2);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setBrand(b.name);
                        setModel("");
                        setStep(2);
                      }
                    }}
                  >
                    <div style={{ width: 64, height: 34, display: "grid", placeItems: "center" }}>
                      <img
                        src={`/brands/${b.file}`}
                        alt={`${b.name} logo`}
                        style={{ maxWidth: 64, maxHeight: 34, objectFit: "contain" }}
                      />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, textAlign: "center", color: brand === b.name ? "#0b0b0d" : undefined }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>Pick a year</div>
                <input placeholder="Search year (e.g. 2004)" value={yearSearch} onChange={(e) => setYearSearch(e.target.value.replace(/\D/g, ""))} style={{ ...controlStyle(), flex: "1 1 160px", minWidth: 0 }} />
              </div>

              <div className="mechvi-selector-year-grid" style={{ marginTop: 10, maxHeight: 320, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                {years.slice(0, 160).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setYear(y);
                      setStep(3);
                    }}
                    style={yearBtnStyle(year === y)}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setStep(1)} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#fff", fontWeight: 900, minHeight: 44 }}>
                  Change brand
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 950 }}>Pick a model / version</div>
                <input placeholder="Search model (e.g. 320i)" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} style={{ ...controlStyle(), flex: "1 1 180px", minWidth: 0 }} />
              </div>

              <div className="mechvi-selector-model-grid" style={{ marginTop: 10 }}>
                {modelOptions.map((m) => (
                  <button key={m} type="button" onClick={() => setModel(m)} style={modelBtnStyle(model === m)}>
                    {m}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 8, opacity: 0.85 }}>Transmission</div>
                <div className="mechvi-selector-option-row">
                  {TRANS_OPTS.map((o) => (
                    <button key={o.value} type="button" onClick={() => setTrans(o.value)} style={optionChipStyle(trans === o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 8, opacity: 0.85 }}>Fuel</div>
                <div className="mechvi-selector-option-row">
                  {FUEL_OPTS.map((o) => (
                    <button key={o.value} type="button" onClick={() => setFuel(o.value)} style={optionChipStyle(fuel === o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 8, opacity: 0.85 }}>Cylinders</div>
                <div className="mechvi-selector-option-row">
                  {CYL_OPTS.map((o) => (
                    <button key={o.value} type="button" onClick={() => setCyl(o.value)} style={optionChipStyle(cyl === o.value)}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 8, opacity: 0.85 }}>Km (optional)</div>
                <input placeholder="Odometer" value={km} onChange={(e) => setKm(e.target.value.replace(/\D/g, ""))} style={{ ...controlStyle(), width: "100%", maxWidth: 360 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button type="button" onClick={() => setStep(2)} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#fff", fontWeight: 900, minHeight: 44 }}>
                  Change year
                </button>

                <button
                  type="button"
                  onClick={confirm}
                  disabled={!model.trim()}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "#0b0b0d",
                    color: "#fff",
                    fontWeight: 950,
                    opacity: !model.trim() ? 0.55 : 1,
                    minHeight: 48,
                    cursor: !model.trim() ? "not-allowed" : "pointer",
                  }}
                >
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
