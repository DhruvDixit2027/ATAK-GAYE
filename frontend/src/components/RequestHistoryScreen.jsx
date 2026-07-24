import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const statusLabels = {
  pending: { text: "Pending", color: "text-accent-2" },
  matched: { text: "Matched", color: "text-accent-2" },
  accepted: { text: "Accepted", color: "text-safe" },
  rejected: { text: "Reject ho gaya", color: "text-red-400" },
  "in-progress": { text: "Chal raha hai", color: "text-accent-2" },
  completed: { text: "Complete", color: "text-safe" },
  cancelled: { text: "Cancel ho gaya", color: "text-text-dim" },
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
    <div className="absolute inset-0 pt-[42px] flex flex-col animate-fadeIn">
      <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-3">
        <div
          onClick={() => goTo("home")}
          className="w-[34px] h-[34px] rounded-[10px] bg-card border border-line flex items-center justify-center cursor-pointer text-base"
        >
          ←
        </div>
        <div className="font-display font-bold text-[19px] font-hindi">Meri Requests</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[100px]">
        {loading && (
          <div className="text-text-dim text-sm text-center mt-10 font-hindi">Load ho raha hai...</div>
        )}

        {!loading && requests.length === 0 && (
          <div className="text-text-dim text-sm text-center mt-10 font-hindi">
            Abhi tak koi request nahi hai
          </div>
        )}

        {requests.map((r) => {
          const status = statusLabels[r.status] || { text: r.status, color: "text-text-dim" };
          return (
            <div
              key={r._id}
              className="bg-card border border-line rounded-2xl px-4 py-3.5 mb-2.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[13.5px] font-bold font-hindi capitalize">{r.issueType}</div>
                <div className={`text-[11px] font-bold ${status.color}`}>{status.text}</div>
              </div>
              {r.helperId && (
                <div className="text-[11.5px] text-text-dim font-hindi">
                  Helper: {r.helperId.name} · {r.helperId.vehicleType}
                </div>
              )}
              <div className="text-[10.5px] text-text-dim mt-1">
                {new Date(r.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}