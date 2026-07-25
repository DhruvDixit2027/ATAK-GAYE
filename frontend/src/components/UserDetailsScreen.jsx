import React, { useEffect, useState } from "react";
import { ChevronLeft, User, Phone, Bike, Camera } from "lucide-react";
import { useApp } from "../context/AppContext";
import BottomNav from "./BottomNav";

export default function UserDetailsScreen({ editMode = false }) {
  const { goTo, user, setUser } = useApp();
  const [name, setName] = useState(editMode && user ? user.name : "");
  const [phone, setPhone] = useState(editMode && user ? user.phone : "");
  const [vehicleType, setVehicleType] = useState(editMode && user ? user.vehicleType : "bike");
  const [photoPreview, setPhotoPreview] = useState(editMode && user ? user.profilePhoto : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editMode && user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setVehicleType(user.vehicleType || "bike");
      setPhotoPreview(user.profilePhoto || null);
    }
  }, [editMode, user]);

  // 👇 NAYA: photo select hone par usko base64 mein convert karke preview dikhao
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Photo 2MB se chhoti honi chahiye");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result); // base64 string
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Naam aur phone number dono zaroori hai");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const url = editMode
        ? `http://localhost:5000/api/users/${user._id}`
        : "http://localhost:5000/api/users/create";
      const method = editMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          profilePhoto: photoPreview,   // 👈 NAYA
          currentLocation: user?.currentLocation || { lat: 26.4499, lng: 80.3319 },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kuch galat ho gaya");
        setLoading(false);
        return;
      }

      setUser(data);
      if (!editMode) goTo("home");
      else goTo("profile");
    } catch (err) {
      console.error("User save karne mein error:", err);
      setError("Backend se connect nahi ho paya");
      setLoading(false);
    }
  };

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
          <div className="flex items-center gap-3 mb-1">
            {editMode && (
              <div
                onClick={() => goTo(user ? "profile" : "home")}
                className="w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center cursor-pointer active:scale-95 transition-transform shrink-0"
              >
                <ChevronLeft size={18} className="text-slate-700" />
              </div>
            )}
            <div className="text-lg sm:text-xl font-black text-slate-900">
              {editMode ? "Apni profile edit karo" : "Apni details bharo"}
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 mb-5 ml-0.5">
            {editMode
              ? "Apni details update karo yahan se"
              : "Helper aapko contact kar sake, isliye ye zaroori hai"}
          </div>

          {/* 👇 NAYA: Photo upload */}
          <div className="flex flex-col items-center mb-5">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl ring-4 ring-white bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-white">
                    {name ? name[0].toUpperCase() : "?"}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center group-active:scale-90 transition-transform">
                <Camera size={13} className="text-orange-500" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            <div className="text-[11px] text-slate-400 mt-2">
              Photo lagane ke liye tap karo
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-100">
            <div className="mb-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1.5 ml-1">
                <User size={13} className="text-orange-500" /> Naam
              </div>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="Aapka naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1.5 ml-1">
                <Phone size={13} className="text-orange-500" /> Phone number
              </div>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="mb-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1.5 ml-1">
                <Bike size={13} className="text-orange-500" /> Vehicle
              </div>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs font-medium mt-3 ml-1">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 mt-5 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl active:scale-95 transition-transform disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
          >
            {loading ? "Save ho raha hai..." : editMode ? "Save karo" : "Aage badho →"}
          </button>

          {editMode && (
            <button
              onClick={() => goTo(user ? "profile" : "home")}
              className="w-full py-3 mt-2.5 rounded-2xl border border-slate-200 bg-white text-slate-500 text-sm font-semibold shadow-sm active:scale-95 transition-transform"
            >
              Cancel
            </button>
          )}

          <div className="h-16" />
        </div>
      </div>

      {editMode && <BottomNav />}
    </div>
  );
}