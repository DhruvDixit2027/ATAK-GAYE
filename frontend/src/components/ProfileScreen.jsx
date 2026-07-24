import React from "react";
import { useApp } from "../context/AppContext";
import BottomNav from "./BottomNav";   // 👈 naya import

export default function ProfileScreen() {
  const { user, goTo } = useApp();

  return (
    <div className="absolute inset-0 pt-[42px] flex flex-col animate-fadeIn">
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-3">
        <div
          onClick={() => goTo("home")}
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-line flex items-center justify-center cursor-pointer text-base"
        >
          ←
        </div>
        <div className="font-display font-bold text-[19px] font-hindi">Meri Profile</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[100px]">
        <div className="flex flex-col items-center mt-3 mb-6">
          <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-accent to-accent-2 text-[#171009]">
            {user?.name ? user.name[0].toUpperCase() : "?"}
          </div>
          <div className="text-[17px] font-bold mt-2.5">{user?.name || "—"}</div>
        </div>

        <div className="bg-card border border-line rounded-2xl px-4 py-3.5 mb-2.5">
          <div className="text-[11px] text-text-dim font-hindi mb-1">Naam</div>
          <div className="text-[14.5px] font-semibold">{user?.name || "—"}</div>
        </div>

        <div className="bg-card border border-line rounded-2xl px-4 py-3.5 mb-2.5">
          <div className="text-[11px] text-text-dim font-hindi mb-1">Phone number</div>
          <div className="text-[14.5px] font-semibold">{user?.phone || "—"}</div>
        </div>

        <div className="bg-card border border-line rounded-2xl px-4 py-3.5 mb-5">
          <div className="text-[11px] text-text-dim font-hindi mb-1">Vehicle</div>
          <div className="text-[14.5px] font-semibold capitalize">{user?.vehicleType || "—"}</div>
        </div>

        <button
          onClick={() => goTo("editProfile")}
          className="w-full py-[15px] rounded-2xl border-none font-display font-bold text-[15px] text-[#171009]"
          style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
        >
          <span className="font-hindi">Edit karo</span>
        </button>
      </div>

      <BottomNav />   {/* 👈 naya */}
    </div>
  );
}