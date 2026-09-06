import React, { useEffect, useRef, useState } from "react";
import { Phone, MessageCircle, X, Navigation2 } from "lucide-react";
import { OlaMaps } from "olamaps-web-sdk";
// NOTE: olaMaps.init() jo map object deta hai wo poora MapLibre GL JS
// API expose nahi karta — addControl() jaise kuch methods usme nahi hote.
// Isliye NavigationControl (zoom +/- buttons) ko try/catch ke saath
// optional rakha gaya hai, taaki agar ye method na ho to poori screen
// crash na ho, sirf zoom buttons na dikhein.
import { LngLatBounds, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useApp } from "../context/AppContext";
import { BACKEND_URL } from "../config";
import socket from "../socket";

// OlaMapTest.jsx wale confirmed pattern se hi banaya — ek hi instance
// poore app mein reuse hoti hai, taaki har mount pe naya SDK object na bane
const olaMaps = new OlaMaps({
  apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY,
});

const MAP_STYLE_URL =
  "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json";

const ROUTE_SOURCE_ID = "helper-route-line";

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

// Do points ke beech direction (bearing) nikaalta hai, icon rotate karne ke liye
function getBearing(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
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
  // helperPos sirf glide-animation effect ko trigger karne ke liye state hai —
  // actual marker position/rotation ab imperative refs se update hoti hai (no re-render per frame)
  const [helperPos, setHelperPos] = useState(null); // [lat, lng]

  const initialDistanceRef = useRef(w.distanceKm ?? null);
  const prevHelperPosRef = useRef(null); // [lat, lng] - last known real (non-animated) helper pos
  const displayPosRef = useRef(null); // [lat, lng] - currently animated/displayed helper pos
  const helperBearingRef = useRef(0);
  const animFrameRef = useRef(null);

  // ---- Ola Maps / MapLibre refs ----
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapReadyRef = useRef(false);
  const userMarkerRef = useRef(null);
  const helperMarkerRef = useRef(null);
  const helperMarkerElRef = useRef(null); // raw DOM node, taaki rotate CSS directly laga sakein

  const userPos = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : null;
  const userPosRef = useRef(userPos);
  useEffect(() => {
    userPosRef.current = userPos;
  }, [userPos]);

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

  // Shared socket use karte hain — naya connection nahi banate, isliye
  // StrictMode ke double-mount pe koi "closed before established" warning nahi aati
  useEffect(() => {
    if (!currentRequestId) return;

    socket.emit("join:request", currentRequestId);

    const handleStatusUpdate = ({ status }) => {
      setRequestStatus(status);
      if (status === "completed") {
        showToast(`✅ Job complete ho gaya!`);
        setTimeout(() => goTo("payment"), 1200);
      }
    };

    const handleLocationUpdate = ({ lat, lng }) => {
      // Bearing nikaalo purani position se, icon rotate karne ke liye
      if (prevHelperPosRef.current) {
        const [plat, plng] = prevHelperPosRef.current;
        if (plat !== lat || plng !== lng) {
          helperBearingRef.current = getBearing(plat, plng, lat, lng);
        }
      }
      prevHelperPosRef.current = [lat, lng];
      setHelperPos([lat, lng]);

      if (!liveLocation) return;
      const dist = getDistanceKm(liveLocation.lat, liveLocation.lng, lat, lng);
      setLiveDistanceKm(Number(dist.toFixed(1)));

      if (initialDistanceRef.current == null || initialDistanceRef.current === 0) {
        initialDistanceRef.current = dist || 0.1;
      }

      if (dist <= 0.05 && !arrived) {
        setArrived(true);
        showToast(`🟢 ${w.name} pahunch gaya hai — OTP share karein`);
      }
    };

    socket.on("status:update", handleStatusUpdate);
    socket.on("location:update", handleLocationUpdate);

    // Sirf listeners hataye — shared socket ko disconnect nahi karte,
    // taaki dusri screens bhi usi connection ko use kar sakein
    return () => {
      socket.off("status:update", handleStatusUpdate);
      socket.off("location:update", handleLocationUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRequestId]);

  // ---------- Map helpers (imperative — MapLibre/Ola Maps style) ----------

  function ensureRouteLayer(map) {
    if (map.getSource(ROUTE_SOURCE_ID)) return;
    map.addSource(ROUTE_SOURCE_ID, {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [] } },
    });
    map.addLayer({
      id: ROUTE_SOURCE_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#3B82F6", "line-width": 4 },
    });
  }

  function updateRouteLine(map, helperLatLng, userLatLng) {
    const source = map.getSource(ROUTE_SOURCE_ID);
    if (!source) return;
    const coordinates =
      helperLatLng && userLatLng
        ? [
            [helperLatLng[1], helperLatLng[0]],
            [userLatLng[1], userLatLng[0]],
          ]
        : [];
    source.setData({ type: "Feature", geometry: { type: "LineString", coordinates } });
  }

  function fitMapToPoints(map, userLatLng, helperLatLng) {
    if (userLatLng && helperLatLng) {
      const bounds = new LngLatBounds(
        [userLatLng[1], userLatLng[0]],
        [userLatLng[1], userLatLng[0]]
      );
      bounds.extend([helperLatLng[1], helperLatLng[0]]);
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 500 });
    } else if (userLatLng) {
      map.setCenter([userLatLng[1], userLatLng[0]]);
      map.setZoom(15);
    }
  }

  function ensureUserMarker(map, latLng) {
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([latLng[1], latLng[0]]);
      return;
    }
    const el = document.createElement("div");
    el.style.fontSize = "26px";
    el.style.lineHeight = "1";
    el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,.35))";
    el.textContent = "📍";
    // Confirmed syntax from Ola Maps Web SDK docs (Adding Markers page)
    const popup = new OlaMaps.Popup({ offset: 20 }).setText("Aap yahan hain");
    userMarkerRef.current = new OlaMaps.Marker({ element: el, anchor: "bottom" })
      .setLngLat([latLng[1], latLng[0]])
      .setPopup(popup)
      .addTo(map);
  }

  function ensureHelperMarker(map, latLng, bearingDeg) {
    if (helperMarkerRef.current) {
      helperMarkerRef.current.setLngLat([latLng[1], latLng[0]]);
      if (helperMarkerElRef.current) {
        helperMarkerElRef.current.style.transform = `rotate(${bearingDeg}deg)`;
      }
      return;
    }
    const el = document.createElement("div");
    el.style.fontSize = "26px";
    el.style.lineHeight = "1";
    el.style.filter = "drop-shadow(0 2px 5px rgba(0,0,0,.35))";
    el.style.transform = `rotate(${bearingDeg}deg)`;
    el.style.transition = "transform 0.2s linear";
    el.textContent = "🛵";
    helperMarkerElRef.current = el;
    const popup = new OlaMaps.Popup({ offset: 20 }).setText(`${firstName} yahan hai`);
    helperMarkerRef.current = new OlaMaps.Marker({ element: el, anchor: "center" })
      .setLngLat([latLng[1], latLng[0]])
      .setPopup(popup)
      .addTo(map);
  }

  // ---------- Map init — sirf ek baar, jab pehli baar userPos milta hai ----------
  useEffect(() => {
    if (!userPos || mapRef.current || !mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      // 🔧 FIX: olaMaps.init() ek Promise return karta hai — pehle isko
      // await nahi kiya jaa raha tha, isliye "map" actually Promise object
      // ban raha tha aur map.on()/map.addControl() jaise calls crash kar
      // rahe the (Promise pe wo methods hote hi nahi).
      const map = await olaMaps.init({
        style: MAP_STYLE_URL,
        container: mapContainerRef.current,
        center: [userPos[1], userPos[0]],
        zoom: 15,
      });

      if (cancelled) {
        if (map && typeof map.remove === "function") map.remove();
        return;
      }

      mapRef.current = map;

      try {
        if (typeof map.addControl === "function") {
          map.addControl(new NavigationControl(), "bottom-right");
        }
      } catch (e) {
        console.warn("NavigationControl is not supported by this map instance:", e);
      }

      map.on("load", () => {
        if (cancelled) return;
        mapReadyRef.current = true;
        ensureRouteLayer(map);
        ensureUserMarker(map, userPosRef.current);

        const dp = displayPosRef.current;
        if (dp) {
          ensureHelperMarker(map, dp, helperBearingRef.current);
        }
        updateRouteLine(map, prevHelperPosRef.current, userPosRef.current);
        fitMapToPoints(map, userPosRef.current, prevHelperPosRef.current);
      });
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      if (mapRef.current && typeof mapRef.current.remove === "function") {
        mapRef.current.remove();
      }
      mapRef.current = null;
      mapReadyRef.current = false;
      userMarkerRef.current = null;
      helperMarkerRef.current = null;
      helperMarkerElRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(userPos)]);

  // userPos (apna GPS) badalne pe marker + route ko update karo, map re-init nahi karte
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current || !userPos) return;
    ensureUserMarker(mapRef.current, userPos);
    updateRouteLine(mapRef.current, displayPosRef.current || prevHelperPosRef.current, userPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPos]);

  // helperPos badalte hi icon ko smoothly glide karao (Blinkit jaisa), jump nahi —
  // ab yeh directly map marker ko move karta hai, React state pe nahi (60fps re-render se bachne ke liye)
  useEffect(() => {
    if (!helperPos) return;

    const from = displayPosRef.current || helperPos;
    const to = helperPos;
    const duration = 1000;
    const start = performance.now();

    cancelAnimationFrame(animFrameRef.current);

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      displayPosRef.current = [lat, lng];

      if (mapReadyRef.current && mapRef.current) {
        ensureHelperMarker(mapRef.current, [lat, lng], helperBearingRef.current);
        updateRouteLine(mapRef.current, [lat, lng], userPosRef.current);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else if (mapReadyRef.current && mapRef.current) {
        fitMapToPoints(mapRef.current, userPosRef.current, [lat, lng]);
      }
    }
    animFrameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [helperPos]);

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
      <div className="absolute inset-0 bg-slate-50 dark:bg-bg flex flex-col items-center justify-center px-8 text-center">
        <style>{`
          @keyframes softPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.7; } }
          .soft-pulse { animation: softPulse 1.8s ease-in-out infinite; }
        `}</style>
        <div className="soft-pulse w-16 h-16 rounded-full bg-orange-100 dark:bg-accent/15 flex items-center justify-center mb-6">
          <div className="w-9 h-9 rounded-full border-[3px] border-orange-400 dark:border-accent border-t-transparent animate-spin" />
        </div>
        <div className="text-lg font-black text-slate-900 dark:text-text mb-2">
          Helper ka jawab ka wait kar rahe hain...
        </div>
        <div className="text-sm text-slate-500 dark:text-text-dim max-w-xs">
          Aapki request bhej di gayi hai. Jaise hi helper accept karega, tracking shuru ho jaayegi.
        </div>
      </div>
    );
  }

  if (requestStatus === "rejected") {
    return (
      <div className="absolute inset-0 bg-slate-50 dark:bg-bg flex flex-col items-center justify-center px-8 text-center">
        <div className="text-5xl mb-4">😔</div>
        <div className="text-lg font-black text-slate-900 dark:text-text mb-2">
          Helper ne request reject kar di
        </div>
        <div className="text-sm text-slate-500 dark:text-text-dim mb-6 max-w-xs">
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
    <div className="absolute inset-0 bg-slate-50 dark:bg-bg flex flex-col overflow-hidden">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-up { opacity: 0; animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes dotPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(46,204,113,0.5); } 50% { box-shadow: 0 0 0 6px rgba(46,204,113,0); } }
        .dot-pulse { animation: dotPulse 1.6s ease-in-out infinite; }
        .ola-map-container { background: #e5e7eb; }
      `}</style>

      {/* Blinkit-jaisa bold banner top pe — orange, dono modes mein same rehta hai */}
      <div className="relative z-[1001] px-4 sm:px-5 pt-8 sm:pt-10 pb-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wide opacity-90">
            {arrived ? "Helper pahunch gaya" : "Madad aa rahi hai"}
          </div>
          <div
            onClick={() => goTo("home")}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <X size={15} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black mt-1">
          {arrived ? "Aa gaya! 🎉" : `${etaText} min mein pahunchega`}
        </div>
        {liveDistanceKm != null && !arrived && (
          <div className="text-xs font-semibold opacity-90 mt-1">
            {liveDistanceKm} km door
          </div>
        )}
      </div>

      {/* Map — banner ke neeche thoda overlap karke rounded card jaisa */}
      <div className="relative -mt-4 mx-3 rounded-3xl overflow-hidden shadow-xl h-[230px] shrink-0 z-[1000] ring-1 ring-black/0 dark:ring-line">
        {userPos ? (
          <div ref={mapContainerRef} className="ola-map-container" style={{ width: "100%", height: "100%" }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 dark:text-text-dim bg-slate-100 dark:bg-card">
            Location la rahe hain...
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-y-auto pb-6">
        <div className="px-4 sm:px-5 max-w-md mx-auto w-full">
          <div className="fade-in-up inline-flex items-center gap-1.5 text-[10.5px] font-bold text-green-700 dark:text-safe bg-green-50 dark:bg-safe/15 px-2.5 py-1 rounded-full mt-4 mb-3">
            🤖 AI ne is helper ko sabse best match chuna
          </div>

          <div className="fade-in-up bg-white dark:bg-card rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-line" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shrink-0">
                {w.init}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-black text-slate-900 dark:text-text truncate">{w.name}</div>
                <div className="text-xs text-slate-500 dark:text-text-dim mt-0.5">
                  ⭐ {w.rating} · {w.vehicle}
                </div>
                {helperVehicleNumber && (
                  <div className="text-[11px] text-slate-400 dark:text-text-dim/70 mt-0.5">
                    🔢 {helperVehicleNumber}
                  </div>
                )}
              </div>
              {liveDistanceKm != null && (
                <div className="shrink-0 text-right">
                  <div className="text-sm font-black text-orange-500 dark:text-accent">{liveDistanceKm} km</div>
                  <div className="text-[9px] text-slate-400 dark:text-text-dim">door</div>
                </div>
              )}
            </div>
            <div className="flex gap-2.5 mt-4">
              <div
                onClick={() => showToast("💬 Chat khul gayi (demo)")}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-line bg-slate-50 dark:bg-card-2 text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform text-slate-700 dark:text-text"
              >
                <MessageCircle size={16} /> Chat
              </div>

              <a href={helperPhone ? `tel:${helperPhone}` : undefined}
                onClick={() => !helperPhone && showToast("📞 Phone number nahi mila")}
                className="flex-1 py-3 rounded-xl bg-green-500 dark:bg-safe text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform no-underline"
              >
                <Phone size={16} /> Call
              </a>
            </div>
          </div>

          <div className="fade-in-up bg-orange-50 dark:bg-accent/10 border border-dashed border-orange-300 dark:border-accent/50 rounded-2xl px-4 py-3.5 mt-3 flex items-center justify-between" style={{ animationDelay: "0.1s" }}>
            <div className="text-xs text-orange-700 dark:text-accent-2 font-medium">Helper ko yeh OTP dikhaayein</div>
            <div className="text-2xl font-black tracking-[6px] text-orange-500 dark:text-accent">{realOtp}</div>
          </div>

          <div className="fade-in-up mt-5" style={{ animationDelay: "0.15s" }}>
            <div className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 dark:bg-safe" />
                <div className="w-0.5 flex-1 bg-green-500 dark:bg-safe my-1" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-text">Request confirm ho gayi</div>
                <div className="text-[11px] text-slate-400 dark:text-text-dim mt-0.5">Just now</div>
              </div>
            </div>
            <div className="flex gap-3 mb-4">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${arrived ? "bg-green-500 dark:bg-safe" : "bg-orange-400 dark:bg-accent"}`} />
                <div className={`w-0.5 flex-1 my-1 ${arrived ? "bg-green-500 dark:bg-safe" : "bg-slate-200 dark:bg-line"}`} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-text">{firstName} aapki taraf aa raha hai</div>
                <div className="text-[11px] text-slate-400 dark:text-text-dim mt-0.5">
                  {arrived ? `${firstName} pahunch gaya!` : `ETA ${etaText} min`}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-line" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-text">Madad complete</div>
                <div className="text-[11px] text-slate-400 dark:text-text-dim mt-0.5">
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