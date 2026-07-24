import React from "react";
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ISSUES } from "../data/helperPool";

export default function IssueSelectScreen() {
  const { goTo, selectedIssue, setSelectedIssue } = useApp();

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.05s; }
        .delay-2 { animation-delay: 0.12s; }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-up {
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
            onClick={() => goTo("home")}
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

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 truncate">
            Kya problem hai?
          </h1>
        </div>
      </div>

      {/* List */}
      <div className="relative flex-1 overflow-y-auto px-4 sm:px-5 pb-40">
        <div className="max-w-md mx-auto w-full">
          <div className="fade-in-up delay-1 mt-3 mb-4">
            <div
              className="
              inline-flex
              items-center
              gap-1.5
              bg-white
              rounded-2xl
              px-3.5 py-2
              shadow-lg
              border
              border-slate-100
              max-w-full
            "
            >
              <MapPin size={15} className="text-orange-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 truncate">
                NH-27 Bypass, Lucknow
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {ISSUES.map((it, index) => {
              const isSelected = selectedIssue === it.id;
              return (
                <div
                  key={it.id}
                  onClick={() => setSelectedIssue(it.id)}
                  style={{ animationDelay: `${0.15 + index * 0.06}s` }}
                  className={`
                  fade-in-up
                  relative
                  flex
                  items-center
                  gap-3.5
                  rounded-2xl sm:rounded-3xl
                  p-4
                  cursor-pointer
                  border
                  shadow-lg
                  transition-all
                  active:scale-[0.98]
                  ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/60 shadow-orange-100"
                      : "border-slate-100 bg-white hover:border-orange-200 hover:shadow-xl"
                  }
                `}
                >
                  <div
                    className={`
                    w-11 h-11 sm:w-[46px] sm:h-[46px]
                    shrink-0
                    rounded-xl sm:rounded-2xl
                    flex
                    items-center
                    justify-center
                    text-xl sm:text-2xl
                    ${isSelected ? "bg-orange-100" : "bg-orange-50"}
                  `}
                  >
                    {it.emoji}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {it.name}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                      {it.sub}
                    </div>
                  </div>

                  {isSelected ? (
                    <CheckCircle2
                      size={20}
                      className="text-orange-500 shrink-0 fill-orange-500 text-white"
                    />
                  ) : (
                    <div className="text-xs sm:text-sm text-orange-500 font-bold shrink-0">
                      {it.price}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div
        className="
        absolute
        bottom-0
        left-0
        right-0
        px-4
        sm:px-5
        pt-6
        pb-6 sm:pb-8
        bg-gradient-to-t
        from-slate-50
        via-slate-50/85
        to-transparent
      "
      >
        <div className="max-w-md mx-auto w-full">
          <button
            disabled={!selectedIssue}
            onClick={() => goTo("matching")}
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
            disabled:opacity-40
            disabled:shadow-none
            disabled:cursor-not-allowed
          "
          >
            Madad Bhejo →
          </button>
        </div>
      </div>
    </div>
  );
}