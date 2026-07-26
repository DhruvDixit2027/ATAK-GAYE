import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

import { BACKEND_URL } from "../config";
const ISSUE_ICONS = { petrol: '⛽', mechanic: '🔧', tyre: '🛞', battery: '🔋', tow: '🚛' };

export default function TrackingScreen({ job, onComplete }) {
  const { issueType, userLocation } = job;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${userLocation.lat},${userLocation.lng}`;

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  // 👇 Jab tak ye screen khuli hai (matlab helper job pe kaam kar
  // raha hai), apni live location har position-change pe backend ko
  // bhejte raho — customer ki TrackingScreen isi se turant update hoti hai
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

  return (
    <div className="tracking-screen">
      <div className="tracking-card">
        <div className="tracking-icon">{ISSUE_ICONS[issueType] || '❓'}</div>
        <h2>{issueType.charAt(0).toUpperCase() + issueType.slice(1)} Job — In Progress</h2>
        <p className="tracking-sub">Customer ki location:</p>
        <p className="tracking-coords">📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="navigate-btn">
          🧭 Navigate on Google Maps
        </a>

        <button className="complete-btn" onClick={onComplete}>Mark Job Complete</button>
      </div>
    </div>
  );
}