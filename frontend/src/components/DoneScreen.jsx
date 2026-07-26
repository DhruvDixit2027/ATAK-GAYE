import React, { useState } from "react";
import { CheckCircle2, Home } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function DoneScreen() {
  const { goTo, winner, showToast } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const name = winner?.name || "Helper";

  const rate = (n) => {
    setRating(n);
    showToast(`Dhanyawaad! Aapki rating save ho gayi ⭐${n}`);
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center text-center px-8 py-10 overflow-hidden">
      <style>{`
        @keyframes popCheck {
          0% { opacity: 0; transform: scale(0.4) rotate(-10deg); }
          60% { opacity: 1; transform: scale(1.15) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes ringExpand {
          0% { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 0; transform: scale(1.8); }
        }
        @keyframes confettiFall {
          0% { opacity: 0; transform: translateY(-20px) rotate(0deg); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translateY(90px) rotate(200deg); }
        }
        @keyframes textIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes starPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.25); }
          100% { transform: scale(1); opacity: 1; }
        }
        .pop-check { animation: popCheck 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .ring-expand { animation: ringExpand 1.8s ease-out infinite; }
        .confetti-dot { animation: confettiFall 2.2s ease-in infinite; }
        .text-in { opacity: 0; animation: textIn 0.5s ease-out forwards; }
        .star-pop { animation: starPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      {/* Confetti dots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none">
        <div className="confetti-dot absolute left-[10%] top-0 w-2 h-2 rounded-full bg-orange-400" style={{ animationDelay: "0s" }} />
        <div className="confetti-dot absolute left-[30%] top-0 w-2.5 h-2.5 rounded-sm bg-yellow-400" style={{ animationDelay: "0.3s" }} />
        <div className="confetti-dot absolute left-[55%] top-0 w-2 h-2 rounded-full bg-green-400" style={{ animationDelay: "0.6s" }} />
        <div className="confetti-dot absolute left-[70%] top-0 w-2.5 h-2.5 rounded-sm bg-orange-300" style={{ animationDelay: "0.15s" }} />
        <div className="confetti-dot absolute left-[85%] top-0 w-2 h-2 rounded-full bg-yellow-300" style={{ animationDelay: "0.45s" }} />
      </div>

      {/* Checkmark with expanding rings */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="ring-expand absolute w-20 h-20 rounded-full border-2 border-green-300" />
        <div className="ring-expand absolute w-20 h-20 rounded-full border-2 border-green-300" style={{ animationDelay: "0.6s" }} />
        <div className="pop-check relative w-20 h-20 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center shadow-lg">
          <CheckCircle2 size={38} className="text-green-500" strokeWidth={2.2} />
        </div>
      </div>

      <h2 className="text-in text-2xl font-black text-slate-900" style={{ animationDelay: "0.3s" }}>
        Madad mil gayi!
      </h2>
      <div className="text-in text-sm text-slate-500 mt-2 max-w-xs" style={{ animationDelay: "0.4s" }}>
        {name} ne aapki problem solve kar di. Umeed hai ab safar smooth chalega.
      </div>

      {/* Rating card */}
      <div className="text-in bg-white rounded-2xl shadow-lg border border-slate-100 px-6 py-5 mt-6 w-full max-w-xs" style={{ animationDelay: "0.5s" }}>
        <div className="text-xs font-semibold text-slate-500 mb-3">
          {name} ko rate karo
        </div>
        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => rate(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className="star-pop text-3xl leading-none cursor-pointer active:scale-90 transition-transform"
              style={{ animationDelay: `${0.55 + n * 0.06}s` }}
            >
              <span
                className={
                  n <= (hoverRating || rating)
                    ? "text-yellow-400"
                    : "text-slate-200"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div className="text-in text-xs text-green-600 font-semibold mt-3">
            Shukriya! Aapne {rating} star diye ⭐
          </div>
        )}
      </div>

      <button
        onClick={() => goTo("home")}
        className="text-in w-full max-w-xs mt-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)",
          animationDelay: "0.65s",
        }}
      >
        <Home size={18} />
        Home par jao
      </button>
    </div>
  );
}