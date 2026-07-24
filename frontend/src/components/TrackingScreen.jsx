import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";

const PATH = [
  [120, 150],
  [160, 130],
  [190, 120],
  [230, 105],
  [270, 85],
  [310, 55],
  [360, 30],
];

const DEFAULT_WINNER = {
  name: "Ravi Kumar",
  init: "RK",
  vehicle: "Bajaj Pulsar · MP09 XX 4521",
  etaMin: 6,
  rating: 4.8,
};

// Haversine — do lat/lng points ke beech real distance (km)
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

// PATH ke do points ke beech linear interpolation, progress (0 to 1) ke hisaab se
function getPointOnPath(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  const totalSegments = PATH.length - 1;
  const segFloat = clamped * totalSegments;
  const segIndex = Math.min(Math.floor(segFloat), totalSegments - 1);
  const segProgress = segFloat - segIndex;

  const [x1, y1] = PATH[segIndex];
  const [x2, y2] = PATH[segIndex + 1];

  return [
    x1 + (x2 - x1) * segProgress,
    y1 + (y2 - y1) * segProgress,
  ];
}

export default function TrackingScreen() {
  const { goTo, winner, showToast, currentRequestId, user } = useApp();
  const w = winner || DEFAULT_WINNER;
  const firstName = w.name.split(" ")[0];

  const [arrived, setArrived] = useState(false);

  const [requestStatus, setRequestStatus] = useState("pending");
  const pollRef = useRef(null);

  // 👇 NAYA: real distance-based progress tracking
  const [progress, setProgress] = useState(0);
  const [liveDistanceKm, setLiveDistanceKm] = useState(w.distanceKm ?? null);
  const initialDistanceRef = useRef(w.distanceKm ?? null);
  const locationPollRef = useRef(null);

  // Status polling — helper ne accept/reject kiya ya nahi
  useEffect(() => {
    if (!currentRequestId) {
      setRequestStatus("accepted");
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/requests/${currentRequestId}`);
        const data = await res.json();

        if (data.status === "accepted") {
          setRequestStatus("accepted");
          clearInterval(pollRef.current);
        } else if (data.status === "rejected") {
          setRequestStatus("rejected");
          clearInterval(pollRef.current);
        }
      } catch (err) {
        console.error("Status check karne mein error:", err);
      }
    };

    checkStatus();
    pollRef.current = setInterval(checkStatus, 3000);

    return () => clearInterval(pollRef.current);
  }, [currentRequestId]);

  // 👇 NAYA: Helper ki real location poll karo, jab tak accept ho chuka ho aur user location available ho
  useEffect(() => {
    if (requestStatus !== "accepted" || !w.id || !user?.currentLocation) return;

    const pollLocation = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/helpers/${w.id}`);
        const helper = await res.json();

        if (!helper?.currentLocation) return;

        const dist = getDistanceKm(
          user.currentLocation.lat,
          user.currentLocation.lng,
          helper.currentLocation.lat,
          helper.currentLocation.lng
        );

        setLiveDistanceKm(Number(dist.toFixed(1)));

        // Agar initial distance record nahi hui thi, ab set kar do
        if (initialDistanceRef.current == null || initialDistanceRef.current === 0) {
          initialDistanceRef.current = dist || 0.1;
        }

        // Progress = kitna percent raasta cover ho chuka hai (0 = start, 1 = pahunch gaya)
        const rawProgress = 1 - dist / initialDistanceRef.current;
        setProgress(Math.max(0, Math.min(1, rawProgress)));

        // ~50 meter ke andar aa jaaye to "arrived" maan lo
        if (dist <= 0.05 && !arrived) {
          setArrived(true);
          showToast(`🟢 ${w.name} pahunch gaya hai — OTP share karein`);
          setTimeout(() => goTo("done"), 1800);
        }
      } catch (err) {
        console.error("Helper location fetch failed:", err);
      }
    };

    pollLocation();
    locationPollRef.current = setInterval(pollLocation, 4000);

    return () => clearInterval(locationPollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestStatus, w.id]);

  const [cx, cy] = getPointOnPath(progress);
  const etaText = arrived
    ? 0
    : liveDistanceKm != null
    ? Math.max(1, Math.round(liveDistanceKm * 2.5))
    : w.etaMin;

  if (requestStatus === "pending") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-full border-4 border-accent-2 border-t-transparent animate-spin mb-6" />
        <div className="text-lg font-bold font-hindi mb-2">Helper ka jawab ka wait kar rahe hain...</div>
        <div className="text-sm text-text-dim font-hindi">
          Aapki request bhej di gayi hai. Jaise hi helper accept karega, tracking shuru ho jaayegi.
        </div>
      </div>
    );
  }

  if (requestStatus === "rejected") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center animate-fadeIn">
        <div className="text-5xl mb-4">😔</div>
        <div className="text-lg font-bold font-hindi mb-2">Helper ne request reject kar di</div>
        <div className="text-sm text-text-dim font-hindi mb-6">
          Koi baat nahi — dusra helper dhundte hain aapke liye.
        </div>
        <button
          onClick={() => goTo("issues")}
          className="px-6 py-3 rounded-2xl font-display font-bold text-[15px] text-[#171009]"
          style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
        >
          <span className="font-hindi">Dusra Helper Dhundo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col animate-fadeIn">
      <div className="relative h-[260px] rounded-b-[28px] overflow-hidden track-map-bg">
        <div className="absolute top-4 left-5 bg-[#0B0D10d9] border border-line px-3.5 py-2 rounded-2xl text-xs">
          Pahunchne mein <b className="text-accent-2 text-sm">{arrived ? "aa gaya!" : `${etaText} min`}</b>
          {liveDistanceKm != null && !arrived && (
            <span className="text-text-dim"> · {liveDistanceKm} km</span>
          )}
        </div>
        <svg viewBox="0 0 400 260" className="w-full h-full">
          <path
            d="M40,230 C100,190 120,140 190,120 C260,100 300,60 360,30"
            stroke="#3a4250"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="40" cy="230" r="7" fill="#2ECC71" />
          <circle cx={cx} cy={cy} r="9" fill="#FF6A3D" style={{ transition: "cx 3.5s linear, cy 3.5s linear" }}>
            <animate attributeName="r" values="9;12;9" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="360" cy="30" r="7" fill="#FFC145" />
        </svg>
        <div
          onClick={() => goTo("home")}
          className="absolute top-4 right-4 w-[34px] h-[34px] rounded-[10px] bg-card border border-line flex items-center justify-center cursor-pointer"
        >
          ✕
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-safe bg-[rgba(46,204,113,0.12)] px-2.5 py-1 rounded-full mx-5 mt-2.5 mb-2.5 w-fit font-hindi">
        🤖 AI ne is helper ko sabse best match chuna
      </div>

      <div className="-mt-[30px] mx-5 bg-card border border-line rounded-[20px] p-4.5 p-[18px] relative z-[5]">
        <div className="flex items-center gap-3">
          <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-[#576274] to-[#2c333f]">
            {w.init}
          </div>
          <div>
            <div className="text-[15.5px] font-bold">{w.name}</div>
            <div className="text-[11.5px] text-text-dim mt-0.5 font-hindi">
              ⭐ {w.rating} · {w.vehicle}
            </div>
            {liveDistanceKm != null && (
              <div className="text-[11.5px] text-accent-2 mt-1 font-semibold font-hindi">
                📍 {liveDistanceKm} km door
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2.5 mt-4">
          <div
            onClick={() => showToast("💬 Chat khul gayi (demo)")}
            className="flex-1 py-3 rounded-xl border border-line bg-card-2 text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            💬 Chat
          </div>
          <div
            onClick={() => showToast("📞 Helper ko call ho raha hai...")}
            className="flex-1 py-3 rounded-xl bg-safe text-[#0B0D10] text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            📞 Call
          </div>
        </div>
      </div>

      <div className="mx-5 mt-4.5 mt-[18px] bg-card-2 border border-dashed border-accent-2 rounded-2xl px-4 py-3.5 flex items-center justify-between">
        <div className="text-[11.5px] text-text-dim font-hindi">Helper ko yeh OTP dikhaayein</div>
        <div className="font-display font-bold text-[22px] tracking-[6px] text-accent-2">4471</div>
      </div>

      <div className="mx-5 mt-5">
        <div className="flex gap-3 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-safe" />
            <div className="w-0.5 flex-1 bg-safe my-1" />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">Request confirm ho gayi</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">Just now</div>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${arrived ? "bg-safe" : "bg-accent-2 shadow-[0_0_0_4px_rgba(255,193,69,0.2)]"}`} />
            <div className={`w-0.5 flex-1 my-1 ${arrived ? "bg-safe" : "bg-line"}`} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">{firstName} aapki taraf aa raha hai</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">
              {arrived ? `${firstName} pahunch gaya!` : `ETA ${etaText} min`}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${arrived ? "bg-accent-2 shadow-[0_0_0_4px_rgba(255,193,69,0.2)]" : "bg-line"}`} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">Madad complete</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}