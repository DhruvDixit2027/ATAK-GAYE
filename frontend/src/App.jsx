import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import PhoneFrame from "./components/PhoneFrame";
import HomeScreen from "./components/HomeScreen";
import IssueSelectScreen from "./components/IssueSelectScreen";
import AIMatchingScreen from "./components/AIMatchingScreen";
import TrackingScreen from "./components/TrackingScreen";
import DoneScreen from "./components/DoneScreen";
import UserDetailsScreen from "./components/UserDetailsScreen";
import RequestHistoryScreen from "./components/RequestHistoryScreen";
import ProfileScreen from "./components/ProfileScreen";

function ScreenRouter() {
  const { screen, user } = useApp();

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
  return (
    <AppProvider>
      <PhoneFrame>
        <ScreenRouter />
      </PhoneFrame>
    </AppProvider>
  );
}