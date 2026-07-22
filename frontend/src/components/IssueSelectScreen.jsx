import React from "react";
import { useApp } from "../context/AppContext";
import { ISSUES } from "../data/helperPool";

export default function IssueSelectScreen() {
  const { goTo, selectedIssue, setSelectedIssue } = useApp();

  return (
    <div className="absolute inset-0 pt-[42px] flex flex-col animate-fadeIn">
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-1">
        <div
          onClick={() => goTo("home")}
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-line flex items-center justify-center cursor-pointer text-base"
        >
          ←
        </div>
        <div className="font-display font-bold text-[19px] font-hindi">Kya problem hai?</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[120px] pt-1.5">
        <div className="flex gap-2 mb-4">
          <div className="text-[11px] px-3 py-1.5 rounded-full bg-accent text-[#171009] font-bold">
            📍 NH-27 Bypass, Lucknow
          </div>
        </div>

        {ISSUES.map((it) => {
          const isSelected = selectedIssue === it.id;
          return (
            <div
              key={it.id}
              onClick={() => setSelectedIssue(it.id)}
              className={`flex items-center gap-3.5 rounded-card p-4 mb-3 cursor-pointer border transition-colors ${
                isSelected ? "border-accent bg-[#241d1a]" : "border-line bg-card hover:border-accent-2"
              }`}
            >
              <div className="w-[46px] h-[46px] rounded-xl bg-card-2 flex items-center justify-center text-[22px] flex-shrink-0">
                {it.emoji}
              </div>
              <div>
                <div className="text-[15px] font-semibold font-hindi">{it.name}</div>
                <div className="text-[11.5px] text-text-dim mt-0.5 font-hindi">{it.sub}</div>
              </div>
              <div className="ml-auto text-[13px] text-accent-2 font-bold">{it.price}</div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 pt-4 pb-[26px] bg-gradient-to-t from-bg via-bg/60 to-transparent">
        <button
          disabled={!selectedIssue}
          onClick={() => goTo("matching")}
          className="w-full py-[15px] rounded-2xl border-none font-display font-bold text-[15px] tracking-wide text-[#171009] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #FF6A3D, #ff8a5c)" }}
        >
          <span className="font-hindi">Madad Bhejo →</span>
        </button>
      </div>
    </div>
  );
}
