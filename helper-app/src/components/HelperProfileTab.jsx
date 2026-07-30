import React, { useEffect, useState, useRef } from 'react';
import './HelperHome.css';

export default function HelperProfileTab({ helper, onLogout }) {
  // Profile picture - stored locally in this browser only (no backend involved)
  const storageKey = `helperProfilePic_${helper._id}`;
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setProfilePic(saved);
  }, [storageKey]);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sirf image file select karo (jpg/png)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setProfilePic(base64);
      try {
        localStorage.setItem(storageKey, base64);
      } catch (err) {
        console.error('Photo save nahi ho payi (storage full ho sakta hai):', err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-card">
      <div className="profile-top">
        <div className="avatar-wrap">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">
              {helper.name ? helper.name.charAt(0).toUpperCase() : "H"}
            </div>
          )}
          <button
            type="button"
            className="avatar-edit-btn"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Photo badlo"
          >
            ✎
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePicChange}
            style={{ display: 'none' }}
          />
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

      <button className="logout-btn" onClick={onLogout}>LOGOUT</button>
    </div>
  );
}