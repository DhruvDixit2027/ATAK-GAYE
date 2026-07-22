import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function DoneScreen() {
  const { goTo, winner, showToast } = useApp();
  const [rating, setRating] = useState(0);
  const name = winner?.name || "Helper";

  const rate = (n) => {
    setRating(n);
    showToast(`Dhanyawaad! Aapki rating save ho gayi ⭐${n}`);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-10 animate-fadeIn">
      <div className="w-[76px] h-[76px] rounded-full bg-[rgba(46,204,113,0.15)] border-2 border-safe flex items-center justify-center text-[34px] mb-4.5 mb-[18px]">
        ✅
      </div>
      <h2 className="font-display font-bold text-2xl font-hindi">Madad mil gayi!</h2>
      <div className="text-[#5a6472] text-xs mt-2 font-hindi">
        {name} ne aapki problem solve kar di. Umeed hai ab safar smooth chalega.
      </div>
      <div className="flex gap-2 my-4.5 my-[18px] text-[28px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => rate(n)}
            className={`cursor-pointer ${n <= rating ? "opacity-100" : "opacity-30"}`}
          >
            ⭐
          </span>
        ))}
      </div>
      <button
        onClick={() => goTo("home")}
        className="w-[220px] py-[15px] rounded-2xl border-none font-display font-bold text-[15px] tracking-wide text-[#171009] cursor-pointer"
        style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
      >
        <span className="font-hindi">Home par jao</span>
      </button>
    </div>
  );
}
