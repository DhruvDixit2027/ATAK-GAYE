import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { ISSUES } from "../data/helperPool";
import { getCurrentLocation, getAddressFromCoords } from "../utils";
import BottomNav from "./BottomNav";

export default function HomeScreen() {
  const { goTo, setSelectedIssue, showToast } = useApp();

  // 👇 NAYA: current location ka short address yahan store hoga
  const [locationLabel, setLocationLabel] = useState("Location le rahe hain...");

  useEffect(() => {
    async function fetchLocation() {
      try {
        const loc = await getCurrentLocation();
        const address = await getAddressFromCoords(loc.lat, loc.lng);
        // Poora address bahut lamba hota hai, top bar ke liye chhota rakho —
        // pehle 2 comma-separated parts hi lo (jaise "NH-27, Lucknow")
        const shortAddress = address.split(",").slice(0, 2).join(",").trim();
        setLocationLabel(shortAddress || "Location mil gayi");
      } catch (err) {
        console.error("Location fetch failed:", err);
        setLocationLabel("Location available nahi");
      }
    }
    fetchLocation();
  }, []);

  const openIssue = (id) => {
    setSelectedIssue(id);
    goTo("issues");
  };

  return (
    <div className="absolute inset-0 pt-[42px] flex flex-col animate-fadeIn">
      {/* Top bar */}
      <div className="px-5 pt-3.5 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-sm font-extrabold text-[#111]">
            A
          </div>
          <div className="font-display font-bold text-lg text-text">Atak Gaye</div>
        </div>
        <div className="text-xs text-text-dim flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-safe shadow-[0_0_0_3px_rgba(46,204,113,0.2)]" />
          {locationLabel}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[100px]">
        <div className="my-2.5 mb-4">
          <div className="text-text-dim text-sm font-hindi">Namaste, Rohit</div>
          <h2 className="font-display font-bold text-2xl mt-0.5 text-text font-hindi">
            Kahin phas gaye? Hum hain na.
          </h2>
        </div>
        {/* Map card */}
<div className="h-[150px] rounded-card map-glow border border-line relative overflow-hidden mb-5">
  <svg viewBox="0 0 400 150" className="absolute inset-0 w-full h-full">
    <path
      d="M0,110 C80,90 140,130 220,95 C300,60 340,80 400,60"
      stroke="#3a4250"
      strokeWidth="4"
      fill="none"
    />
    {/* Pulsing rings — Google Maps jaisa live location effect */}
    <circle cx="220" cy="95" r="6" fill="#FF6A3D" />
    <circle cx="220" cy="95" r="6" fill="#FF6A3D" className="animate-locationPulse" />
    <circle cx="220" cy="95" r="6" fill="#FF6A3D" className="animate-locationPulse" style={{ animationDelay: "0.7s" }} />
  </svg>
  <div className="absolute bottom-3.5 left-4 bg-[#0B0D10bf] px-2.5 py-1.5 rounded-lg text-[11px] text-text-dim border border-line font-hindi">
    📍 Live location shared for faster help
  </div>
</div>

        {/* SOS */}
        <div className="flex flex-col items-center mb-6 mt-2">
          <button
            onClick={() => openIssue(null)}
            className="relative w-[150px] h-[150px] rounded-full text-white font-display font-bold text-2xl tracking-wide border-none cursor-pointer shadow-[0_8px_30px_rgba(255,71,87,0.45)]"
            style={{ background: "radial-gradient(circle at 35% 30%, #ff8a5c, #FF4757 70%)" }}
          >
            SOS
            <span className="absolute inset-0 rounded-full border-2 border-[rgba(255,71,87,0.5)] animate-ring" />
            <span
              className="absolute inset-0 rounded-full border-2 border-[rgba(255,71,87,0.5)] animate-ring"
              style={{ animationDelay: "1.1s" }}
            />
          </button>
          <div className="mt-3.5 text-[12.5px] text-text-dim text-center leading-relaxed font-hindi">
            Emergency ho to seedha dabao — <b className="text-text">24×7 madad</b>, kisi bhi waqt
          </div>
        </div>

        <div className="text-[13px] text-text-dim uppercase tracking-wider mb-3 font-hindi">Turant Madad</div>
        <div className="grid grid-cols-2 gap-3 mb-[22px]">
          {ISSUES.slice(0, 4).map((it) => (
            <div
              key={it.id}
              onClick={() => openIssue(it.id)}
              className="bg-card border border-line rounded-card p-4 cursor-pointer transition-transform active:scale-[0.97] hover:border-accent"
            >
              <span className="text-[22px] mb-2.5 block">{it.emoji}</span>
              <div className="text-[15px] font-semibold mb-0.5 text-text font-hindi">{it.name}</div>
              <div className="text-[11.5px] text-text-dim font-hindi">{it.sub}</div>
            </div>
          ))}
        </div>

        <div className="text-[13px] text-text-dim uppercase tracking-wider mb-3 font-hindi">Helpline</div>
        <div className="flex items-center justify-between bg-card-2 border border-dashed border-line rounded-card px-4 py-3.5 mb-2.5">
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">Highway Patrol se seedhi baat</div>
            <div className="text-[11.5px] text-text-dim mt-0.5 font-hindi">Bade accident ya chot lagi ho to</div>
          </div>
          <button
            onClick={() => showToast("📞 Dialing 1073 Highway Helpline...")}
            className="bg-safe text-[#0B0D10] rounded-xl px-4 py-2 font-bold text-[12.5px] border-none cursor-pointer"
          >
            Call
          </button>
        </div>
        <div className="text-center text-[#5a6472] text-xs mt-4 font-hindi">
          Har request live track hoti hai — aap akela nahi hain.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}