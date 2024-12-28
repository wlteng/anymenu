import React from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { Scan, Stamp, Gift, Clock, Send } from 'lucide-react';

const InfoStep = ({ icon: Icon, title, description }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
    </div>
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const RewardInfo = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold">How It Works</h2>
        </div>

        {/* Steps */}
        <div className="px-6 pb-6 space-y-6">
          <InfoStep 
            icon={Scan}
            title="Show Your QR Code"
            description="Present your reward QR code to the shop staff when making a purchase"
          />

          <InfoStep 
            icon={Stamp}
            title="Collect Stamps"
            description="Get a digital stamp for each qualifying purchase. Each stamp is valid for 1 year from collection date"
          />

          <InfoStep 
            icon={Gift}
            title="Claim Rewards"
            description="Complete your stamp card to receive free items and special offers"
          />

          <InfoStep 
            icon={Clock}
            title="Expiration Status"
            description="Red stamps indicate stamps expiring within 30 days. Expired stamps cannot be used"
          />

          <InfoStep 
            icon={Send}
            title="Share with Friends"
            description="Transfer your stamps to friends using their email address. Transferred stamps appear in green"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center">
          Terms and conditions apply. Rewards may vary by location.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardInfo;