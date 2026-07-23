import React, { useState } from 'react';
import RequestList from './components/RequestList';
import HelperDetailsScreen from './components/HelperDetailsScreen';
import './index.css';

export default function App() {
  // Pehle localStorage check karo — agar helper pehle se registered hai to seedha use karo
  const [helper, setHelper] = useState(() => {
    const saved = localStorage.getItem("atakGayeHelper");
    return saved ? JSON.parse(saved) : null;
  });

  // Agar helper registered nahi hai, to sabse pehle details form dikhao
  if (!helper) {
    return <HelperDetailsScreen onRegistered={setHelper} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo-mark">A</div>
        <div>
          <h1>Atak Gaye — Helper</h1>
          <p className="header-sub">Naye requests yahan dikhenge</p>
        </div>
      </header>

      <main className="app-main">
        <RequestList helperId={helper._id} />
      </main>
    </div>
  );
}