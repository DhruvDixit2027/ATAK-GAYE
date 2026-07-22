import React from 'react';

export default function AcceptRejectButtons({ requestId, onAccept, onReject }) {
  return (
    <div className="accept-reject-buttons">
      <button className="btn-reject" onClick={() => onReject(requestId)}>
        Reject
      </button>
      <button className="btn-accept" onClick={() => onAccept(requestId)}>
        Accept
      </button>
    </div>
  );
}
