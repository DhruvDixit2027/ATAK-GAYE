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
import { getCurrentLocation, getAddressFromCoords } from "../utils";
import BottomNav from "./BottomNav";
import logo from "../assets/atakgaye-logo.png";

const HELPER_MESSAGES = [
  "Main aa raha hoon, aapki madad karne 🙋‍♂️",
  "Aapki location mil gayi, nikal chuka hoon 🚗",
  "Bas thodi der mein pahunch raha hoon 💪",
];

export default function HomeScreen() {
  const { goTo, setSelectedIssue, showToast } = useApp();

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

  useEffect(() => {
    async function loadLocation() {
      try {
        const loc = await getCurrentLocation();

        const address = await getAddressFromCoords(loc.lat, loc.lng);

        const short = address
          .split(",")
          .slice(0, 2)
          .join(",")
          .trim();

        setLocationLabel(short || "Current Location");
      } catch {
        setLocationLabel("Location unavailable");
      }
    }

    loadLocation();
  }, []);

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

      <div className="relative flex-1 overflow-y-auto pb-32">
        <div className="px-4 sm:px-5 pt-8 sm:pt-12 max-w-md mx-auto w-full">
          {/* Header — logo/name gets its own full-width row so it never gets squeezed */}
          <div className="fade-in-up flex items-center gap-3">
            <img
              src={logo}
              alt="Atak Gaye logo"
              className="
              h-12 w-12 sm:h-14 sm:w-14
              shrink-0
              rounded-full
              object-cover
              shadow-xl
              ring-2 ring-white
            "
            />

            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                Atak Gaye
              </div>
              <div className="text-xs sm:text-sm text-slate-500 truncate">
                Emergency Road Assistance
              </div>
            </div>
          </div>

          {/* Location pill — own row, right aligned, full text visible */}
          <div className="fade-in-up delay-1 mt-3 flex justify-end">
            <div
              className="
              bg-white
              rounded-2xl
              px-3.5 py-2
              shadow-lg
              border
              border-slate-100
              max-w-full
            "
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin size={15} className="text-orange-500 shrink-0" />
                <div className="text-xs font-semibold text-slate-700 truncate max-w-[220px] sm:max-w-[280px]">
                  {locationLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div
            className="
            fade-in-up delay-2
            mt-6 sm:mt-9
            rounded-3xl sm:rounded-[30px]
            bg-white
            p-5 sm:p-6
            shadow-xl
            border
            border-slate-100
          "
          >
            <div className="text-sm text-slate-500">{greeting.title}</div>

            <h1
              className="
              mt-3 sm:mt-4
              text-3xl sm:text-4xl
              font-black
              leading-tight
              text-slate-900
            "
            >
              Stuck on the road?
            </h1>

            <div className="mt-3 sm:mt-4 text-orange-500 font-bold text-lg sm:text-xl">
              We're just one tap away.
            </div>

            <div className="mt-4 sm:mt-6 text-slate-500 leading-6 sm:leading-7 text-sm sm:text-base">
              {greeting.subtitle}
            </div>
          </div>

          {/* Helper on the way */}
          <div
            className="
            fade-in-up delay-3
            mt-4 sm:mt-6
            rounded-3xl
            bg-white
            p-4 sm:p-5
            shadow-lg
            border
            border-slate-100
            overflow-hidden
          "
          >
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14">
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
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  Madad raaste mein hai
                </div>
                <div
                  key={helperMsgIndex}
                  className="helper-msg-in text-xs sm:text-sm text-slate-500 truncate"
                >
                  {HELPER_MESSAGES[helperMsgIndex]}
                </div>
              </div>

              <div className="shrink-0 bg-green-50 text-green-600 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
                ON THE WAY
              </div>
            </div>

            <div className="relative mt-4 h-6 overflow-hidden">
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
                <Car size={20} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Live location */}
          <div
            className="
            fade-in-up delay-4
            mt-6 sm:mt-8
            rounded-3xl sm:rounded-[28px]
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

            <div className="relative p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white text-lg sm:text-xl font-bold">
                    Live Location
                  </div>
                  <div className="text-slate-300 mt-2 sm:mt-3 text-xs sm:text-sm">
                    Shared with nearest helpers
                  </div>
                </div>

                <div
                  className="
                  bg-white/10
                  backdrop-blur-xl
                  rounded-full
                  px-3 py-1.5 sm:px-4 sm:py-2
                  flex
                  items-center
                  gap-2
                  shrink-0
                "
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div className="text-white text-xs sm:text-sm">LIVE</div>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 flex justify-center">
                <div className="relative">
                  <div
                    className="
                    absolute
                    -inset-5 sm:-inset-6
                    rounded-full
                    bg-orange-500/25
                    animate-ping-slow
                  "
                  />
                  <div
                    className="
                    relative
                    h-14 w-14 sm:h-16 sm:w-16
                    rounded-full
                    bg-orange-500
                    flex
                    items-center
                    justify-center
                    shadow-2xl
                  "
                  >
                    <Navigation size={26} className="text-white sm:hidden" />
                    <Navigation size={30} className="text-white hidden sm:block" />
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-14 text-center text-slate-300 text-sm sm:text-base px-2 truncate">
                {locationLabel}
              </div>
            </div>
          </div>

          {/* SOS */}
          <div className="pop-in delay-5 mt-14 sm:mt-16 flex justify-center">
            <button
              onClick={() => openIssue(null)}
              className="relative active:scale-90 transition-transform"
            >
              {/* soft glow halo, synced to the same 2.4s cycle as the button's breathing */}
              <div
                className="
                absolute
                -inset-4 sm:-inset-6
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
                -inset-7 sm:-inset-10
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
                w-32 h-32 sm:w-44 sm:h-44
                rounded-full
                bg-gradient-to-br
                from-red-400
                via-red-500
                to-rose-700
                flex
                flex-col
                items-center
                justify-center
                gap-1
                text-white
                shadow-[0_25px_50px_rgba(225,29,72,.5)]
                sos-breathe
                ring-4
                ring-white/40
              "
              >
                <Siren size={22} className="sm:hidden" />
                <Siren size={28} className="hidden sm:block" />
                <span className="text-2xl sm:text-4xl font-black tracking-wide">
                  SOS
                </span>
              </div>
            </button>
          </div>

          <div className="fade-in-up delay-6 mt-5 sm:mt-8 text-center">
            <p className="text-slate-600 text-xs sm:text-sm">
              Tap the SOS button for immediate roadside assistance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 sm:mt-12">
            <div className="fade-in-up delay-6 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 flex items-center justify-center">
                <Clock3 className="text-orange-500" size={18} />
              </div>
              <div className="mt-3 sm:mt-6 text-lg sm:text-3xl font-black text-slate-900">
                2m
              </div>
              <div className="text-slate-500 text-[10px] sm:text-sm mt-1 leading-tight break-words">
                Avg Response
              </div>
            </div>

            <div className="fade-in-up delay-7 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Star className="text-yellow-500" size={18} />
              </div>
              <div className="mt-3 sm:mt-6 text-lg sm:text-3xl font-black text-slate-900">
                4.9
              </div>
              <div className="text-slate-500 text-[10px] sm:text-sm mt-1 leading-tight break-words">
                Rating
              </div>
            </div>

            <div className="fade-in-up delay-8 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-lg border border-slate-100 min-w-0 hover:-translate-y-1 transition-transform">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 flex items-center justify-center">
                <ShieldCheck className="text-green-600" size={18} />
              </div>
              <div className="mt-3 sm:mt-6 text-lg sm:text-3xl font-black text-slate-900">
                500+
              </div>
              <div className="text-slate-500 text-[10px] sm:text-sm mt-1 leading-tight break-words">
                Helpers
              </div>
            </div>
          </div>

          {/* Quick Help */}
          <div className="mt-8 sm:mt-16">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Quick Help
              </h2>
              <button
                onClick={() => openIssue(null)}
                className="
                text-orange-500
                text-xs sm:text-sm
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

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              {ISSUES.slice(0, 4).map((item, index) => {
                const icons = [
                  <Car size={22} />,
                  <FuelIcon size={22} />,
                  <BatteryCharging size={22} />,
                  <Wrench size={22} />,
                ];

                return (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                    className="fade-in-up bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all min-w-0"
                  >
                    <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                      {icons[index]}
                    </div>
                    <div className="mt-3 sm:mt-6 text-sm sm:text-lg font-bold text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="mt-1.5 sm:mt-3 text-xs sm:text-sm text-slate-500 leading-5 sm:leading-6 line-clamp-2">
                      {item.sub}
                    </div>
                    <div className="mt-3 sm:mt-6 flex items-center justify-between">
                      <span className="text-orange-500 font-semibold text-xs sm:text-base">
                        Get Help
                      </span>
                      <ChevronRight className="text-orange-500" size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergency Card */}
          <div
            className="
            fade-in-up delay-9
            mt-8 sm:mt-14
            rounded-3xl sm:rounded-[32px]
            bg-gradient-to-r
            from-green-500
            to-green-600
            p-5 sm:p-6
            shadow-2xl
            text-white
          "
          >
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-black truncate">
                  Highway Patrol
                </div>
                <div className="mt-2 sm:mt-4 text-green-100 text-sm sm:text-base">
                  24×7 Emergency Support
                </div>
                <div className="mt-4 sm:mt-7 text-4xl sm:text-5xl font-black">
                  1073
                </div>
              </div>

              <div
                className="
                w-16 h-16 sm:w-20 sm:h-20
                shrink-0
                rounded-full
                bg-white/20
                flex
                items-center
                justify-center
              "
              >
                <Phone size={28} />
              </div>
            </div>

            <button
              onClick={() => showToast("📞 Calling Highway Patrol...")}
              className="
              mt-6 sm:mt-10
              w-full
              rounded-2xl
              bg-white
              text-green-600
              py-3.5 sm:py-4
              font-bold
              text-base sm:text-lg
              active:scale-95
              transition-all
            "
            >
              Call Now
            </button>
          </div>

          <div className="h-24 sm:h-28" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}