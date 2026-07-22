import React, { useEffect, useState } from 'react';
import RequestCard from './RequestCard';

// Change this to Person 2's real backend URL once it's deployed
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function RequestList({ helperId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/requests/pending/${helperId}`);
      if (!res.ok) throw new Error('Failed to load requests');
      const data = await res.json();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll every 8 seconds for new requests — swap for websockets later
    const interval = setInterval(fetchRequests, 8000);
    return () => clearInterval(interval);
  }, [helperId]);

  const handleAccept = async (requestId) => {
    await fetch(`${API_BASE}/api/requests/${requestId}/accept`, { method: 'POST' });
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
  };

  const handleReject = async (requestId) => {
    await fetch(`${API_BASE}/api/requests/${requestId}/reject`, { method: 'POST' });
    setRequests((prev) => prev.filter((r) => r._id !== requestId));
  };

  if (loading) return <div className="status-msg">Requests load ho rahe hain...</div>;
  if (error) return <div className="status-msg error">Error: {error}</div>;
  if (requests.length === 0) return <div className="status-msg">Abhi koi naya request nahi hai</div>;

  return (
    <div className="request-list">
      {requests.map((req) => (
        <RequestCard
          key={req._id}
          request={req}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}
