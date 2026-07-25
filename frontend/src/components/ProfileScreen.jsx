import React from "react";
import { ChevronLeft, User, Phone, Bike } from "lucide-react";
import { useApp } from "../context/AppContext";
import BottomNav from "./BottomNav";

export default function ProfileScreen() {
  const { user, goTo } = useApp();

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top,#FFF2E9 0%,transparent 45%)",
        }}
      />

      <div className="relative flex-1 overflow-y-auto pb-24">
        <div className="px-4 sm:px-5 pt-5 sm:pt-6 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => goTo("home")}
              className="w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-slate-700" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900">
              Meri Profile
            </div>
          </div>

          {/* 👇 NAYA: Photo dikhao agar hai, warna letter wala fallback */}
          <div className="flex flex-col items-center mt-6 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xl ring-4 ring-white bg-gradient-to-br from-orange-400 to-orange-500">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-white">
                  {user?.name ? user.name[0].toUpperCase() : "?"}
                </span>
              )}
            </div>
            <div className="text-lg font-black text-slate-900 mt-3">
              {user?.name || "—"}
            </div>
          </div>

          {/* Detail cards */}
          <div className="bg-white rounded-2xl px-4 py-3.5 mb-3 shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <User size={16} className="text-orange-500" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500">Naam</div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {user?.name || "—"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl px-4 py-3.5 mb-3 shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Phone size={16} className="text-orange-500" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500">Phone number</div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {user?.phone || "—"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl px-4 py-3.5 mb-5 shadow-lg border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Bike size={16} className="text-orange-500" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500">Vehicle</div>
              <div className="text-sm font-bold text-slate-900 capitalize truncate">
                {user?.vehicleType || "—"}
              </div>
            </div>
          </div>

          <button
            onClick={() => goTo("editProfile")}
            className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl active:scale-95 transition-transform"
            style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
          >
            Edit karo
          </button>

          <div className="h-16" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}