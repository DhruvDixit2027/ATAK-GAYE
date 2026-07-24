import React from 'react';

const ISSUE_ICONS = { petrol: '⛽', mechanic: '🔧', tyre: '🛞', battery: '🔋', tow: '🚛' };

export default function TrackingScreen({ job, onComplete }) {
  const { issueType, userLocation } = job;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${userLocation.lat},${userLocation.lng}`;

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