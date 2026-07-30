import React, { useState } from 'react';
import { BACKEND_URL } from "../config";

export default function AcceptRejectButtons({ requestId, helperId, onAccept, onReject }) {
  const [loading, setLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/requests/${requestId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helperId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setActionTaken(action);
      setTimeout(() => {
        if (action === "accept") onAccept();
        else onReject();
      }, 500);
    } catch (err) {
      alert(`${action === "accept" ? "Accept" : "Reject"} karne mein error aaya: ${err.message}`);
      console.error(err);
      setLoading(false);
    }
  };

  if (actionTaken === "accept") {
    return <div className="action-confirmed accepted">✅ Accepted — navigate ho rahe hain...</div>;
  }
  if (actionTaken === "reject") {
    return <div className="action-confirmed rejected">❌ Request reject ho gayi</div>;
  }

  return (
    <div className="action-buttons">
      <button className="reject-btn" disabled={loading} onClick={() => handleAction("reject")}>Reject</button>
      <button className="accept-btn" disabled={loading} onClick={() => handleAction("accept")}>
        {loading ? "..." : "Accept"}
      </button>
    </div>
  );
}