import React, { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import HomeScreen from "./components/HomeScreen";
import IssueSelectScreen from "./components/IssueSelectScreen";
import AIMatchingScreen from "./components/AIMatchingScreen";
import TrackingScreen from "./components/TrackingScreen";
import DoneScreen from "./components/DoneScreen";
import UserDetailsScreen from "./components/UserDetailsScreen";
import RequestHistoryScreen from "./components/RequestHistoryScreen";
import ProfileScreen from "./components/ProfileScreen";
import LoginScreen from "./components/LoginScreen"; // 👈 NAYA

function ScreenRouter() {
  const { screen, user, verifiedPhone } = useApp();

  if (!user) {
    // 👇 NAYA: pehle login (phone + OTP), phir OTP verify hone ke baad
    // agar number naya hai to registration (UserDetailsScreen) dikhao
    if (verifiedPhone) {
      return <UserDetailsScreen />;
    }
    return <LoginScreen />;
  }

  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "issues":
      return <IssueSelectScreen />;
    case "matching":
      return <AIMatchingScreen />;
    case "tracking":
      return <TrackingScreen />;
    case "done":
      return <DoneScreen />;
    case "requests":
      return <RequestHistoryScreen />;
    case "profile":
      return <ProfileScreen />;
    case "editProfile":
      return <UserDetailsScreen editMode />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  // App khulte hi backend ko "jagane" ka ping — Render free tier
  // 15 min inactivity ke baad sleep ho jaata hai, isse jab tak
  // user phone number type kare, server ready ho chuka hota hai.
  useEffect(() => {
    fetch("https://atak-gaye.onrender.com").catch(() => {});
  }, []);

  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  );
}