import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import { BACKEND_URL } from "../config";
import './TrackingScreen.css';
const ISSUE_ICONS = { petrol: '⛽', mechanic: '🔧', tyre: '🛞', battery: '🔋', tow: '🚛' };

export default function TrackingScreen({ job, onComplete }) {
  const { issueType, userLocation } = job;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${userLocation.lat},${userLocation.lng}`;

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  // OTP input UI ke liye state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!job._id) {
      console.warn('job._id missing — location broadcast nahi ho payegi');
      return;
    }

    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          socket.emit('helper:location', {
            requestId: job._id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error('Location watch error:', err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socket.disconnect();
    };
  }, [job._id]);

  // Customer se liya OTP backend ko bhejta hai verify karne ke liye
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError("OTP daalo pehle");
      return;
    }
    setVerifying(true);
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/requests/${job._id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP galat hai, dubara try karo");
        setVerifying(false);
        return;
      }

      onComplete();
    } catch (err) {
      console.error("OTP verify karne mein error:", err);
      setError("Backend se connect nahi ho paya");
      setVerifying(false);
    }
  };

  return (
    <div className="tracking-screen">
      {/* Video background - place your file at public/tow-truck-bg.mp4 */}
      <video
        className="tracking-video-bg"
        src="/tow-truck-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="tracking-overlay" />

      <div className="tracking-card">
        <div className="tracking-icon">{ISSUE_ICONS[issueType] || '❓'}</div>
        <h2>{issueType.charAt(0).toUpperCase() + issueType.slice(1)} Job — In Progress</h2>
        <p className="tracking-sub">Customer ki location:</p>
        <p className="tracking-coords">📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>

        {/* Tow truck driving animation */}
        <div className="tracking-road-wrap">
          <div className="tracking-road-line" />
          <div className="tracking-truck">🚛</div>
        </div>

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="navigate-btn">
          🧭 Navigate on Google Maps
        </a>

        {!showOtpInput ? (
          <button className="complete-btn" onClick={() => setShowOtpInput(true)}>
            Mark Job Complete
          </button>
        ) : (
          <div style={{ marginTop: "16px" }}>
            <p style={{ fontSize: "13px", marginBottom: "8px", color: "#fff", fontWeight: 600 }}>
              Customer se OTP maango aur yahan daalo:
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="4-digit OTP"
              maxLength={4}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.15)",
                fontSize: "18px",
                letterSpacing: "4px",
                textAlign: "center",
                marginBottom: "10px",
                color: "#fff",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ color: "#ffb3b3", fontSize: "12px", marginBottom: "10px", fontWeight: 600 }}>{error}</p>
            )}
            <button
              className="complete-btn"
              onClick={handleVerifyOtp}
              disabled={verifying}
            >
              {verifying ? "Verify ho raha hai..." : "OTP Verify Karo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}