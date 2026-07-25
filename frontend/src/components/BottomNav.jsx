import React from "react";
import { Home, ClipboardList, User } from "lucide-react";
import { useApp } from "../context/AppContext";

const items = [
  { icon: Home, label: "Home", screen: "home" },
  { icon: ClipboardList, label: "Requests", screen: "requests" },
  { icon: User, label: "Profile", screen: "profile" },
];

export default function BottomNav() {
  const { screen, goTo } = useApp();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] flex items-center justify-around pb-5 pt-2.5">
      {items.map((it) => {
        const Icon = it.icon;
        const active = screen === it.screen;
        return (
          <div
            key={it.label}
            onClick={() => goTo(it.screen)}
            className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                active ? "bg-orange-50" : "bg-transparent"
              }`}
            >
              <Icon
                size={19}
                className={active ? "text-orange-500" : "text-slate-400"}
                strokeWidth={active ? 2.4 : 2}
              />
            </div>
            <span
              className={`text-[10.5px] font-semibold ${
                active ? "text-orange-500" : "text-slate-400"
              }`}
            >
              {it.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}