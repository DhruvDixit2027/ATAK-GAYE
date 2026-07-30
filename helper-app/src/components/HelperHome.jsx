import React, { useEffect, useState } from 'react';
import RequestList from './RequestList';
import HelperProfileTab from './HelperProfileTab';
import HelperHistoryTab from './HelperHistoryTab';
import { BACKEND_URL } from "../config";
import './HelperHome.css';

function HelperHome({ helper, onLogout, onJobAccepted }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'history' | 'profile'

  useEffect(() => {
    if (!navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await fetch(`${BACKEND_URL}/api/helpers/${helper._id}/location`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });
          } catch (err) {
            console.error("Location update failed:", err);
          }
        },
        (err) => console.error("Geolocation error:", err)
      );
    };

    sendLocation();
    const interval = setInterval(sendLocation, 20000);

    return () => clearInterval(interval);
  }, [helper._id]);

  return (
    <div className="home-page">
      <video
        className="home-video-bg"
        src="/mechanic-home.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="home-video-overlay" />

      <div className="home-scroll">
        {activeTab === 'home' && (
          <div className="requests-section">
            <h3>Naye Requests</h3>
            <RequestList helperId={helper._id} onJobAccepted={onJobAccepted} />
          </div>
        )}

        {activeTab === 'history' && (
          <HelperHistoryTab helperId={helper._id} />
        )}

        {activeTab === 'profile' && (
          <HelperProfileTab helper={helper} onLogout={onLogout} />
        )}
      </div>

      {/* Bottom navigation bar */}
      <div className="bottom-nav">
        <button
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">History</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default HelperHome;