import { useState } from "react";

function HelperRegister({ onRegistered }) {
  const [form, setForm] = useState({
    name: "", phone: "", vehicleType: "", skills: []
  });
  const [loading, setLoading] = useState(false);

  const skillOptions = ["petrol", "mechanic", "tyre", "battery", "tow"];

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/helpers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      // helperId ko save karo taaki refresh pe wapas login na karna pade
      localStorage.setItem("helperId", data._id || data.helperId);
      onRegistered(data._id || data.helperId);
    } catch (err) {
      alert("Registration fail ho gaya, backend check karo");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="register-card">
      <h2>Helper Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Naam"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <select
          value={form.vehicleType}
          onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
          required
        >
          <option value="">Vehicle Type</option>
          <option value="bike">Bike</option>
          <option value="car">Car</option>
          <option value="van">Van</option>
        </select>

        <p>Skills:</p>
        <div className="skills-row">
          {skillOptions.map((skill) => (
            <button
              type="button"
              key={skill}
              className={form.skills.includes(skill) ? "skill-chip active" : "skill-chip"}
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </button>
          ))}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default HelperRegister;