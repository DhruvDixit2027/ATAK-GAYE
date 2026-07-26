import React, { useState } from 'react';
import './HelperLogin.css';

const API_BASE = 'http://10.177.130.146:5000';

export default function HelperLogin({ onExistingHelper, onNewHelper }) {
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmed = phone.trim();
    if (!/^\d{10}$/.test(trimmed)) {
      setError('10 digit ka sahi mobile number daalo');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/helpers/by-phone/${trimmed}`);

      if (res.status === 404) {
        onNewHelper(trimmed);
        return;
      }
      if (!res.ok) {
        setError('Kuch galat ho gaya, dobara try karo');
        setLoading(false);
        return;
      }

      const helperData = await res.json();
      localStorage.setItem('atakGayeHelper', JSON.stringify(helperData));
      onExistingHelper(helperData);
    } catch (err) {
      console.error('Login check failed:', err);
      setError('Backend se connect nahi ho paya');
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <video
        className="login-video-bg"
        src="/mechanic-login.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="login-overlay" />

      <div className="login-content">
        <div className="login-header">
          <div className="login-logo"><span>A</span></div>
          <h1 className="login-title">Atak Gaye Ke Saath Jud Jao</h1>
          <p className="login-subtitle">Nearby customers ki madad karo aur kamao</p>
        </div>

        <div className="login-card">
          <h2 className="login-card-title">Helper Login</h2>
          <p className="login-card-sub">Shuru karne ke liye apna mobile number daalo</p>

          <div className={`phone-input ${focused ? 'focused' : ''}`}>
            <span className="phone-prefix">IN +91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Mobile number"
              inputMode="numeric"
              maxLength={10}
              disabled={loading}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="continue-btn squish" onClick={handleContinue} disabled={loading}>
            {loading ? 'Check ho raha hai...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}