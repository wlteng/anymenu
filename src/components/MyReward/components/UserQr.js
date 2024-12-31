import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getAuth } from 'firebase/auth';

const UserQR = () => {
  const [qrData, setQrData] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const email = auth.currentUser?.email;
    if (email) {
      setQrData(JSON.stringify({ email }));
    }
  }, [auth.currentUser]);

  if (!auth.currentUser?.email) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">Please sign in to view your QR Code</p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">Generating your QR Code...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <h2 className="text-xl font-semibold mb-6">Your QR Code</h2>
      <div className="flex justify-center mb-6">
        <QRCodeSVG 
          value={qrData} 
          size={200} 
          level="H" 
          includeMargin 
        />
      </div>
      <p className="text-gray-600">
        Show this QR code to earn stamps
      </p>
    </div>
  );
};

export default UserQR;