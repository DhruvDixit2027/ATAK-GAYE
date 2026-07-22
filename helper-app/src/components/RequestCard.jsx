import React from 'react';
import AcceptRejectButtons from './AcceptRejectButtons';

const ISSUE_ICONS = {
  petrol: '⛽',
  mechanic: '🔧',
  tyre: '🛞',
  battery: '🔋',
  tow: '🚛',
};

export default function RequestCard({ request, onAccept, onReject }) {
  const { issueType, userLocation, matchScore, estimatedArrivalMin, createdAt } = request;

  const timeAgo = Math.max(1, Math.round((Date.now() - new Date(createdAt)) / 60000));

  return (
    <div className="request-card">
      <div className="request-card-top">
        <div className="request-icon">{ISSUE_ICONS[issueType] || '❓'}</div>
        <div className="request-info">
          <div className="request-title">
            {issueType.charAt(0).toUpperCase() + issueType.slice(1)} Request
          </div>
          <div className="request-sub">{timeAgo} min pehle · Match {matchScore}%</div>
        </div>
        {estimatedArrivalMin != null && (
          <div className="request-eta">{estimatedArrivalMin} min</div>
        )}
      </div>

      <div className="request-location">
        📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
      </div>

      <AcceptRejectButtons
        requestId={request._id}
        onAccept={onAccept}
        onReject={onReject}
      />
    </div>
  );
}
