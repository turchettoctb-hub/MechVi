"use client";

import { useEffect, useState } from "react";
import HeroCarousel, { HeroSlide } from "./HeroCarousel";
import VehicleSelector, { SelectedVehicle } from "./VehicleSelector";
import VehicleForm from "./VehicleForm";

export default function HomeClient({ email }: { email: string }) {
  const [openSelector, setOpenSelector] = useState(false);
  const [selected, setSelected] = useState<SelectedVehicle | null>(null);

  const [slide, setSlide] = useState<HeroSlide | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const [openResults, setOpenResults] = useState(false);

  useEffect(() => {
    if (selected) setOpenResults(true);
  }, [selected]);

  // ESC closes results
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenResults(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <HeroCarousel
        intervalMs={6500}
        onSlide={(s, i) => {
          setSlide(s);
          setSlideIndex(i);
        }}
      />

      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: 18, pointerEvents: "none" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", pointerEvents: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)"
          }}>
            <img src="/mechvi-logo.svg" alt="MechVi" style={{ height: 40 }} />
          </div>

          <div style={{
            padding: "10px 12px", borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            fontSize: 12
          }}>
            Logged in as <b>{email}</b>
          </div>
        </div>
      </div>

      {/* Center hero content */}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 24, pointerEvents: "none" }}>
        <div style={{ width: "min(1020px, 100%)", textAlign: "center", pointerEvents: "auto" }}>
          <div style={{ display: "inline-flex", padding: "7px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", color: "#fff", fontWeight: 900, fontSize: 12, letterSpacing: 0.8, marginBottom: 14 }}>
            {slide?.pill || "MECHVI"}
          </div>

          <div style={{ fontSize: 56, fontWeight: 950, letterSpacing: -1.5, lineHeight: 1.02, color: "#ffffff", textShadow: "0 14px 30px rgba(0,0,0,0.42), 0 2px 10px rgba(0,0,0,0.26)", WebkitTextStroke: "0.6px rgba(0,0,0,0.22)", marginBottom: 10 }}>
            {slide?.headline || "Buy smart. Drive happy."}
          </div>

          <div style={{ fontSize: 18, fontWeight: 650, color: "rgba(255,255,255,0.92)", textShadow: "0 10px 22px rgba(0,0,0,0.30), 0 2px 10px rgba(0,0,0,0.18)", maxWidth: 900, margin: "0 auto 18px" }}>
            {slide?.sub || "Pick your car. Get a verdict in seconds. Learn what to check — even if you know nothing about cars."}
          </div>

          <button
            onClick={() => setOpenSelector(true)}
            style={{ padding: "16px 22px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(0,0,0,0.65)", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: "0 18px 50px rgba(0,0,0,0.25)" }}
          >
            Select your vehicle
          </button>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 999, background: i === slideIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.40)", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }} />
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS OVERLAY (scrollable) */}
      {openResults && (
        <div
          onMouseDown={() => setOpenResults(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "end center",
            padding: 18,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "min(1100px, 100%)",
              maxHeight: "88vh",
              overflow: "auto",
              borderRadius: 22,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(8,8,10,0.88)",
              boxShadow: "0 28px 120px rgba(0,0,0,0.65)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ color: "rgba(255,255,255,0.9)", fontWeight: 950, letterSpacing: -0.3 }}>
                Your Verdict
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => setOpenSelector(true)}
                  style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 900, cursor: "pointer" }}
                >
                  Change vehicle
                </button>

                <button
                  onClick={() => setOpenResults(false)}
                  style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.06)", color: "#fff", fontWeight: 900, cursor: "pointer" }}
                >
                  Back to Home
                </button>
              </div>
            </div>

            <VehicleForm initial={selected || undefined} autoRun="quick" />
            <div style={{ marginTop: 10, opacity: 0.7, color: "#fff", fontSize: 12 }}>
              Tip: press <b>Esc</b> to close.
            </div>
          </div>
        </div>
      )}

      <VehicleSelector
        open={openSelector}
        onClose={() => setOpenSelector(false)}
        onSelect={(v) => {
          setSelected(v);
          setOpenSelector(false);
          setOpenResults(true);
        }}
      />
    </div>
  );
}
