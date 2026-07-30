import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  Phone,
  Clock3,
  Star,
  Car,
  FuelIcon,
  BatteryCharging,
  Wrench,
  ChevronRight,
  Navigation,
  Siren,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ISSUES } from "../data/helperPool";
import { getAddressFromCoords } from "../utils";
import BottomNav from "./BottomNav";
import logo from "../assets/atakgaye-logo.png";

const HELPER_MESSAGES = [
  "Main aa raha hoon, aapki madad karne 🙋‍♂️",
  "Aapki location mil gayi, nikal chuka hoon 🚗",
  "Bas thodi der mein pahunch raha hoon 💪",
];

export default function HomeScreen() {
  const { goTo, setSelectedIssue, showToast, liveLocation, locationError } = useApp();

  const [locationLabel, setLocationLabel] = useState(
    "Getting your location..."
  );
  const [helperMsgIndex, setHelperMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHelperMsgIndex((i) => (i + 1) % HELPER_MESSAGES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();

    if (h < 12)
      return {
        title: "Good Morning ☀️",
        subtitle: "Ready to help whenever you need.",
      };

    if (h < 17)
      return {
        title: "Good Afternoon 🌤",
        subtitle: "Drive safely. We are always with you.",
      };

    return {
      title: "Good Evening 🌙",
      subtitle: "Don't worry if you're stuck.",
    };
  }, []);

  const lastGeocodedRef = React.useRef(null);

  useEffect(() => {
    if (locationError) {
      setLocationLabel("Location unavailable");
      return;
    }
    if (!liveLocation) return;
    console.log("🔍 RAW GPS COORDS:", liveLocation.lat, liveLocation.lng, "| accuracy:", liveLocation.accuracy, "meters");

    // ~300m se kam move hua ho to dubara reverse-geocode mat karo
    // (Nominatim free API rate-limited hai, har GPS tick pe call nahi bhejna)
    const last = lastGeocodedRef.current;
    if (last) {
      const dLat = liveLocation.lat - last.lat;
      const dLng = liveLocation.lng - last.lng;
      const roughMeters = Math.sqrt(dLat ** 2 + dLng ** 2) * 111000;
      if (roughMeters < 300) return;
    }

    let cancelled = false;

    async function loadAddress() {
      try {
        const address = await getAddressFromCoords(
          liveLocation.lat,
          liveLocation.lng
        );
        if (cancelled) return;

        lastGeocodedRef.current = { lat: liveLocation.lat, lng: liveLocation.lng };
        const short = address.split(",").slice(0, 2).join(",").trim();
        setLocationLabel(short || "Current Location");
      } catch {
        if (!cancelled) setLocationLabel("Location unavailable");
      }
    }

    loadAddress();
    return () => {
      cancelled = true;
    };
  }, [liveLocation, locationError]);

  const openIssue = (id) => {
    setSelectedIssue(id);
    goTo("issues");
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.7); }
          70% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 0.6; }
          75%, 100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes helperBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes helperWalk {
          0% { left: -8%; }
          100% { left: 104%; }
        }
        @keyframes helperMsgIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .pop-in {
          opacity: 0;
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-ping-slow {
          animation: pingSlow 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .helper-bob {
          animation: helperBob 1.6s ease-in-out infinite;
        }
        .helper-walk {
          animation: helperWalk 3.5s linear infinite;
        }
        @keyframes sosBreathe {
          0%, 100% { transform: scale(1); box-shadow: 0 25px 50px rgba(225,29,72,.5); }
          50% { transform: scale(1.035); box-shadow: 0 30px 60px rgba(225,29,72,.65); }
        }
        @keyframes sosHalo {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes sosRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sos-breathe {
          animation: sosBreathe 2.4s ease-in-out infinite;
        }
        .sos-halo {
          animation: sosHalo 2.4s ease-in-out infinite;
        }
        .sos-ring-spin {
          animation: sosRingSpin 8s linear infinite;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.15s; }
        .delay-3 { animation-delay: 0.25s; }
        .delay-4 { animation-delay: 0.35s; }
        .delay-5 { animation-delay: 0.45s; }
        .delay-6 { animation-delay: 0.5s; }
        .delay-7 { animation-delay: 0.55s; }
        .delay-8 { animation-delay: 0.6s; }
        .delay-9 { animation-delay: 0.65s; }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-up, .pop-in, .animate-ping-slow, .helper-bob, .helper-walk, .helper-msg-in, .sos-breathe, .sos-halo, .sos-ring-spin {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            left: auto !important;
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

      <div className="relative flex-1 overflow-y-auto pb-24">
        <div className="px-4 sm:px-5 pt-5 sm:pt-6 max-w-md mx-auto w-full">
          {/* Header — logo/name gets its own full-width row so it never gets squeezed */}
          <div className="fade-in-up flex items-center gap-3">
            <img
              src={logo}
              alt="Atak Gaye logo"
              className="
              h-10 w-10 sm:h-11 sm:w-11
              shrink-0
              rounded-full
              object-cover
              shadow-xl
              ring-2 ring-white
            "
            />

            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                Atak Gaye
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                Emergency Road Assistance
              </div>
            </div>

            {/* Location pill moved inline with header to save a row */}
            <div
              className="
              bg-white
              rounded-2xl
              px-2.5 py-1.5
              shadow-lg
              border
              border-slate-100
              max-w-[42%]
              shrink-0
            "
            >
              <div className="flex items-center gap-1">
                <MapPin size={13} className="text-orange-500 shrink-0" />
                <div className="text-[10px] font-semibold text-slate-700 truncate">
                  {locationLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div
            className="
            fade-in-up delay-2
            mt-3 sm:mt-4
            rounded-2xl sm:rounded-3xl
            bg-white
            p-4 sm:p-5
            shadow-xl
            border
            border-slate-100
          "
          >
            <div className="text-xs text-slate-500">{greeting.title}</div>

            <h1
              className="
              mt-1.5
              text-2xl sm:text-3xl
              font-black
              leading-tight
              text-slate-900
            "
            >
              Stuck on the road?
            </h1>

            <div className="mt-1.5 text-orange-500 font-bold text-base sm:text-lg">
              We're just one tap away.
            </div>

            <div className="mt-2 text-slate-500 leading-5 text-xs sm:text-sm">
              {greeting.subtitle}
            </div>
          </div>

          {/* Helper on the way */}
          <div
            className="
            fade-in-up delay-3
            mt-3
            rounded-2xl
            bg-white
            p-3 sm:p-3.5
            shadow-lg
            border
            border-slate-100
            overflow-hidden
          "
          >
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0 w-9 h-9 sm:w-10 sm:h-10">
                <svg
                  viewBox="0 0 48 48"
                  className="helper-bob w-full h-full"
                  aria-hidden="true"
                >
                  <circle cx="24" cy="24" r="24" fill="#EA580C" />
                  <circle cx="24" cy="17" r="6" fill="#FFF" />
                  <path
                    d="M11 39c1.5-8 6-12 13-12s11.5 4 13 12"
                    fill="#FFF"
                  />
                  <rect
                    x="27"
                    y="24"
                    width="9"
                    height="3.4"
                    rx="1.7"
                    fill="#EA580C"
                    transform="rotate(35 27 24)"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Madad raaste mein hai
                </div>
                <div
                  key={helperMsgIndex}
                  className="helper-msg-in text-[11px] sm:text-xs text-slate-500 truncate"
                >
                  {HELPER_MESSAGES[helperMsgIndex]}
                </div>
              </div>

              <div className="shrink-0 bg-green-50 text-green-600 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                ON THE WAY
              </div>
            </div>

            <div className="relative mt-2.5 h-5 overflow-hidden">
              <div
                className="
                absolute
                left-0
                right-0
                top-1/2
                -translate-y-1/2
                h-[2px]
                bg-[repeating-linear-gradient(90deg,#FDBA74_0px,#FDBA74_10px,transparent_10px,transparent_20px)]
              "
              />
              <div className="helper-walk absolute top-1/2 -translate-y-1/2">
                <Car size={16} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Live location — compact version */}
          <div
            className="
            fade-in-up delay-4
            mt-3
            rounded-2xl
            overflow-hidden
            bg-gradient-to-br
            from-slate-900
            via-slate-800
            to-slate-900
            shadow-2xl
            relative
          "
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1px,transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="relative p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className="
                      absolute
                      -inset-2
                      rounded-full
                      bg-orange-500/25
                      animate-ping-slow
                    "
                    />
                    <div
                      className="
                      relative
                      h-9 w-9
                      rounded-full
                      bg-orange-500
                      flex
                      items-center
                      justify-center
                      shadow-xl
                    "
                    >
                      <Navigation size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-bold">
                      Live Location
                    </div>
                    <div className="text-slate-300 text-[11px] truncate">
                      {locationLabel}
                    </div>
                  </div>
                </div>

                <div
                  className="
                  bg-white/10
                  backdrop-blur-xl
                  rounded-full
                  px-2.5 py-1
                  flex
                  items-center
                  gap-1.5
                  shrink-0
                "
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <div className="text-white text-[10px]">LIVE</div>
                </div>
              </div>
            </div>
          </div>

          {/* SOS */}
          <div className="pop-in delay-5 mt-6 sm:mt-7 flex justify-center">
            <button
              onClick={() => openIssue(null)}
              className="relative active:scale-90 transition-transform"
            >
              {/* soft glow halo, synced to the same 2.4s cycle as the button's breathing */}
              <div
                className="
                absolute
                -inset-3 sm:-inset-4
                rounded-full
                bg-red-500/30
                blur-xl
                sos-halo
              "
              />
              {/* slow-rotating dashed alert ring — distinct signature, doesn't compete for attention */}
              <div
                className="
                absolute
                -inset-5 sm:-inset-6
                rounded-full
                border-2
                border-dashed
                border-red-300/70
                sos-ring-spin
              "
              />
              <div
                className="
                relative
                w-24 h-24 sm:w-28 sm:h-28
                rounded-full
                bg-gradient-to-br
                from-red-400
                via-red-500
                to-rose-700
                flex
                flex-col
                items-center
                justify-center
                gap-0.5
                text-white
                shadow-[0_25px_50px_rgba(225,29,72,.5)]
                sos-breathe
                ring-4
                ring-white/40
              "
              >
                <Siren size={18} />
                <span className="text-xl sm:text-2xl font-black tracking-wide">
                  SOS
                </span>
              </div>
            </button>
          </div>

          <div className="fade-in-up delay-6 mt-2.5 text-center">
            <p className="text-slate-600 text-[11px] sm:text-xs">
              Tap the SOS button for immediate roadside assistance.
            </p>
          </div>

          {/* Stats — compact inline strip instead of tall cards */}
          <div className="fade-in-up delay-6 mt-4 sm:mt-5 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center divide-x divide-slate-100">
            <div className="flex-1 flex flex-col items-center py-2.5">
              <Clock3 className="text-orange-500" size={16} />
              <div className="mt-1 text-sm font-black text-slate-900">2m</div>
              <div className="text-slate-500 text-[9px] leading-tight">
                Avg Response
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center py-2.5">
              <Star className="text-yellow-500" size={16} />
              <div className="mt-1 text-sm font-black text-slate-900">4.9</div>
              <div className="text-slate-500 text-[9px] leading-tight">
                Rating
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center py-2.5">
              <ShieldCheck className="text-green-600" size={16} />
              <div className="mt-1 text-sm font-black text-slate-900">
                500+
              </div>
              <div className="text-slate-500 text-[9px] leading-tight">
                Helpers
              </div>
            </div>
          </div>

          {/* Quick Help */}
          <div className="mt-5 sm:mt-6">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Quick Help
              </h2>
              <button
                onClick={() => openIssue(null)}
                className="
                text-orange-500
                text-xs
                font-bold
                flex
                items-center
                gap-0.5
                active:scale-95
                transition-transform
                hover:text-orange-600
              "
              >
                View All
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {ISSUES.slice(0, 4).map((item, index) => {
                const icons = [
                  <Car size={18} />,
                  <FuelIcon size={18} />,
                  <BatteryCharging size={18} />,
                  <Wrench size={18} />,
                ];

                return (
                 <div
                  key={item.id}
                   onClick={() => openIssue(item.id)}
                   style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                     className="fade-in-up bg-white rounded-2xl p-3 sm:p-3.5 shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all min-w-0 cursor-pointer"
>
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                      {icons[index]}
                    </div>
                    <div className="mt-2 text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="mt-1 text-[10px] sm:text-xs text-slate-500 leading-4 line-clamp-2">
                      {item.sub}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-orange-500 font-semibold text-[11px] sm:text-xs">
                        Get Help
                      </span>
                      <ChevronRight className="text-orange-500" size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergency Card — compact slim bar instead of tall card */}
          <div
            className="
            fade-in-up delay-9
            mt-5 sm:mt-6
            rounded-2xl
            bg-gradient-to-r
            from-green-500
            to-green-600
            p-3.5 sm:p-4
            shadow-2xl
            text-white
          "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                w-11 h-11
                shrink-0
                rounded-full
                bg-white/20
                flex
                items-center
                justify-center
              "
              >
                <Phone size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-base font-black truncate">
                  Highway Patrol
                </div>
                <div className="text-green-100 text-[11px]">
                  24×7 Emergency · <span className="font-bold text-white">1073</span>
                </div>
              </div>

              <button
                onClick={() => showToast("📞 Calling Highway Patrol...")}
                className="
                shrink-0
                rounded-xl
                bg-white
                text-green-600
                px-4 py-2
                font-bold
                text-xs sm:text-sm
                active:scale-95
                transition-all
              "
              >
                Call Now
              </button>
            </div>
          </div>

          <div className="h-16" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}