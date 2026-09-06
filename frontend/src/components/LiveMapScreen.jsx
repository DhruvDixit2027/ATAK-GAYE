import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Navigation2, LocateFixed } from "lucide-react";
import { OlaMaps } from "olamaps-web-sdk";
// NOTE: olaMaps.init() jo map object deta hai wo poora MapLibre GL JS
// API expose nahi karta — addControl() jaise kuch methods usme nahi hote.
// Isliye NavigationControl (zoom +/- buttons) ko try/catch ke saath
// optional rakha gaya hai, taaki agar ye method na ho to poori screen
// crash na ho, sirf zoom buttons na dikhein.
import { NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useApp } from "../context/AppContext";
import { getAddressFromCoords } from "../utils";

// TrackingScreen.jsx jaisa hi pattern — apni instance yahan bhi bana rahe
// hain. Agar aage aur screens Ola Maps use karengi, to isko ek shared
// "olaMapsClient.js" file mein nikaal ke sabhi jagah se import karna
// behtar rahega (ek hi SDK instance poori app mein reuse hogi).
const olaMaps = new OlaMaps({
  apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY,
});

const MAP_STYLE_URL =
  "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json";

export default function LiveMapScreen() {
  const { goTo, liveLocation, locationError } = useApp();

  const [addressLabel, setAddressLabel] = useState("Location la rahe hain...");
  const [isFollowing, setIsFollowing] = useState(true);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapReadyRef = useRef(false);
  const markerRef = useRef(null);
  const markerElRef = useRef(null);
  const lastGeocodedRef = useRef(null);
  const userInteractedRef = useRef(false);

  // ---------- Address label (same debounce logic jaisa HomeScreen mein hai) ----------
  useEffect(() => {
    if (locationError) {
      setAddressLabel("Location unavailable");
      return;
    }
    if (!liveLocation) return;

    const last = lastGeocodedRef.current;
    if (last) {
      const dLat = liveLocation.lat - last.lat;
      const dLng = liveLocation.lng - last.lng;
      const roughMeters = Math.sqrt(dLat ** 2 + dLng ** 2) * 111000;
      if (roughMeters < 300) return;
    }

    let cancelled = false;
    (async () => {
      try {
        const address = await getAddressFromCoords(liveLocation.lat, liveLocation.lng);
        if (cancelled) return;
        lastGeocodedRef.current = { lat: liveLocation.lat, lng: liveLocation.lng };
        const short = address.split(",").slice(0, 2).join(",").trim();
        setAddressLabel(short || "Current Location");
      } catch {
        if (!cancelled) setAddressLabel("Location unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [liveLocation, locationError]);

  // ---------- Map init — ek hi baar, jab pehli baar location milti hai ----------
  useEffect(() => {
    if (!liveLocation || mapRef.current || !mapContainerRef.current) return;
    let cancelled = false;

    (async () => {
      // 🔧 FIX: olaMaps.init() ek Promise return karta hai — pehle isko
      // await nahi kiya jaa raha tha, isliye "map" actually Promise object
      // ban raha tha aur map.on()/map.addControl() jaise calls crash kar
      // rahe the (Promise pe wo methods hote hi nahi).
      const map = await olaMaps.init({
        style: MAP_STYLE_URL,
        container: mapContainerRef.current,
        center: [liveLocation.lng, liveLocation.lat],
        zoom: 16,
      });

      // Component isi await ke beech mein unmount ho gaya ho to turant hata do
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

      // User map ko khud drag/zoom kare to auto-follow band kar do,
      // taaki live update baar-baar unki nazar se location na hata de
      map.on("dragstart", () => {
        userInteractedRef.current = true;
        setIsFollowing(false);
      });

      map.on("load", () => {
        if (cancelled) return;
        mapReadyRef.current = true;

        const el = document.createElement("div");
        el.className = "live-map-dot";
        el.innerHTML = `<div class="live-map-dot-halo"></div><div class="live-map-dot-core"></div>`;
        markerElRef.current = el;

        markerRef.current = new OlaMaps.Marker({ element: el, anchor: "center" })
          .setLngLat([liveLocation.lng, liveLocation.lat])
          .addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current && typeof mapRef.current.remove === "function") {
        mapRef.current.remove();
      }
      mapRef.current = null;
      mapReadyRef.current = false;
      markerRef.current = null;
      markerElRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(liveLocation)]);

  // ---------- liveLocation badalte hi marker move karo, aur (agar following on hai) map bhi recenter karo ----------
  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current || !liveLocation) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([liveLocation.lng, liveLocation.lat]);
    }

    if (isFollowing) {
      mapRef.current.easeTo({
        center: [liveLocation.lng, liveLocation.lat],
        duration: 600,
      });
    }
  }, [liveLocation, isFollowing]);

  const recenter = () => {
    userInteractedRef.current = false;
    setIsFollowing(true);
    if (mapRef.current && liveLocation) {
      mapRef.current.easeTo({
        center: [liveLocation.lng, liveLocation.lat],
        zoom: 16,
        duration: 600,
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-bg flex flex-col overflow-hidden">
      <style>{`
        .live-map-dot { position: relative; width: 26px; height: 26px; }
        .live-map-dot-core {
          position: absolute; inset: 0; margin: auto;
          width: 16px; height: 16px; border-radius: 9999px;
          background: #FF6A3D; border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,.35);
        }
        .live-map-dot-halo {
          position: absolute; inset: 0; margin: auto;
          width: 26px; height: 26px; border-radius: 9999px;
          background: rgba(255,106,61,0.35);
          animation: liveDotPulse 2s ease-out infinite;
        }
        @keyframes liveDotPulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>

      {/* Top bar */}
      <div className="relative z-[1001] px-4 sm:px-5 pt-8 sm:pt-10 pb-4 bg-white dark:bg-card shrink-0 shadow-sm flex items-center gap-3">
        <button
          onClick={() => goTo("home")}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-card-2 flex items-center justify-center active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeft size={17} className="text-slate-700 dark:text-text" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-text-dim">
            Live Location
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-text truncate">
            {addressLabel}
          </div>
        </div>
      </div>

      {/* Map fills the rest of the screen */}
      <div className="relative flex-1">
        {liveLocation ? (
          <div ref={mapContainerRef} style={{ width: "100%", height: "100%", background: "#e5e7eb" }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-text-dim px-8 text-center">
            <Navigation2 size={28} />
            <div className="text-sm">
              {locationError ? "Location unavailable" : "Location la rahe hain..."}
            </div>
          </div>
        )}

        {liveLocation && !isFollowing && (
          <button
            onClick={recenter}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-card shadow-xl rounded-full pl-3 pr-4 py-2.5 flex items-center gap-2 active:scale-95 transition-transform border border-slate-100 dark:border-line"
          >
            <LocateFixed size={16} className="text-orange-500 dark:text-accent" />
            <span className="text-xs font-bold text-slate-700 dark:text-text">Recenter</span>
          </button>
        )}
      </div>
    </div>
  );
}