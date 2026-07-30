import React, { useState, useEffect } from 'react';
import RequestCard from './RequestCard';
import { BACKEND_URL } from "../config";

export default function RequestList({ helperId, onJobAccepted }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/requests/pending/${helperId}`);
      const data = await res.json();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch");
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helperId]);

  const removeRequest = (requestId) => {
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
  };

  const handleAccept = (request) => {
    // Note: AcceptRejectButtons.jsx already calls POST /api/requests/:id/accept
    // before this fires — so no fetch needed here, just local state + navigation.
    removeRequest(request._id);
    onJobAccepted(request); // App.jsx ko batao — tracking screen khulegi
  };

  if (error) return <p style={{ color: "#ff4d4d" }}>Error: {error}</p>;
  if (requests.length === 0) return <p className="empty-state">Abhi koi naya request nahi hai</p>;

  return (
    <div className="request-list">
      {requests.map((req) => (
        <RequestCard
          key={req._id}
          request={req}
          helperId={helperId}
          onAccept={handleAccept}
          onReject={removeRequest}
        />
      ))}
    </div>
  );
}