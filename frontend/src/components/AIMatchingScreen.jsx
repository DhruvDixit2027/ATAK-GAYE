import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { getCurrentLocation } from "../utils";

export default function AIMatchingScreen() {
  const { goTo, selectedIssue, setWinner, user, setCurrentRequestId } = useApp();
  const [candidates, setCandidates] = useState([]);
  const [revealedScores, setRevealedScores] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [statusText, setStatusText] = useState("Aapki location le rahe hain...");

  // 👇 NAYA: real GPS location yahan store hogi
  const [userLocation, setUserLocation] = useState(null);

  // 👇 Naya: user manually kisko select karta hai, wo yahan track hota hai.
  // null hone ka matlab hai "AI ke default winner (candidates[0]) ko hi use karo"
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let scoreTimer;
    let winnerTimer;

    async function fetchMatches() {
      try {
        // 👇 NAYA: hardcoded location ki jagah real GPS location lo
        setStatusText("Aapki location le rahe hain...");
        let location;
        try {
          location = await getCurrentLocation();
          setUserLocation(location);
        } catch (locErr) {
          console.error("Location nahi mil payi:", locErr);
          setStatusText("Location access nahi mili — settings check karo");
          return;
        }

        setStatusText("Nearby helpers scan ho rahe hain...");

        const res = await fetch("http://localhost:5000/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: location.lat,
            lng: location.lng,
            serviceType: selectedIssue || "mechanic"
          })
        });
        const data = await res.json();

        if (!data.success) {
          setStatusText(data.message || "Koi helper nahi mila");
          return;
        }

        // Backend fields ko frontend format mein map karo
        const ranked = data.allMatches.map(h => ({
          ...h,
          init: h.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          etaMin: Math.round(h.distanceKm * 2.5) // rough estimate, backend abhi ETA nahi deta
        }));

        setCandidates(ranked);
        setRevealedScores(false);
        setShowWinner(false);
        setSelectedId(null); // naya match cycle shuru hote hi selection reset karo
        setStatusText("Nearby helpers scan ho rahe hain...");

        scoreTimer = setTimeout(() => setRevealedScores(true), ranked.length * 150 + 200);
        winnerTimer = setTimeout(() => {
          setStatusText("Best helper mil gaya!");
          setShowWinner(true);
          setWinner(ranked[0]);
        }, ranked.length * 150 + 1400);
      } catch (err) {
        console.error("Match fetch failed:", err);
        setStatusText("Backend se connect nahi ho paya");
      }
    }

    fetchMatches();

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(winnerTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIssue]);

  // Jo bhi currently "chosen" hai — ya to user ne manually select kiya, ya AI ka default winner
  const chosenData = selectedId
    ? candidates.find((c) => c.id === selectedId)
    : candidates[0];

  // User kisi bhi card pe click karke apni pasand badal sake
  const handleSelectCandidate = (helper) => {
    if (!showWinner) return; // scores reveal hone se pehle select karna allow mat karo
    setSelectedId(helper.id);
    setWinner(helper); // context mein bhi update ho jaaye, taaki tracking screen isi ko use kare
  };

  // Backend mein request create karta hai — jo bhi currently chosen hai, usी ke liye
  const handleConfirmRequest = async () => {
    if (!user || !user._id) {
      console.error("User details missing, request create nahi ho sakti");
      goTo("tracking"); // fallback, taaki UI atke nahi
      return;
    }
    if (!chosenData) return;

    try {
      const res = await fetch("http://localhost:5000/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          helperId: chosenData.id,
          issueType: selectedIssue || "mechanic",
          // 👇 NAYA: real location use ho rahi hai, hardcoded nahi
          userLocation: userLocation || { lat: 26.4499, lng: 80.3319 },
          matchScore: chosenData.matchPercent,
          estimatedArrivalMin: chosenData.etaMin,
        }),
      });
      const data = await res.json();
      console.log("Request created:", data);
      setCurrentRequestId(data._id);   // 👈 is ID se tracking screen status poll karegi
      goTo("tracking");
    } catch (err) {
      console.error("Request create karne mein error:", err);
      goTo("tracking"); // fallback, taaki UI atke nahi
    }
  };

  const reasons = chosenData
    ? [
        { label: "Distance", pct: Math.round(chosenData.distScore * 100), sub: `${chosenData.distanceKm} km door` },
        { label: "Rating", pct: Math.round(chosenData.ratingScore * 100), sub: `⭐ ${chosenData.rating}` },
        { label: "Skill match", pct: Math.round(chosenData.skillScore * 100), sub: `${Math.round(chosenData.skillScore * 100)}% required skill` },
        { label: "Availability", pct: Math.round(chosenData.availScore * 100), sub: `${Math.round(chosenData.availScore * 100)}% free abhi` },
        { label: "Success rate", pct: Math.round(chosenData.successScore * 100), sub: `${Math.round(chosenData.successScore * 100)}% past jobs solved` },
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

        {showWinner && (
          <div className="text-[11px] text-text-dim mb-2.5 font-hindi">
            👆 Chahe to niche list mein se koi aur helper bhi chun sakte ho
          </div>
        )}

        <div>
          {candidates.map((h) => {
            const isChosen = showWinner && chosenData && h.id === chosenData.id;
            const isDimmed = showWinner && chosenData && h.id !== chosenData.id;
            return (
              <div
                key={h.id || h.name}
                onClick={() => handleSelectCandidate(h)}
                className={`bg-card border rounded-2xl px-4 py-3.5 mb-2.5 opacity-0 translate-y-2 animate-candIn transition-opacity ${
                  isChosen ? "border-safe shadow-[0_0_0_1px_#2ECC71]" : "border-line"
                } ${isDimmed ? "opacity-45" : ""} ${showWinner ? "cursor-pointer" : ""}`}
                style={{ animationDelay: `${candidates.indexOf(h) * 0.15}s` }}
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

        {showWinner && chosenData && (
          <div className="bg-card border border-safe rounded-2xl p-4 mt-1.5 opacity-0 animate-candIn">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-extrabold text-safe bg-[rgba(46,204,113,0.12)] px-2.5 py-1 rounded-full tracking-wide">
                {selectedId ? "✅ AAPKA CHOICE" : "✅ AI CHOICE"}
              </div>
              <div className="font-display font-bold text-accent-2 text-[15px]">
                Match {chosenData.matchPercent}%
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2.5">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-[#576274] to-[#2c333f]">
                {chosenData.init}
              </div>
              <div>
                <div className="text-[15.5px] font-bold">{chosenData.name}</div>
                <div className="text-[11.5px] text-text-dim mt-0.5">
                  {chosenData.vehicle} · ETA {chosenData.etaMin} min
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
                🤖 AI Confidence: {chosenData.matchPercent}%
              </div>
            </div>
          </div>
        )}
      </div>

      {showWinner && (
        <div className="px-5 pt-4 pb-[26px] bg-gradient-to-t from-bg via-bg/60 to-transparent">
          <button
            onClick={handleConfirmRequest}
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