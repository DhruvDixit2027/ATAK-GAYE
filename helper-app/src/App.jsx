import React, { useState } from 'react';
import HelperHome from './components/HelperHome';
import HelperLogin from './components/HelperLogin';
import HelperDetailsScreen from './components/HelperDetailsScreen';
import TrackingScreen from './components/TrackingScreen';
import './App.css';
import './index.css';

export default function App() {
  const [helper, setHelper] = useState(() => {
    try {
      const saved = localStorage.getItem("atakGayeHelper");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Corrupt helper data, clearing:", err);
      localStorage.removeItem("atakGayeHelper");
      return null;
    }
  });

  const [authStep, setAuthStep] = useState("login"); // "login" | "register"
  const [pendingPhone, setPendingPhone] = useState("");
  const [activeJob, setActiveJob] = useState(null);

  const handleRegistered = (helperData) => {
    localStorage.setItem("atakGayeHelper", JSON.stringify(helperData));
    setHelper(helperData);
  };

  const handleLogout = () => {
    localStorage.removeItem("atakGayeHelper");
    setHelper(null);
    setAuthStep("login");
    setPendingPhone("");
  };

  if (!helper) {
    if (authStep === "register") {
      return <HelperDetailsScreen onRegistered={handleRegistered} initialPhone={pendingPhone} />;
    }
    return (
      <HelperLogin
        onExistingHelper={(helperData) => setHelper(helperData)}
        onNewHelper={(phone) => {
          setPendingPhone(phone);
          setAuthStep("register");
        }}
      />
    );
  }

  if (activeJob) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="logo-mark">A</div>
          <div>
            <h1>Atak Gaye — Helper</h1>
            <p className="header-sub">On a job</p>
          </div>
        </header>
        <main className="app-main">
          <TrackingScreen job={activeJob} onComplete={() => setActiveJob(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo-mark">A</div>
        <div>
          <h1>Atak Gaye — Helper</h1>
          <p className="header-sub">Welcome, {helper.name}</p>
        </div>
      </header>

      <main className="app-main">
        <HelperHome helper={helper} onLogout={handleLogout} onJobAccepted={setActiveJob} />
      </main>
    </div>
  );
}