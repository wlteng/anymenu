// HowEarnStamp.js
import React from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { DollarSign, Gift, Star, Calendar } from 'lucide-react';

const HowEarnStamp = ({ isOpen, onClose, shop }) => {
  const formatWaysToEarn = (howToEarn) => {
    if (!howToEarn) return [];

    const ways = [];
    
    if (howToEarn.minimumSpend && howToEarn.minimumAmount) {
      ways.push({
        icon: <DollarSign className="w-5 h-5" />,
        text: `Make a purchase of ${shop.currencySymbol}${howToEarn.minimumAmount} or more`
      });
    }
    if (howToEarn.googleReview) {
      ways.push({
        icon: <Star className="w-5 h-5" />,
        text: 'Leave a Google review for the shop'
      });
    }
    if (howToEarn.socialMediaFollow) {
      ways.push({
        icon: <Gift className="w-5 h-5" />,
        text: 'Follow the shop on social media'
      });
    }

    return ways;
  };

  const waysToEarn = formatWaysToEarn(shop?.howToEarn);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold">How to Earn Stamps</h2>
        </div>

        {/* Content */}
        <div className="p-6 pt-0 space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700 font-medium">
              You can earn stamps through any of the following methods. Complete any one of these to earn a stamp!
            </p>
          </div>

          <div className="space-y-4">
            {waysToEarn.length > 0 ? (
              waysToEarn.map((way, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="mt-0.5 text-gray-400">
                    {way.icon}
                  </div>
                  <p className="text-gray-600">{way.text}</p>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="mt-0.5 text-gray-400">
                  <Gift className="w-5 h-5" />
                </div>
                <p className="text-gray-600">Show your QR code when placing an order to earn a stamp</p>
              </div>
            )}
          </div>

          {!shop?.isLifetimeReward && shop?.expiryDays && (
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-700">Stamp Validity</p>
                <p className="text-sm text-gray-600">
                  Each stamp is valid for {shop.expiryDays} days from collection date
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowEarnStamp;