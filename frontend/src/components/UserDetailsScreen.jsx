import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import BottomNav from "./BottomNav";   // 👈 naya import

export default function UserDetailsScreen({ editMode = false }) {
  const { goTo, user, setUser } = useApp();
  const [name, setName] = useState(editMode && user ? user.name : "");
  const [phone, setPhone] = useState(editMode && user ? user.phone : "");
  const [vehicleType, setVehicleType] = useState(editMode && user ? user.vehicleType : "bike");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editMode && user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setVehicleType(user.vehicleType || "bike");
    }
  }, [editMode, user]);

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
    <div className="absolute inset-0 pt-[42px] flex flex-col px-5">
      <div className="font-display font-bold text-[19px] mt-4 mb-1 font-hindi">
        {editMode ? "Apni profile edit karo" : "Apni details bharo"}
      </div>
      <div className="text-[12px] text-text-dim mb-5 font-hindi">
        {editMode
          ? "Apni details update karo yahan se"
          : "Helper aapko contact kar sake, isliye ye zaroori hai"}
      </div>

      <input
        className="bg-card border border-line rounded-xl px-4 py-3 mb-3 text-[14px]"
        placeholder="Aapka naam"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="bg-card border border-line rounded-xl px-4 py-3 mb-3 text-[14px]"
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <select
        className="bg-card border border-line rounded-xl px-4 py-3 mb-4 text-[14px]"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
      >
        <option value="bike">Bike</option>
        <option value="scooter">Scooter</option>
        <option value="car">Car</option>
        <option value="other">Other</option>
      </select>

      {error && <div className="text-red-400 text-[12px] mb-3">{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-[15px] rounded-2xl border-none font-display font-bold text-[15px] text-[#171009]"
        style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
      >
        {loading ? "Save ho raha hai..." : editMode ? "Save karo" : "Aage badho →"}
      </button>

      {editMode && (
        <button
          onClick={() => goTo(user ? "profile" : "home")}
          className="w-full py-3 mt-2 rounded-2xl border border-line bg-transparent text-text-dim text-[13px]"
        >
          Cancel
        </button>
      )}

      {editMode && <BottomNav />}   {/* 👈 naya */}
    </div>
  );
}