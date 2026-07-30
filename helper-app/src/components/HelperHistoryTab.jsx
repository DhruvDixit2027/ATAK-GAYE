import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from "../config";
import './HelperHistoryTab.css';

const ISSUE_ICONS = { petrol: '⛽', mechanic: '🔧', tyre: '🛞', battery: '🔋', tow: '🚛' };

const STATUS_LABELS = {
  accepted: 'Accepted',
  'in-progress': 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' • ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function HelperHistoryTab({ helperId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/requests/helper/${helperId}`);
        const data = await res.json();
        if (!cancelled) {
          setJobs(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError('History load nahi ho payi');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHistory();
    return () => { cancelled = true; };
  }, [helperId]);

  const completedCount = jobs.filter(j => j.status === 'completed').length;

  if (loading) {
    return <p className="history-status-msg">Loading history...</p>;
  }

  if (error) {
    return <p className="history-status-msg error">{error}</p>;
  }

  return (
    <div className="history-tab">
      <div className="history-summary">
        <div className="history-summary-box">
          <span className="history-summary-value">{jobs.length}</span>
          <span className="history-summary-label">Total Requests</span>
        </div>
        <div className="history-summary-box">
          <span className="history-summary-value">{completedCount}</span>
          <span className="history-summary-label">Completed</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <p className="empty-state">Abhi tak koi job history nahi hai</p>
      ) : (
        <div className="history-list">
          {jobs.map((job) => (
            <div key={job._id} className="history-card">
              <div className="history-card-top">
                <div className="history-icon">{ISSUE_ICONS[job.issueType] || '❓'}</div>
                <div className="history-info">
                  <p className="history-title">
                    {job.issueType.charAt(0).toUpperCase() + job.issueType.slice(1)}
                  </p>
                  <p className="history-date">{formatDate(job.createdAt)}</p>
                </div>
                <span className={`history-status-badge ${job.status}`}>
                  {STATUS_LABELS[job.status] || job.status}
                </span>
              </div>
              {job.userId && (
                <p className="history-customer">Customer: {job.userId.name || 'N/A'}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}