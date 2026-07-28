import React, { useState, useEffect } from "react";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";
import "./index.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("atakGayeAdminAuth") === "true"
  );

  // 👇 NAYA: theme state — localStorage se load hota hai, warna default "dark"
  const [theme, setTheme] = useState(
    () => localStorage.getItem("atakGayeAdminTheme") || "dark"
  );

  // 👇 NAYA: jab bhi theme badle, <html> tag pe "dark" class add/remove karo
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("atakGayeAdminTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={() => setLoggedIn(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Dashboard
      onLogout={() => setLoggedIn(false)}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}