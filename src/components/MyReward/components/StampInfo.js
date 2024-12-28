import React from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Store, Calendar, Clock, AlertTriangle, Star } from 'lucide-react';

const StampInfo = ({ isOpen, onClose, stamp, shop }) => {
  if (!stamp) return null;

  const daysUntilExpiry = stamp.expiryDate 
    ? Math.ceil((stamp.expiryDate - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysUntilExpiry && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold">Stamp Details</h2>
        </div>
        
        {/* Shop Info */}
        <div className="px-6 py-4 bg-gray-50 flex items-center gap-4">
          <img 
            src={shop?.logo || '/img/sample/logo-square.jpg'} 
            alt={shop?.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold mb-1">{shop?.name}</h3>
            <p className="text-gray-600">{shop?.reward}</p>
          </div>
        </div>

        {/* Collection Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-gray-400" />
            <span>Collected at {shop?.name}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>Collected on {new Date(stamp.timestamp).toLocaleDateString()}</span>
          </div>

          {stamp.isGold ? (
            <div className="flex items-center gap-3 text-yellow-600">
              <Star className="w-5 h-5" />
              <span className="font-medium">Premium Stamp - Never Expires</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Expires on {new Date(stamp.expiryDate).toLocaleDateString()}</span>
              </div>

              {isExpiringSoon && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span>This stamp will expire in {daysUntilExpiry} days</span>
                </div>
              )}
            </>
          )}

          {stamp.isTransferred && (
            <div className="pt-2 mt-4 border-t text-gray-500">
              Transferred from: {stamp.fromUserId}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StampInfo;