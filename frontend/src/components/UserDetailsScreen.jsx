import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function UserDetailsScreen() {
  const { goTo, setUser } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("bike");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Naam aur phone number dono zaroori hai");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          currentLocation: { lat: 26.4499, lng: 80.3319 }, // abhi ke liye hardcoded
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kuch galat ho gaya");
        setLoading(false);
        return;
      }

      setUser(data); // context + localStorage dono mein save ho jaayega
      goTo("home");
    } catch (err) {
      console.error("User create karne mein error:", err);
      setError("Backend se connect nahi ho paya");
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 pt-[42px] flex flex-col px-5">
      <div className="font-display font-bold text-[19px] mt-4 mb-1 font-hindi">
        Apni details bharo
      </div>
      <div className="text-[12px] text-text-dim mb-5 font-hindi">
        Helper aapko contact kar sake, isliye ye zaroori hai
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
        {loading ? "Save ho raha hai..." : "Aage badho →"}
      </button>
    </div>
  );
}