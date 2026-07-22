import React, { useState } from 'react';
import RequestList from './components/RequestList';
import './index.css';

// TEMP: hardcoded logged-in helper ID for demo.
// Once login/auth is built, this will come from the session.
const DEMO_HELPER_ID = '000000000000000000000001';

export default function App() {
  const [helperId] = useState(DEMO_HELPER_ID);

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
        <RequestList helperId={helperId} />
      </main>
    </div>
  );
}
