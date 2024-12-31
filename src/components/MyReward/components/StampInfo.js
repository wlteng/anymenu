import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Store, Calendar, Clock, AlertTriangle, Star } from 'lucide-react';

const StampInfo = ({ isOpen, onClose, stamp, shop }) => {
  if (!stamp) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.seconds ? 
      new Date(timestamp.seconds * 1000) : 
      new Date(timestamp);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExpiryDays = () => {
    if (!stamp.expiryDate) return null;
    
    const expiryDate = stamp.expiryDate.seconds ? 
      stamp.expiryDate.seconds * 1000 : 
      stamp.expiryDate;
    
    const daysUntilExpiry = Math.ceil(
      (expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilExpiry > 0 ? daysUntilExpiry : 0;
  };

  const daysUntilExpiry = getExpiryDays();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const currencySymbol = stamp.currencySymbol || shop?.currencySymbol || '$';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-6 mb-3 overflow-hidden">
        
        
        {/* Shop Info */}
        <div className="p-4 bg-gray-50 flex items-center gap-4 rounded-lg">
          <img 
            src={shop?.logo || '/img/sample/logo-square.jpg'} 
            alt={shop?.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold mb-1">{shop?.name}</h3>
            <div className="flex items-center gap-3">
              <span className="text-gray-600">{shop?.reward}</span>
              {shop?.rewardWorth && (
                <span className="flex items-center gap-1 text-sm text-blue-600">
                  {currencySymbol} {shop.rewardWorth}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collection Details */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-gray-400" />
            <span>Collected at {shop?.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>Collected on {formatDate(stamp.timestamp)}</span>
          </div>

          {stamp.isGold || shop?.isLifetimeReward ? (
            <div className="flex items-center gap-3 text-yellow-600">
              <Star className="w-5 h-5" />
              <span className="font-medium">Premium Stamp - Never Expires</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Expires on {formatDate(stamp.expiryDate)}</span>
              </div>

              {isExpiringSoon && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span>This stamp will expire in {daysUntilExpiry} days</span>
                </div>
              )}
            </>
          )}

          {stamp.isTransferred && stamp.transferredFrom && (
            <div className="pt-2 mt-4 border-t text-gray-500">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-400" />
                <span>Transferred from: {stamp.transferredFrom}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StampInfo;