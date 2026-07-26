import React, { useEffect } from 'react';
import RequestList from './RequestList';
import './HelperHome.css';
console.log("HELPERHOME RENDERED - TEST123");

function HelperHome({ helper, onLogout, onJobAccepted }) {

  useEffect(() => {
    if (!navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await fetch(`http://10.177.130.146:5000/api/helpers/${helper._id}/location`, {
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
        <div className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {helper.name ? helper.name.charAt(0).toUpperCase() : "H"}
            </div>
            <div className="profile-main">
              <h2>{helper.name}</h2>
              <p className="profile-sub">{helper.vehicleType} • {helper.vehicleNumber}</p>
            </div>
            <span className={`status-pill ${helper.availability ? "online" : "offline"}`}>
              {helper.availability ? "Available" : "Offline"}
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-value">⭐ {helper.rating}</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{helper.totalJobsCompleted}</span>
              <span className="stat-label">Jobs Done</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{Math.round(helper.successRate * 100)}%</span>
              <span className="stat-label">Success</span>
            </div>
          </div>

          <div className="skills-row">
            {helper.skillTypes && helper.skillTypes.map((skill) => (
              <span key={skill} className="skill-chip active">{skill}</span>
            ))}
          </div>

          <button className="logout-btn" onClick={onLogout}>Switch Helper</button>
        </div>

        <div className="requests-section">
          <h3>Naye Requests</h3>
          <RequestList helperId={helper._id} onJobAccepted={onJobAccepted} />
        </div>
      </div>
    </div>
  );
}

export default HelperHome;