import React from "react";
import { useApp } from "../context/AppContext";

export default function PhoneFrame({ children }) {
  const { toast } = useApp();

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center p-6 font-body">
      <div className="relative w-[390px] h-[810px] bg-bg rounded-[44px] border-8 border-[#050607] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[22px] bg-[#050607] rounded-full z-50" />
        {/* Status strip */}
        <div className="status-strip-bg h-1.5 w-full" />

        {children}

        {/* Toast */}
        <div
          className={`absolute bottom-[100px] left-5 right-5 bg-card border border-accent rounded-2xl px-4 py-3 text-sm shadow-2xl z-[80] transition-all duration-300 ${
            toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {toast.msg}
        </div>
      </div>
    </div>
  );
}
