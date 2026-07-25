import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [screen, setScreen] = useState("home");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [winner, setWinner] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);   // 👈 NAYA
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = useRef(null);

  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem("atakGayeUser");
    return saved ? JSON.parse(saved) : null;
  });

  // 👇 NAYA: OTP verify ho chuka hai lekin user abhi registered nahi hai —
  // isse UserDetailsScreen (registration) ko pata chalta hai kis phone
  // number ke liye details fill karni hain
  const [verifiedPhone, setVerifiedPhone] = useState(null);

  const goTo = useCallback((id) => setScreen(id), []);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ show: false, msg: "" }), 2200);
  }, []);

  const setUser = useCallback((userData) => {
    setUserState(userData);
    localStorage.setItem("atakGayeUser", JSON.stringify(userData));
    setVerifiedPhone(null); // registration/login poora hua, ab isko clear karo
  }, []);

  // 👇 NAYA: logout ke liye (agar future mein chahiye ho)
  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem("atakGayeUser");
    setVerifiedPhone(null);
    setScreen("home");
  }, []);

  const value = {
    screen,
    goTo,
    selectedIssue,
    setSelectedIssue,
    winner,
    setWinner,
    currentRequestId,      // 👈 NAYA
    setCurrentRequestId,   // 👈 NAYA
    toast,
    showToast,
    user,
    setUser,
    verifiedPhone,         // 👈 NAYA
    setVerifiedPhone,      // 👈 NAYA
    logout,                // 👈 NAYA
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}