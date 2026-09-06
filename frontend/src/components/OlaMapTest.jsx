import React, { useEffect, useRef } from "react";
import { OlaMaps } from "olamaps-web-sdk";

export default function OlaMapTest() {
  const mapContainer = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // StrictMode mein effect do baar chalta hai — dusri baar dubara
    // map na banaye, isliye guard laga rahe hain
    if (mapInstanceRef.current) return;

    const olaMaps = new OlaMaps({
      apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY,
    });

    const map = olaMaps.init({
      style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
      container: mapContainer.current,
      center: [77.1025, 28.7041],
      zoom: 12,
    });

    mapInstanceRef.current = map;

    return () => {
      // Safety check — sirf tab remove karo jab function actually exist kare
      if (mapInstanceRef.current && typeof mapInstanceRef.current.remove === "function") {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "300px",
        position: "relative",
        background: "#eee", // container dikh raha hai ya nahi, confirm karne ke liye
      }}
    />
  );
}