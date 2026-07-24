import React from "react";
import { useApp } from "../context/AppContext";

const items = [
  { icon: "🏠", label: "Home", screen: "home" },
  { icon: "📋", label: "Requests", screen: "requests" },
  { icon: "👤", label: "Profile", screen: "profile" },
];

export default function BottomNav() {
  const { screen, goTo } = useApp();

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[78px] bg-[#14181Ce6] backdrop-blur-md border-t border-line flex items-center justify-around pb-3.5">
      {items.map((it) => (
        <div
          key={it.label}
          onClick={() => goTo(it.screen)}
          className={`text-center text-[10.5px] cursor-pointer ${
            screen === it.screen ? "text-accent" : "text-text-dim"
          }`}
        >
          <span className="text-lg block mb-0.5">{it.icon}</span>
          <span className="font-hindi">{it.label}</span>
        </div>
      ))}
    </div>
  );
}