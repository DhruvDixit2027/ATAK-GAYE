import React from "react";
import { ChevronLeft, User, Phone, Bike, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";
import BottomNav from "./BottomNav";

const BACKEND_URL = "http://localhost:5000";

// profilePhoto kabhi purana base64 string ho sakta hai, kabhi naya
// "/uploads/xyz.jpg" relative path — dono cases handle karo
function resolvePhotoUrl(profilePhoto) {
  if (!profilePhoto) return null;
  if (profilePhoto.startsWith("data:")) return profilePhoto; // purana base64
  if (profilePhoto.startsWith("http")) return profilePhoto; // already full URL
  return `${BACKEND_URL}${profilePhoto}`; // naya relative path
}

export default function ProfileScreen() {
  const { user, goTo, logout } = useApp();
  const photoUrl = resolvePhotoUrl(user?.profilePhoto);

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-bg flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-40"
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
              className="w-9 h-9 rounded-xl bg-white dark:bg-card shadow-lg border border-slate-100 dark:border-line flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-slate-700 dark:text-text" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-text">
              Meri Profile
            </div>
          </div>

          {/* Photo dikhao agar hai, warna letter wala fallback */}
          <div className="flex flex-col items-center mt-6 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-card bg-gradient-to-br from-orange-400 to-orange-500">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-white">
                  {user?.name ? user.name[0].toUpperCase() : "?"}
                </span>
              )}
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-text mt-3">
              {user?.name || "—"}
            </div>
          </div>

          {/* Detail cards */}
          <div className="bg-white dark:bg-card rounded-2xl px-4 py-3.5 mb-3 shadow-lg border border-slate-100 dark:border-line flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-card-2 flex items-center justify-center shrink-0">
              <User size={16} className="text-orange-500 dark:text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 dark:text-text-dim">Naam</div>
              <div className="text-sm font-bold text-slate-900 dark:text-text truncate">
                {user?.name || "—"}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl px-4 py-3.5 mb-3 shadow-lg border border-slate-100 dark:border-line flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-card-2 flex items-center justify-center shrink-0">
              <Phone size={16} className="text-orange-500 dark:text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 dark:text-text-dim">Phone number</div>
              <div className="text-sm font-bold text-slate-900 dark:text-text truncate">
                {user?.phone || "—"}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl px-4 py-3.5 mb-5 shadow-lg border border-slate-100 dark:border-line flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-card-2 flex items-center justify-center shrink-0">
              <Bike size={16} className="text-orange-500 dark:text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 dark:text-text-dim">Vehicle</div>
              <div className="text-sm font-bold text-slate-900 dark:text-text capitalize truncate">
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

          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full py-3.5 mt-2.5 rounded-2xl border border-red-200 dark:border-danger/40 bg-white dark:bg-card text-red-500 dark:text-danger text-sm font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout karo
          </button>

          <div className="h-16" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}