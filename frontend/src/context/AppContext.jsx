import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("home");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [winner, setWinner] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  const goTo = useCallback((id) => setScreen(id), []);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 2200);
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
