import React from 'react';
import AcceptRejectButtons from './AcceptRejectButtons';

const ISSUE_ICONS = { petrol: '⛽', mechanic: '🔧', tyre: '🛞', battery: '🔋', tow: '🚛' };
function getMatchColor(score) {
  if (score >= 70) return '#2ecc71';
  if (score >= 40) return '#ffc107';
  return '#ff4d4d';
}

export default function RequestCard({ request, helperId, onAccept, onReject }) {
  const { issueType, userLocation, matchScore, estimatedArrivalMin, createdAt } = request;
  const timeAgo = Math.max(1, Math.round((Date.now() - new Date(createdAt)) / 60000));
  const matchColor = getMatchColor(matchScore);

  return (
    <div className="request-card">
      <div className="request-card-top">
        <div className="request-icon">{ISSUE_ICONS[issueType] || '❓'}</div>
        <div className="request-info">
          <div className="request-title">{issueType.charAt(0).toUpperCase() + issueType.slice(1)} Request</div>
          <div className="request-sub">{timeAgo} min pehle</div>
        </div>
        {estimatedArrivalMin != null && (
          <div className="request-eta">
            <span className="eta-value">{estimatedArrivalMin}</span>
            <span className="eta-label">min away</span>
          </div>
        )}
      </div>

      <div className="request-details">
        <div className="request-location">📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</div>
        <div className="match-badge" style={{ color: matchColor, borderColor: matchColor }}>{matchScore}% Match</div>
      </div>

      <AcceptRejectButtons
        requestId={request._id}
        helperId={helperId}
        onAccept={() => onAccept(request)}
        onReject={() => onReject(request._id)}
      />
    </div>
  );
}