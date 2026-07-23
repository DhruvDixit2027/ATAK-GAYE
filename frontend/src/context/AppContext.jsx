import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("home");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [winner, setWinner] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  // 👇 naya: user ki details, browser storage se load karo (agar pehle se bhari hain)
  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("atakGayeUser");
    return saved ? JSON.parse(saved) : null;
  });

  const goTo = useCallback((id) => setScreen(id), []);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 2200);
  }, []);

  // 👇 naya: user set karte waqt localStorage mein bhi save kar do
  const setUser = useCallback((userData) => {
    setUserState(userData);
    localStorage.setItem("atakGayeUser", JSON.stringify(userData));
  }, []);

  const value = {
    screen,
    goTo,
    selectedIssue,
    setSelectedIssue,
    winner,
    setWinner,
    toast,
    showToast,
    user,        // 👈 naya
    setUser,     // 👈 naya
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}