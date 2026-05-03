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
      <div className="mechvi-safe-pad" style={{ position: "absolute", top: 0, left: 0, right: 0, paddingBottom: 12, pointerEvents: "none" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", pointerEvents: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
          }}>
            <img src="/mechvi-logo.svg" alt="MechVi" className="mechvi-home-logo" />
          </div>

          <div style={{
            padding: "10px 14px", borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            color: "#fff",
            fontSize: "clamp(11px, 2.8vw, 12px)",
            lineHeight: 1.35,
            maxWidth: "min(100%, 280px)",
            wordBreak: "break-word",
          }}>
            Logged in as <b>{email}</b>
          </div>
        </div>
      </div>

      {/* Center hero content */}
      <div className="mechvi-safe-pad" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingTop: "clamp(88px, 22vw, 108px)", paddingBottom: 28, pointerEvents: "none" }}>
        <div style={{ width: "min(1020px, 100%)", textAlign: "center", pointerEvents: "auto" }}>
          <div style={{ display: "inline-flex", padding: "7px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", color: "#fff", fontWeight: 900, fontSize: "clamp(10px, 2.6vw, 12px)", letterSpacing: 0.8, marginBottom: 14 }}>
            {slide?.pill || "MECHVI"}
          </div>

          <div style={{
            fontSize: "clamp(1.85rem, 5vw + 0.75rem, 3.5rem)",
            fontWeight: 950,
            letterSpacing: -1.5,
            lineHeight: 1.05,
            color: "#ffffff",
            textShadow: "0 14px 30px rgba(0,0,0,0.42), 0 2px 10px rgba(0,0,0,0.26)",
            WebkitTextStroke: "0.6px rgba(0,0,0,0.22)",
            marginBottom: 12,
            paddingInline: 4,
          }}>
            {slide?.headline || "Buy smart. Drive happy."}
          </div>

          <div style={{
            fontSize: "clamp(0.95rem, 2.2vw + 0.55rem, 1.125rem)",
            fontWeight: 650,
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 10px 22px rgba(0,0,0,0.30), 0 2px 10px rgba(0,0,0,0.18)",
            maxWidth: 900,
            margin: "0 auto 20px",
            paddingInline: 8,
            lineHeight: 1.45,
          }}>
            {slide?.sub || "Pick your car. Get a verdict in seconds. Learn what to check — even if you know nothing about cars."}
          </div>

          <button
            type="button"
            onClick={() => setOpenSelector(true)}
            style={{
              padding: "15px 22px",
              minHeight: 48,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "clamp(15px, 3.5vw, 16px)",
              cursor: "pointer",
              boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
              width: "min(100%, 340px)",
            }}
          >
            Select your vehicle
          </button>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === slideIndex ? 12 : 10,
                  height: i === slideIndex ? 12 : 10,
                  borderRadius: 999,
                  background: i === slideIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.40)",
                  boxShadow: i === slideIndex ? "0 0 0 2px rgba(251,191,36,0.45)" : "0 6px 18px rgba(0,0,0,0.18)",
                  transition: "width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS OVERLAY (scrollable) */}
      {openResults && (
        <div
          onMouseDown={() => setOpenResults(false)}
          className="mechvi-safe-pad mechvi-safe-pad-bottom"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "grid",
            placeItems: "end center",
            paddingTop: 12,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "min(1100px, 100%)",
              maxHeight: "min(88vh, 88dvh)",
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
              borderRadius: "clamp(14px, 3vw, 22px)",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(8,8,10,0.88)",
              boxShadow: "0 28px 120px rgba(0,0,0,0.65)",
              padding: "clamp(12px, 3vw, 16px)",
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
