import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import PhoneFrame from "./components/PhoneFrame";
import HomeScreen from "./components/HomeScreen";
import IssueSelectScreen from "./components/IssueSelectScreen";
import AIMatchingScreen from "./components/AIMatchingScreen";
import TrackingScreen from "./components/TrackingScreen";
import DoneScreen from "./components/DoneScreen";
import UserDetailsScreen from "./components/UserDetailsScreen"; // 👈 naya import

function ScreenRouter() {
  const { screen, user } = useApp(); // 👈 user bhi lo

  // 👇 agar user ki details save nahi hain, to sabse pehle wahi form dikhao
  if (!user) {
    return <UserDetailsScreen />;
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
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <PhoneFrame>
        <ScreenRouter />
      </PhoneFrame>
    </AppProvider>
  );
}