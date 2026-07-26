import React, { useState } from 'react';
import { BACKEND_URL } from "../config";

export default function AcceptRejectButtons({ requestId, onAccept, onReject }) {
  const [loading, setLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState(null);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/requests/${requestId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Request failed");
      setActionTaken(action);
      setTimeout(() => {
        if (action === "accept") onAccept();
        else onReject();
      }, 500);
    } catch (err) {
      alert(`${action === "accept" ? "Accept" : "Reject"} karne mein error aaya`);
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