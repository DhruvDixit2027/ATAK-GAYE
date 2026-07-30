import React, { useEffect, useState } from "react";
import { ArrowLeft, Star, MapPin, CheckCircle2, Bot, IndianRupee } from "lucide-react";
import { useApp } from "../context/AppContext";
import { BACKEND_URL } from "../config";
import { getAddressFromCoords } from "../utils";

// 👇 NAYA: display ke liye price (backend bhi apni taraf se yahi price charge karega,
// isliye ye sirf UI mein dikhane ke liye hai — asli security backend mein hai)
const DISPLAY_PRICING = {
  petrol: 100,
  mechanic: 200,
  tyre: 120,
  battery: 150,
  tow: 300,
};

export default function AIMatchingScreen() {
 const {
  goTo,
  selectedIssue,
  setWinner,
  user,
  setUser,
  setCurrentRequestId,
  liveLocation,
  showToast,
} = useApp();
  const [candidates, setCandidates] = useState([]);
  const [revealedScores, setRevealedScores] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [statusText, setStatusText] = useState("Aapki location le rahe hain...");

  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  // 👇 NAYA: payment ke waqt button disable/loading dikhane ke liye
  const [paying, setPaying] = useState(false);

  const price = DISPLAY_PRICING[selectedIssue] || 150;

  useEffect(() => {
    let scoreTimer;
    let winnerTimer;

    async function fetchMatches() {
      try {
        setStatusText("Aapki location le rahe hain...");
       if (!liveLocation) {
  setStatusText("GPS signal ka wait ho raha hai...");
  return;
}

const location = liveLocation;

setUserLocation(location);

if (user) {
  setUser({
    ...user,
    currentLocation: location,
  });
}

try {
  const address = await getAddressFromCoords(location.lat, location.lng);
  setUserAddress(address);
} catch (err) {
  console.error("Address fetch failed:", err);
}

        setStatusText("Nearby helpers scan ho rahe hain...");
        const res = await fetch(`${BACKEND_URL}/api/match`, {
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

        const ranked = data.allMatches.map(h => ({
          ...h,
          init: h.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          etaMin: Math.round(h.distanceKm * 2.5)
        }));

        setCandidates(ranked);
        setRevealedScores(false);
        setShowWinner(false);
        setSelectedId(null);
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
 }, [selectedIssue, liveLocation]);

  const chosenData = selectedId
    ? candidates.find((c) => c.id === selectedId)
    : candidates[0];

  const handleSelectCandidate = (helper) => {
    if (!showWinner) return;
    setSelectedId(helper.id);
    setWinner(helper);
  };

  // 👇 NAYA: request ko backend mein create karta hai — payment details ke saath
  const createRequestInBackend = async (paymentInfo) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/requests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          helperId: chosenData.id,
          issueType: selectedIssue || "mechanic",
          userLocation: userLocation || { lat: 26.4499, lng: 80.3319 },
          matchScore: chosenData.matchPercent,
          estimatedArrivalMin: chosenData.etaMin,
          amount: paymentInfo.amount,
          paymentId: paymentInfo.paymentId,
          orderId: paymentInfo.orderId,
          paymentStatus: "paid",
        }),
      });
      const data = await res.json();
      console.log("Request created:", data);
      setCurrentRequestId(data._id);
      goTo("tracking");
    } catch (err) {
      console.error("Request create karne mein error:", err);
      goTo("tracking");
    }
  };

  // 👇 BADLA: ab pehle payment hoga, tabhi request create hogi
  const handleConfirmRequest = async () => {
    if (!user || !user._id) {
      console.error("User details missing, request create nahi ho sakti");
      goTo("tracking");
      return;
    }
    if (!chosenData) return;

    setPaying(true);

    try {
      // Step 1: Backend se Razorpay order banwao
      const orderRes = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType: selectedIssue || "mechanic" }),
      });
      const orderData = await orderRes.json();

      if (!orderData.orderId) {
        showToast("Payment order banane mein error hua");
        setPaying(false);
        return;
      }

      // Step 2: Razorpay Checkout popup kholo
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Atak Gaye",
        description: `${selectedIssue || "Service"} - ${chosenData.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Step 3: Payment ke baad backend se verify karwao
          try {
            const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              showToast("✅ Payment successful!");
              await createRequestInBackend({
                amount: orderData.amount / 100,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              });
            } else {
              showToast("❌ Payment verify nahi ho paya");
            }
          } catch (err) {
            console.error("Verify error:", err);
            showToast("Payment verify karne mein error hua");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
            showToast("Payment cancel kar diya gaya");
          },
        },
        prefill: {
          name: user?.name || "",
          contact: user?.phone || "",
        },
        theme: { color: "#FF6A3D" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiate karne mein error:", err);
      showToast("Payment shuru nahi ho paya");
      setPaying(false);
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
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes itemIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .item-in {
          opacity: 0;
          animation: itemIn 0.45s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.12s; }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-up, .item-in {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top,#FFF2E9 0%,transparent 45%)",
        }}
      />

      {/* Header */}
      <div className="fade-in-up relative px-4 sm:px-5 pt-8 sm:pt-12 pb-2 max-w-md mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo("issues")}
            className="
            h-11 w-11 sm:h-12 sm:w-12
            shrink-0
            rounded-2xl
            bg-white
            border
            border-slate-100
            shadow-lg
            flex
            items-center
            justify-center
            text-slate-700
            active:scale-90
            transition-transform
          "
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
            AI Best Helper Dhoondh Raha Hai
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto px-4 sm:px-5 pt-3 pb-10">
        <div className="max-w-md mx-auto w-full">
          {/* Status banner */}
          <div
            className="
            fade-in-up delay-1
            flex
            items-center
            gap-3
            rounded-2xl sm:rounded-3xl
            border
            border-orange-200
            px-4 py-3.5
            mb-4
            bg-gradient-to-br
            from-orange-50
            to-amber-50
            shadow-sm
          "
          >
            <div className="relative shrink-0">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping absolute inset-0" />
              <div className="w-3 h-3 rounded-full bg-orange-500 relative" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900">{statusText}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Atak Gaye AI Engine · distance, rating, skill, availability check kar raha hai
              </div>
              {userAddress && (
                <div className="flex items-center gap-1 text-[10.5px] text-orange-600 font-semibold mt-1 truncate">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{userAddress}</span>
                </div>
              )}
            </div>
          </div>

          {showWinner && (
            <div className="fade-in-up delay-2 text-[11px] text-slate-500 mb-3">
              👆 Chahe to niche list mein se koi aur helper bhi chun sakte ho
            </div>
          )}

          {/* Candidates */}
          <div className="flex flex-col gap-2.5">
            {candidates.map((h, index) => {
              const isChosen = showWinner && chosenData && h.id === chosenData.id;
              const isDimmed = showWinner && chosenData && h.id !== chosenData.id;
              return (
                <div
                  key={h.id || h.name}
                  onClick={() => handleSelectCandidate(h)}
                  className={`item-in bg-white border rounded-2xl sm:rounded-3xl px-4 py-3.5 shadow-lg transition-all ${
                    isChosen
                      ? "border-green-500 shadow-green-100"
                      : "border-slate-100"
                  } ${isDimmed ? "opacity-45" : ""} ${
                    showWinner ? "cursor-pointer active:scale-[0.98]" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 sm:w-[38px] sm:h-[38px] rounded-full bg-orange-50 flex items-center justify-center text-sm font-bold text-orange-600 shrink-0">
                      {h.init}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{h.name}</div>
                      <div className="text-[10.5px] text-slate-500 mt-0.5 truncate">{h.vehicle}</div>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <div className="text-lg font-black text-orange-500">
                        {revealedScores ? `${h.matchPercent}%` : "--"}
                      </div>
                      <div className="text-[9.5px] text-slate-400">Match</div>
                    </div>
                  </div>

                  <div className="h-[3px] w-full bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: revealedScores ? `${h.matchPercent}%` : "0%",
                        background: "linear-gradient(90deg,#FF6A3D,#FFC145)",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                    <div className="bg-slate-50 rounded-lg py-1.5 px-1.5 text-center">
                      <div className="text-[11px] font-bold text-slate-900">{h.distanceKm} km</div>
                      <div className="text-[8.5px] text-slate-500 mt-0.5">Distance</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg py-1.5 px-1.5 text-center">
                      <div className="text-[11px] font-bold text-slate-900">⭐ {h.rating}</div>
                      <div className="text-[8.5px] text-slate-500 mt-0.5">Rating</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg py-1.5 px-1.5 text-center">
                      <div className="text-[11px] font-bold text-slate-900">
                        {Math.round(h.successRate * 100)}%
                      </div>
                      <div className="text-[8.5px] text-slate-500 mt-0.5">Success rate</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winner detail card */}
          {showWinner && chosenData && (
            <div className="item-in bg-white border border-green-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mt-3 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-full tracking-wide">
                  <CheckCircle2 size={13} />
                  {selectedId ? "AAPKA CHOICE" : "AI CHOICE"}
                </div>
                <div className="font-black text-orange-500 text-sm sm:text-base shrink-0">
                  Match {chosenData.matchPercent}%
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <div className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white bg-gradient-to-br from-orange-500 to-orange-300 shrink-0 shadow-lg">
                  {chosenData.init}
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {chosenData.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {chosenData.vehicle} · ETA {chosenData.etaMin} min
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 my-4">
                <Bot size={14} className="text-orange-500" />
                Isko kyun chuna gaya:
              </div>

              <div>
                {reasons.map((r) => (
                  <div key={r.label} className="mb-2.5">
                    <div className="flex justify-between text-[11px] mb-1 text-slate-500">
                      <span>{r.label}</span>
                      <b className="text-slate-900 font-semibold">{r.sub}</b>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${r.pct}%`, background: "linear-gradient(90deg,#FF6A3D,#FFC145)" }}
                      />
                    </div>
                  </div>
                ))}
                <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full mt-1.5">
                  <Bot size={12} />
                  AI Confidence: {chosenData.matchPercent}%
                </div>
              </div>

              {/* 👇 NAYA: Price card */}
              <div className="mt-4 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <IndianRupee size={16} className="text-orange-500" />
                  Service Charge
                </div>
                <div className="text-xl font-black text-orange-600">₹{price}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      {showWinner && (
        <div className="relative px-4 sm:px-5 pt-6 pb-6 sm:pb-8 bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent">
          <div className="max-w-md mx-auto w-full">
            <button
              onClick={handleConfirmRequest}
              disabled={paying}
              className="
              w-full
              py-3.5 sm:py-4
              rounded-2xl
              font-bold
              text-sm sm:text-base
              text-white
              tracking-wide
              shadow-[0_20px_40px_rgba(249,115,22,.35)]
              bg-gradient-to-r
              from-orange-500
              to-orange-600
              active:scale-95
              transition-all
              disabled:opacity-60
            "
            >
              {paying ? "Payment ho raha hai..." : `Pay Now ₹${price} →`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}