import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Phone, MessageCircle, X, Navigation2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "../context/AppContext";
import { BACKEND_URL } from "../config";

// Leaflet default icon bundler issue fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const helperIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper move hone par map ko dono markers ke beech me fit karega
function FitBounds({ userPos, helperPos }) {
  const map = useMap();
  useEffect(() => {
    if (userPos && helperPos) {
      map.fitBounds([userPos, helperPos], { padding: [60, 60] });
    } else if (userPos) {
      map.setView(userPos, 15);
    }
  }, [userPos, helperPos, map]);
  return null;
}

const DEFAULT_WINNER = {
  name: "Ravi Kumar",
  init: "RK",
  vehicle: "Bajaj Pulsar · MP09 XX 4521",
  etaMin: 6,
  rating: 4.8,
};

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TrackingScreen() {
  const { goTo, winner, showToast, currentRequestId, user, liveLocation } = useApp();
  const w = winner || DEFAULT_WINNER;
  const firstName = w.name.split(" ")[0];

  const [arrived, setArrived] = useState(false);
  const [requestStatus, setRequestStatus] = useState(
    currentRequestId ? "pending" : "accepted"
  );

  const [requestDetails, setRequestDetails] = useState(null);
  const [liveDistanceKm, setLiveDistanceKm] = useState(w.distanceKm ?? null);
  const [helperPos, setHelperPos] = useState(null); // [lat, lng]
  const initialDistanceRef = useRef(w.distanceKm ?? null);
  const socketRef = useRef(null);

  const userPos = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : null;

  useEffect(() => {
    if (!currentRequestId) return;
    async function fetchDetails() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/requests/${currentRequestId}`);
        const data = await res.json();
        setRequestDetails(data);
      } catch (err) {
        console.error("Request details fetch karne mein error:", err);
      }
    }
    fetchDetails();
  }, [currentRequestId]);

  useEffect(() => {
    if (!currentRequestId) return;

    const socket = io(BACKEND_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join:request", currentRequestId);

    socket.on("status:update", ({ status }) => {
      setRequestStatus(status);
      if (status === "completed") {
        showToast(`✅ Job complete ho gaya!`);
        setTimeout(() => goTo("done"), 1200);
      }
    });

    socket.on("location:update", ({ lat, lng }) => {
      setHelperPos([lat, lng]);

      if (!liveLocation) return;
      const dist = getDistanceKm(
        liveLocation.lat,
        liveLocation.lng,
        lat,
        lng
      );
      setLiveDistanceKm(Number(dist.toFixed(1)));

      if (initialDistanceRef.current == null || initialDistanceRef.current === 0) {
        initialDistanceRef.current = dist || 0.1;
      }

      if (dist <= 0.05 && !arrived) {
        setArrived(true);
        showToast(`🟢 ${w.name} pahunch gaya hai — OTP share karein`);
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRequestId]);

  const etaText = arrived
    ? 0
    : liveDistanceKm != null
    ? Math.max(1, Math.round(liveDistanceKm * 2.5))
    : w.etaMin;

  const realOtp = requestDetails?.otp || "----";
  const helperPhone = requestDetails?.helperId?.phone || null;
  const helperVehicleNumber = requestDetails?.helperId?.vehicleNumber || null;

  if (requestStatus === "pending") {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center px-8 text-center">
        <style>{`
          @keyframes softPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } }
          .soft-pulse { animation: softPulse 1.8s ease-in-out infinite; }
        `}</style>
        <div className="soft-pulse w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
          <div className="w-9 h-9 rounded-full border-[3px] border-orange-400 border-t-transparent animate-spin" />
        </div>
        <div className="text-lg font-black text-slate-900 mb-2">
          Helper ka jawab ka wait kar rahe hain...
        </div>
        <div className="text-sm text-slate-500 max-w-xs">
          Aapki request bhej di gayi hai. Jaise hi helper accept karega, tracking shuru ho jaayegi.
        </div>
      </div>
    );
  }

  if (requestStatus === "rejected") {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-5xl mb-4">😔</div>
        <div className="text-lg font-black text-slate-900 mb-2">
          Helper ne request reject kar di
        </div>
        <div className="text-sm text-slate-500 mb-6 max-w-xs">
          Koi baat nahi — dusra helper dhundte hain aapke liye.
        </div>
        <button
          onClick={() => goTo("issues")}
          className="px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-xl active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
        >
          Dusra Helper Dhundo
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes dotPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(46,204,113,0.5); } 50% { box-shadow: 0 0 0 6px rgba(46,204,113,0); } }
        .dot-pulse { animation: dotPulse 1.6s ease-in-out infinite; }
        .leaflet-container { background: #e5e7eb; }
      `}</style>

      {/* REAL MAP SECTION — fake SVG ki jagah ab yahan asli Leaflet + OpenStreetMap map hai */}
      <div className="relative h-[240px] overflow-hidden bg-slate-200">
        {userPos ? (
          <MapContainer
            center={userPos}
            zoom={15}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />

            <Marker position={userPos} icon={userIcon}>
              <Popup>Aap yahan hain</Popup>
            </Marker>

            {helperPos && (
              <Marker position={helperPos} icon={helperIcon}>
                <Popup>{firstName} yahan hai</Popup>
              </Marker>
            )}

            {userPos && helperPos && (
              <Polyline
                positions={[helperPos, userPos]}
                pathOptions={{ color: "#FF6A3D", weight: 4, dashArray: "6 8" }}
              />
            )}

            <FitBounds userPos={userPos} helperPos={helperPos} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
            Location la rahe hain...
          </div>
        )}

        <div className="absolute top-3 left-3 right-14 bg-white px-3.5 py-2 rounded-2xl text-xs shadow-lg flex items-center gap-1.5 z-[1000] max-w-fit">
          <Navigation2 size={14} className="text-orange-500 shrink-0" />
          Pahunchne mein{" "}
          <b className="text-orange-500 text-sm">{arrived ? "aa gaya!" : `${etaText} min`}</b>
          {liveDistanceKm != null && !arrived && (
            <span className="text-slate-400"> · {liveDistanceKm} km</span>
          )}
        </div>

        <div
          onClick={() => goTo("home")}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform z-[1000]"
        >
          <X size={16} className="text-slate-700" />
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto pb-6">
        <div className="px-4 sm:px-5 max-w-md mx-auto w-full">
          <div className="fade-in-up inline-flex items-center gap-1.5 text-[10.5px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full mt-3 mb-3">
            🤖 AI ne is helper ko sabse best match chuna
          </div>

          <div className="fade-in-up bg-white rounded-2xl p-4 shadow-lg border border-slate-100" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shrink-0">
                {w.init}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-black text-slate-900 truncate">{w.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  ⭐ {w.rating} · {w.vehicle}
                </div>
                {helperVehicleNumber && (
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    🔢 {helperVehicleNumber}
                  </div>
                )}
              </div>
              {liveDistanceKm != null && (
                <div className="shrink-0 text-right">
                  <div className="text-sm font-black text-orange-500">{liveDistanceKm} km</div>
                  <div className="text-[9px] text-slate-400">door</div>
                </div>
              )}
            </div>
            <div className="flex gap-2.5 mt-4">
              <div
                onClick={() => showToast("💬 Chat khul gayi (demo)")}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform text-slate-700"
              >
                <MessageCircle size={16} /> Chat
              </div>

              <a href={helperPhone ? `tel:${helperPhone}` : undefined}
                onClick={() => !helperPhone && showToast("📞 Phone number nahi mila")}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform no-underline"
              >
                <Phone size={16} /> Call
              </a>
            </div>
          </div>

          <div className="fade-in-up bg-orange-50 border border-dashed border-orange-300 rounded-2xl px-4 py-3.5 mt-3 flex items-center justify-between" style={{ animationDelay: "0.1s" }}>
            <div className="text-xs text-orange-700 font-medium">Helper ko yeh OTP dikhaayein</div>
            <div className="text-2xl font-black tracking-[6px] text-orange-500">{realOtp}</div>
          </div>

          <div className="fade-in-up mt-5" style={{ animationDelay: "0.15s" }}>
            <div className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <div className="w-0.5 flex-1 bg-green-500 my-1" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Request confirm ho gayi</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Just now</div>
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${arrived ? "bg-green-500" : "bg-orange-400"}`} />
                <div className={`w-0.5 flex-1 my-1 ${arrived ? "bg-green-500" : "bg-slate-200"}`} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{firstName} aapki taraf aa raha hai</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {arrived ? `${firstName} pahunch gaya!` : `ETA ${etaText} min`}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Madad complete</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {arrived ? "Helper OTP verify karega" : "Pending"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}