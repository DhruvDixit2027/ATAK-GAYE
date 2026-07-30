import React, { useState, useRef } from "react";
import { Phone, ShieldCheck, ArrowLeft, RotateCw, WifiOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import LoginIllustration from "./LoginIllustration";

import { BACKEND_URL } from "../config"; 
const REQUEST_TIMEOUT_MS = 25000; // 25 sec se zyada wait nahi karenge

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function LoginScreen() {
  const { setUser, setVerifiedPhone } = useApp();

  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(""); // 👈 testing mode: OTP screen pe dikhane ke liye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [slowServer, setSlowServer] = useState(false); // 👈 backend "jaag" raha hai to batane ke liye
  const slowTimerRef = useRef(null);

  const startSlowTimer = () => {
    setSlowServer(false);
    slowTimerRef.current = setTimeout(() => setSlowServer(true), 6000);
  };
  const stopSlowTimer = () => {
    clearTimeout(slowTimerRef.current);
    setSlowServer(false);
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.trim().length < 6) {
      setError("Sahi phone number daalo");
      setIsNetworkError(false);
      return;
    }
    setLoading(true);
    setError("");
    setIsNetworkError(false);
    startSlowTimer();

    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        setError((data && data.error) || `Kuch galat ho gaya (error ${res.status})`);
        setLoading(false);
        stopSlowTimer();
        return;
      }

      setDevOtp(data.otp || ""); // testing mode ka OTP
      setStep("otp");
      setLoading(false);
      stopSlowTimer();
    } catch (err) {
      console.error("OTP bhejne mein error:", err);
      setError(
        err.name === "AbortError"
          ? "Server response nahi de raha, dubara try karo"
          : "Network check karo aur dubara try karo"
      );
      setIsNetworkError(true);
      setLoading(false);
      stopSlowTimer();
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP daalo");
      setIsNetworkError(false);
      return;
    }
    setLoading(true);
    setError("");
    setIsNetworkError(false);
    startSlowTimer();

    try {
      const res = await fetchWithTimeout(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        setError((data && data.error) || `Kuch galat ho gaya (error ${res.status})`);
        setLoading(false);
        stopSlowTimer();
        return;
      }

      if (data.exists) {
        // Purana user hai — seedha login kar do
        setUser(data.user);
      } else {
        // Naya number hai — registration screen pe bhej do
        setVerifiedPhone(phone.trim());
      }
      setLoading(false);
      stopSlowTimer();
    } catch (err) {
      console.error("OTP verify karne mein error:", err);
      setError(
        err.name === "AbortError"
          ? "Server response nahi de raha, dubara try karo"
          : "Network check karo aur dubara try karo"
      );
      setIsNetworkError(true);
      setLoading(false);
      stopSlowTimer();
    }
  };

  const handleRetry = () => {
    if (step === "phone") handleSendOtp();
    else handleVerifyOtp();
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setDevOtp("");
    setError("");
    setIsNetworkError(false);
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at top,#FFF2E9 0%,transparent 45%)",
        }}
      />

      <div className="relative flex-1 overflow-y-auto flex flex-col justify-center">
        <div className="px-5 max-w-md mx-auto w-full">
          {/* Illustration / heading */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-full max-w-[320px]">
              <LoginIllustration />
            </div>
            <div className="text-xl font-black text-slate-900">Atak Gaye</div>
            <div className="text-xs text-slate-500 mt-1">
              {step === "phone" ? "Login karne ke liye phone number daalo" : "OTP daalke verify karo"}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-100">
            {step === "phone" ? (
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1.5 ml-1">
                  <Phone size={13} className="text-orange-500" /> Phone number
                </div>
                <input
                  type="tel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="10 digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <button
                  onClick={handleBackToPhone}
                  className="flex items-center gap-1 text-xs text-slate-500 font-semibold mb-3"
                >
                  <ArrowLeft size={13} /> Number badlo
                </button>

                {devOtp && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4 text-center">
                    <div className="text-[11px] text-slate-500 mb-1">
                      Testing mode — tumhara OTP:
                    </div>
                    <div className="text-2xl font-black tracking-widest text-orange-600">
                      {devOtp}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-1.5 ml-1">
                  <ShieldCheck size={13} className="text-orange-500" /> OTP daalo
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all tracking-widest text-center text-lg font-bold"
                  placeholder="6 digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
          </div>

          {loading && slowServer && (
            <div className="flex items-center gap-2 text-[11px] text-orange-600 font-medium mt-3 ml-1">
              <RotateCw size={12} className="animate-spin" />
              Server jaag raha hai, thoda ruko...
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-2 mt-3 ml-1">
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
                {isNetworkError && <WifiOff size={13} />}
                {error}
              </div>
              {isNetworkError && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg"
                >
                  <RotateCw size={11} /> Dubara try karo
                </button>
              )}
            </div>
          )}

          <button
            onClick={step === "phone" ? handleSendOtp : handleVerifyOtp}
            disabled={loading}
            className="w-full py-3.5 mt-5 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl active:scale-95 transition-transform disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
          >
            {loading
              ? "Ruko zara..."
              : step === "phone"
              ? "OTP bhejo"
              : "Verify karo"}
          </button>
        </div>
      </div>
    </div>
  );
}