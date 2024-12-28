import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scan } from 'lucide-react';

const UserQR = ({ userId }) => {
  // This would normally come from your backend
  const userRewardId = `REWARD_${userId}_${Date.now()}`;

  return (
    <div className=" rounded-xl  text-center">
      <div className="mb-4">
        
        <h2 className="text-lg font-semibold">Your Reward QR Code</h2>
        <p className="text-sm text-gray-500 mb-4">
          Show this to get your stamps
        </p>
      </div>
      
      <div className="inline-block p-4 bg-white rounded-xl shadow-md">
        <QRCodeSVG 
          value={userRewardId}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      
      
    </div>
  );
};

export default UserQR;