import React, { useEffect, useState } from "react";
import { ChevronLeft, Fuel, Wrench, Zap, Battery, Truck, Circle } from "lucide-react";
import { useApp } from "../context/AppContext";
import BottomNav from "./BottomNav";

const statusStyles = {
  pending: { text: "Pending", bg: "bg-yellow-100", color: "text-yellow-700" },
  matched: { text: "Matched", bg: "bg-yellow-100", color: "text-yellow-700" },
  accepted: { text: "Accepted", bg: "bg-green-100", color: "text-green-700" },
  rejected: { text: "Reject ho gaya", bg: "bg-red-100", color: "text-red-600" },
  "in-progress": { text: "Chal raha hai", bg: "bg-yellow-100", color: "text-yellow-700" },
  completed: { text: "Complete", bg: "bg-green-100", color: "text-green-700" },
  cancelled: { text: "Cancel ho gaya", bg: "bg-slate-100", color: "text-slate-500" },
};

const ISSUE_ICONS = {
  petrol: Fuel,
  mechanic: Wrench,
  tyre: Circle,
  battery: Battery,
  tow: Truck,
};

export default function RequestHistoryScreen() {
  const { user, goTo } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?._id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/requests/user/${user._id}`);
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Request history fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top,#FFF2E9 0%,transparent 45%)",
        }}
      />

      <div className="relative flex-1 overflow-y-auto pb-24">
        <div className="px-4 sm:px-5 pt-5 sm:pt-6 max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              onClick={() => goTo("home")}
              className="w-9 h-9 rounded-xl bg-white shadow-lg border border-slate-100 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-slate-700" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900">
              Meri Requests
            </div>
          </div>

          {loading && (
            <div className="text-slate-500 text-sm text-center mt-10">
              Load ho raha hai...
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="text-slate-500 text-sm text-center mt-10">
              Abhi tak koi request nahi hai
            </div>
          )}

          {requests.map((r) => {
            const status = statusStyles[r.status] || {
              text: r.status,
              bg: "bg-slate-100",
              color: "text-slate-500",
            };
            const Icon = ISSUE_ICONS[r.issueType] || Wrench;

            return (
              <div
                key={r._id}
                className="bg-white rounded-2xl px-4 py-3.5 mb-3 shadow-lg border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-slate-900 capitalize truncate">
                        {r.issueType}
                      </div>
                      <div
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
                      >
                        {status.text}
                      </div>
                    </div>
                    {r.helperId && (
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Helper: {r.helperId.name} · {r.helperId.vehicleType}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(r.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="h-16" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}