import React from 'react';
import { Gift, Clock, Store } from 'lucide-react';

const PendingRewardCard = ({ claim }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : 
      new Date(timestamp);

    // Get time difference in milliseconds
    const diff = new Date() - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400">
      {/* Shop Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={claim.shopLogo || '/img/sample/logo-square.jpg'} 
            alt={claim.shopName}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold">{claim.shopName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Gift className="w-4 h-4" />
              <span>{claim.rewardName}</span>
              {claim.worth && (
                <span className="flex items-center gap-1 text-blue-600">
                  ({claim.currencySymbol}{claim.worth})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          Pending
        </div>
      </div>

      {/* Claim Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Claimed {formatDate(claim.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Store className="w-4 h-4" />
          <span>Waiting for shop approval</span>
        </div>
      </div>

      {/* Note */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          Please visit the shop to redeem your reward. The shop staff will approve your claim.
        </p>
      </div>
    </div>
  );
};

export default PendingRewardCard;