import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { getRankedCandidates } from "../data/helperPool";

export default function AIMatchingScreen() {
  const { goTo, selectedIssue, setWinner } = useApp();
  const [candidates, setCandidates] = useState([]);
  const [revealedScores, setRevealedScores] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [statusText, setStatusText] = useState("Nearby helpers scan ho rahe hain...");

  useEffect(() => {
    const ranked = getRankedCandidates(selectedIssue || "mechanic");
    setCandidates(ranked);
    setRevealedScores(false);
    setShowWinner(false);
    setStatusText("Nearby helpers scan ho rahe hain...");

    const scoreTimer = setTimeout(() => setRevealedScores(true), ranked.length * 150 + 200);
    const winnerTimer = setTimeout(() => {
      setStatusText("Best helper mil gaya!");
      setShowWinner(true);
      setWinner(ranked[0]);
    }, ranked.length * 150 + 1400);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(winnerTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIssue]);

  const winnerData = candidates[0];

  const reasons = winnerData
    ? [
        { label: "Distance", pct: Math.round(winnerData.distScore * 100), sub: `${winnerData.distanceKm} km door` },
        { label: "Rating", pct: Math.round(winnerData.ratingScore * 100), sub: `⭐ ${winnerData.rating}` },
        { label: "Skill match", pct: Math.round(winnerData.skillScore * 100), sub: `${Math.round(winnerData.skillScore * 100)}% required skill` },
        { label: "Availability", pct: Math.round(winnerData.availScore * 100), sub: `${Math.round(winnerData.availScore * 100)}% free abhi` },
        { label: "Success rate", pct: Math.round(winnerData.successScore * 100), sub: `${Math.round(winnerData.successScore * 100)}% past jobs solved` },
      ]
    : [];

  return (
    <div className="absolute inset-0 pt-[42px] flex flex-col animate-fadeIn">
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
        <div
          onClick={() => goTo("issues")}
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-line flex items-center justify-center cursor-pointer text-base"
        >
          ←
        </div>
        <div className="font-display font-bold text-[19px] font-hindi">AI Best Helper Dhoondh Raha Hai</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1.5 pb-10">
        <div className="flex items-center gap-3 rounded-2xl border border-accent px-4 py-3.5 mb-4.5 mb-[18px] bg-gradient-to-br from-[rgba(255,106,61,0.12)] to-[rgba(255,193,69,0.06)]">
          <div className="w-3 h-3 rounded-full bg-accent-2 flex-shrink-0 animate-aiPulse" />
          <div>
            <div className="text-[13.5px] font-bold font-hindi">{statusText}</div>
            <div className="text-[11px] text-text-dim mt-0.5 font-hindi">
              Atak Gaye AI Engine · distance, rating, skill, availability check kar raha hai
            </div>
          </div>
        </div>

        <div>
          {candidates.map((h, i) => {
            const isWinner = showWinner && i === 0;
            const isRejected = showWinner && i !== 0;
            return (
              <div
                key={h.name}
                className={`bg-card border rounded-2xl px-4 py-3.5 mb-2.5 opacity-0 translate-y-2 animate-candIn transition-opacity ${
                  isWinner ? "border-safe shadow-[0_0_0_1px_#2ECC71]" : "border-line"
                } ${isRejected ? "opacity-45" : ""}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-[38px] h-[38px] rounded-full bg-card-2 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {h.init}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold">{h.name}</div>
                    <div className="text-[10.5px] text-text-dim mt-0.5 font-hindi">{h.vehicle}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-display font-bold text-lg text-accent-2">
                      {revealedScores ? `${h.matchPercent}%` : "--"}
                    </div>
                    <div className="text-[9.5px] text-text-dim">Match</div>
                  </div>
                </div>
                <div className="h-[3px] w-full bg-line rounded-sm mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-[width] duration-500"
                    style={{
                      width: revealedScores ? `${h.matchPercent}%` : "0%",
                      background: "linear-gradient(90deg,#FF6A3D,#FFC145)",
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                  <div className="bg-card-2 rounded-lg py-1.5 px-1.5 text-center">
                    <div className="text-[11px] font-bold">{h.distanceKm} km</div>
                    <div className="text-[8.5px] text-text-dim mt-0.5 font-hindi">Distance</div>
                  </div>
                  <div className="bg-card-2 rounded-lg py-1.5 px-1.5 text-center">
                    <div className="text-[11px] font-bold">⭐ {h.rating}</div>
                    <div className="text-[8.5px] text-text-dim mt-0.5 font-hindi">Rating</div>
                  </div>
                  <div className="bg-card-2 rounded-lg py-1.5 px-1.5 text-center">
                    <div className="text-[11px] font-bold">{Math.round(h.successRate * 100)}%</div>
                    <div className="text-[8.5px] text-text-dim mt-0.5 font-hindi">Success rate</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showWinner && winnerData && (
          <div className="bg-card border border-safe rounded-2xl p-4 mt-1.5 opacity-0 animate-candIn">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-extrabold text-safe bg-[rgba(46,204,113,0.12)] px-2.5 py-1 rounded-full tracking-wide">
                ✅ AI CHOICE
              </div>
              <div className="font-display font-bold text-accent-2 text-[15px]">
                Match {winnerData.matchPercent}%
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2.5">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-[#576274] to-[#2c333f]">
                {winnerData.init}
              </div>
              <div>
                <div className="text-[15.5px] font-bold">{winnerData.name}</div>
                <div className="text-[11.5px] text-text-dim mt-0.5">
                  {winnerData.vehicle} · ETA {winnerData.etaMin} min
                </div>
              </div>
            </div>
            <div className="text-xs text-text-dim my-4 font-hindi">Isko kyun chuna gaya:</div>
            <div>
              {reasons.map((r) => (
                <div key={r.label} className="mb-2.5">
                  <div className="flex justify-between text-[11px] mb-1 text-text-dim">
                    <span>{r.label}</span>
                    <b className="text-text font-semibold">{r.sub}</b>
                  </div>
                  <div className="h-1.5 bg-card-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${r.pct}%`, background: "linear-gradient(90deg,#FF6A3D,#FFC145)" }}
                    />
                  </div>
                </div>
              ))}
              <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-safe bg-[rgba(46,204,113,0.12)] px-2.5 py-1 rounded-full mt-1.5">
                🤖 AI Confidence: {winnerData.matchPercent}%
              </div>
            </div>
          </div>
        )}
      </div>

      {showWinner && (
        <div className="px-5 pt-4 pb-[26px] bg-gradient-to-t from-bg via-bg/60 to-transparent">
          <button
            onClick={() => goTo("tracking")}
            className="w-full py-[15px] rounded-2xl border-none font-display font-bold text-[15px] tracking-wide text-[#171009] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
          >
            <span className="font-hindi">Confirm karo, bhejo →</span>
          </button>
        </div>
      )}
    </div>
  );
}
