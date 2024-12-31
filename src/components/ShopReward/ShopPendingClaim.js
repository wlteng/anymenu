import React from 'react';
import { formatDate } from '../../utils/formatDate';

const ShopPendingClaim = ({ claim, onApprove, onReject }) => {
  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{claim.rewardName}</p>
          <p className="text-sm text-gray-600">
            Customer: {claim.customerEmail}
          </p>
          <p className="text-sm text-gray-600">
            Claimed on: {formatDate(claim.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(claim.id)}
            className="px-3 py-1 bg-green-600 text-white rounded-lg"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(claim.id)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopPendingClaim;