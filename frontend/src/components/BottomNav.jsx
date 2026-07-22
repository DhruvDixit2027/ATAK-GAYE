import React from "react";
import { useApp } from "../context/AppContext";

const items = [
  { icon: "🏠", label: "Home", active: true },
  { icon: "📋", label: "Requests", msg: "History abhi prototype mein khaali hai" },
  { icon: "👨‍👩‍👧", label: "Family", msg: "Family Safety Circle jald aa raha hai" },
  { icon: "👤", label: "Profile", msg: "Profile abhi prototype mein khaali hai" },
];

export default function BottomNav() {
  const { showToast } = useApp();

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[78px] bg-[#14181Ce6] backdrop-blur-md border-t border-line flex items-center justify-around pb-3.5">
      {items.map((it) => (
        <div
          key={it.label}
          onClick={() => it.msg && showToast(it.msg)}
          className={`text-center text-[10.5px] cursor-pointer ${it.active ? "text-accent" : "text-text-dim"}`}
        >
          <span className="text-lg block mb-0.5">{it.icon}</span>
          <span className="font-hindi">{it.label}</span>
        </div>
      ))}
    </div>
  );
}
