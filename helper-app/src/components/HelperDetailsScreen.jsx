import React, { useState } from "react";
import { BACKEND_URL } from "../config";

const SKILL_OPTIONS = [
  { value: "petrol", label: "Petrol" },
  { value: "mechanic", label: "Mechanic" },
  { value: "tyre", label: "Tyre / Puncture" },
  { value: "battery", label: "Battery" },
  { value: "tow", label: "Tow" },
];

export default function HelperDetailsScreen({ onRegistered }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [skillTypes, setSkillTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (value) => {
    setSkillTypes((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !vehicleType.trim() || !vehicleNumber.trim() || skillTypes.length === 0) {
      setError("Sab fields bharo, aur kam se kam ek skill chuno");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/helpers/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          vehicleNumber,
          skillTypes,
          currentLocation: { lat: 26.8500, lng: 80.9450 }, // abhi ke liye hardcoded
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kuch galat ho gaya");
        setLoading(false);
        return;
      }

      localStorage.setItem("atakGayeHelper", JSON.stringify(data));
      onRegistered(data);
    } catch (err) {
      console.error("Helper create karne mein error:", err);
      setError("Backend se connect nahi ho paya");
      setLoading(false);
    }
  };

  return (
    <div className="helper-details-screen" style={{ maxWidth: 420, margin: "40px auto", padding: "0 20px" }}>
      <h2 style={{ marginBottom: 4 }}>Apni details bharo</h2>
      <p style={{ color: "#8a93a3", marginBottom: 20, fontSize: 13 }}>
        Customers ko contact karne aur requests milne ke liye ye zaroori hai
      </p>

      <input
        style={inputStyle}
        placeholder="Aapka naam"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Vehicle type (jaise Bajaj Pulsar)"
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Vehicle number (jaise UP32 XX 1234)"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#8a93a3", marginBottom: 8 }}>Aap kaunsi service dete ho? (ek ya zyada)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SKILL_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleSkill(s.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                border: skillTypes.includes(s.value) ? "1px solid #FF6A3D" : "1px solid #2a2f3a",
                background: skillTypes.includes(s.value) ? "rgba(255,106,61,0.15)" : "transparent",
                color: skillTypes.includes(s.value) ? "#FF6A3D" : "#c8ccd4",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: "#ff6b6b", fontSize: 12, marginBottom: 12 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "none",
          fontWeight: 700,
          fontSize: 15,
          color: "#171009",
          background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)",
          cursor: "pointer",
        }}
      >
        {loading ? "Save ho raha hai..." : "Aage badho →"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: 12,
  borderRadius: 12,
  border: "1px solid #2a2f3a",
  background: "#171b22",
  color: "#e8eaee",
  fontSize: 14,
};