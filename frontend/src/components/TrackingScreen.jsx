import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";

const PATH = [
  [120, 150],
  [160, 130],
  [190, 120],
  [230, 105],
  [270, 85],
  [310, 55],
  [360, 30],
];

const DEFAULT_WINNER = {
  name: "Ravi Kumar",
  init: "RK",
  vehicle: "Bajaj Pulsar · MP09 XX 4521",
  etaMin: 6,
  rating: 4.8,
};

export default function TrackingScreen() {
  const { goTo, winner, showToast } = useApp();
  const w = winner || DEFAULT_WINNER;
  const firstName = w.name.split(" ")[0];

  const [step, setStep] = useState(0);
  const [arrived, setArrived] = useState(false);
  const intervalRef = useRef(null);

  const totalSteps = PATH.length - 1;
  const etaSeries = Array.from({ length: PATH.length }, (_, i) =>
    Math.max(0, Math.round(w.etaMin - (w.etaMin / totalSteps) * i))
  );

  useEffect(() => {
    setStep(0);
    setArrived(false);
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setStep((prev) => {
        const next = prev + 1;
        if (next >= PATH.length) {
          clearInterval(intervalRef.current);
          setArrived(true);
          showToast(`🟢 ${w.name} pahunch gaya hai — OTP share karein`);
          setTimeout(() => goTo("done"), 1800);
          return prev;
        }
        return next;
      });
    }, 900);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.name]);

  const [cx, cy] = PATH[step];
  const etaText = arrived ? 0 : etaSeries[step];

  return (
    <div className="absolute inset-0 flex flex-col animate-fadeIn">
      <div className="relative h-[260px] rounded-b-[28px] overflow-hidden track-map-bg">
        <div className="absolute top-4 left-5 bg-[#0B0D10d9] border border-line px-3.5 py-2 rounded-2xl text-xs">
          Pahunchne mein <b className="text-accent-2 text-sm">{arrived ? "aa gaya!" : `${etaText} min`}</b>
        </div>
        <svg viewBox="0 0 400 260" className="w-full h-full">
          <path
            d="M40,230 C100,190 120,140 190,120 C260,100 300,60 360,30"
            stroke="#3a4250"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="40" cy="230" r="7" fill="#2ECC71" />
          <circle cx={cx} cy={cy} r="9" fill="#FF6A3D">
            <animate attributeName="r" values="9;12;9" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="360" cy="30" r="7" fill="#FFC145" />
        </svg>
        <div
          onClick={() => goTo("home")}
          className="absolute top-4 right-4 w-[34px] h-[34px] rounded-[10px] bg-card border border-line flex items-center justify-center cursor-pointer"
        >
          ✕
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-safe bg-[rgba(46,204,113,0.12)] px-2.5 py-1 rounded-full mx-5 mt-2.5 mb-2.5 w-fit font-hindi">
        🤖 AI ne is helper ko sabse best match chuna
      </div>

      <div className="-mt-[30px] mx-5 bg-card border border-line rounded-[20px] p-4.5 p-[18px] relative z-[5]">
        <div className="flex items-center gap-3">
          <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-[#576274] to-[#2c333f]">
            {w.init}
          </div>
          <div>
            <div className="text-[15.5px] font-bold">{w.name}</div>
            <div className="text-[11.5px] text-text-dim mt-0.5 font-hindi">
              ⭐ {w.rating} · {w.vehicle}
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-4">
          <div
            onClick={() => showToast("💬 Chat khul gayi (demo)")}
            className="flex-1 py-3 rounded-xl border border-line bg-card-2 text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            💬 Chat
          </div>
          <div
            onClick={() => showToast("📞 Helper ko call ho raha hai...")}
            className="flex-1 py-3 rounded-xl bg-safe text-[#0B0D10] text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            📞 Call
          </div>
        </div>
      </div>

      <div className="mx-5 mt-4.5 mt-[18px] bg-card-2 border border-dashed border-accent-2 rounded-2xl px-4 py-3.5 flex items-center justify-between">
        <div className="text-[11.5px] text-text-dim font-hindi">Helper ko yeh OTP dikhaayein</div>
        <div className="font-display font-bold text-[22px] tracking-[6px] text-accent-2">4471</div>
      </div>

      <div className="mx-5 mt-5">
        <div className="flex gap-3 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-safe" />
            <div className="w-0.5 flex-1 bg-safe my-1" />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">Request confirm ho gayi</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">Just now</div>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${arrived ? "bg-safe" : "bg-accent-2 shadow-[0_0_0_4px_rgba(255,193,69,0.2)]"}`} />
            <div className={`w-0.5 flex-1 my-1 ${arrived ? "bg-safe" : "bg-line"}`} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">{firstName} aapki taraf aa raha hai</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">
              {arrived ? `${firstName} pahunch gaya!` : `ETA ${etaText} min`}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${arrived ? "bg-accent-2 shadow-[0_0_0_4px_rgba(255,193,69,0.2)]" : "bg-line"}`} />
          </div>
          <div>
            <div className="text-[13.5px] font-semibold font-hindi">Madad complete</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
