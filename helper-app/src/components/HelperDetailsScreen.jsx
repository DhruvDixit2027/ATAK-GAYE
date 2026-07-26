import React, { useState } from "react";
import "./HelperDetailsScreen.css";

const SKILL_OPTIONS = [
  { value: "petrol", label: "Petrol" },
  { value: "mechanic", label: "Mechanic" },
  { value: "tyre", label: "Tyre / Puncture" },
  { value: "battery", label: "Battery" },
  { value: "tow", label: "Tow" },
];

const VEHICLE_TYPES = [
  "Bike",
  "Scooter",
  "Scooty",
  "Car",
  "Van",
  "Auto Rickshaw",
  "Truck",
  "Tempo",
  "Tractor",
  "JCB",
  "Other",
];

export default function HelperDetailsScreen({ onRegistered, initialPhone = "" }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(initialPhone);
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
      const res = await fetch("http://10.177.130.146:5000/api/helpers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          vehicleNumber,
          skillTypes,
          currentLocation: { lat: 26.8500, lng: 80.9450 },
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
    <div className="details-screen">
      <img src="/mascot.jpeg" alt="" className="details-bg-mascot" />
      <div className="details-bg-overlay" />

      <div className="details-content">
        <div className="details-header">
          <div className="details-logo"><span>A</span></div>
          <h2 className="details-title">Apni details bharo</h2>
          <p className="details-subtitle">
            Customers ko contact karne aur requests milne ke liye ye zaroori hai
          </p>
        </div>

        <div className="details-card">
          <div className="details-form">
            <div className="field-group">
              <label className="field-label">Aapka naam</label>
              <input
                className="field-input"
                placeholder="Jaise Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Phone number</label>
              <input
                className="field-input"
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Vehicle type</label>
                <select
                  className="field-input field-select"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="" disabled>Select vehicle</option>
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Vehicle number</label>
                <input
                  className="field-input"
                  placeholder="UP32 XX 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="skills-section">
              <div className="field-label">Aap kaunsi service dete ho? (ek ya zyada)</div>
              <div className="skills-grid">
                {SKILL_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSkill(s.value)}
                    className={`skill-chip ${skillTypes.includes(s.value) ? "active" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="details-error">{error}</div>}
          </div>
        </div>
      </div>

      <div className="details-footer">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="details-submit-btn"
        >
          {loading ? "Save ho raha hai..." : "Aage badho →"}
        </button>
      </div>
    </div>
  );
}