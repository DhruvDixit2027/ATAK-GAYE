import React, { useState } from "react";
import { Lock, ShieldCheck, Sun, Moon } from "lucide-react";
import { BACKEND_URL } from "./config";

export default function LoginScreen({ onLogin, theme, toggleTheme }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      setError("Password daalo");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("atakGayeAdminAuth", "true");
        onLogin();
      } else {
        setError(data.error || "Password galat hai");
      }
    } catch (err) {
      setError("Backend se connect nahi ho paya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors">
      {/* Theme toggle button — top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm transition-colors"
      >
        {theme === "dark" ? (
          <Sun size={16} className="text-yellow-400" />
        ) : (
          <Moon size={16} className="text-slate-600" />
        )}
      </button>

      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={26} className="text-orange-500" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white text-center">
          Atak Gaye Admin
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1 mb-6">
          Password daal ke login karo
        </p>

        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Admin password"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-xs mt-2">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors disabled:opacity-60"
        >
          {loading ? "Check ho raha hai..." : "Login"}
        </button>
      </div>
    </div>
  );
}