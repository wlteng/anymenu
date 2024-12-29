import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { db } from '../../firebase/config';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { LoadingSpinner } from '../ui/loading';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

const RewardScanner = ({ shop }) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (data) => {
    if (data && !processing) {
      setProcessing(true);
      setScanning(false);

      try {
        const qrData = JSON.parse(data);
        const { userId, timestamp } = qrData;

        const now = Date.now();
        const validityPeriod = 2 * 60 * 1000;
        if (now - timestamp > validityPeriod) {
          setError('QR code has expired.');
          return;
        }

        const stampRef = doc(collection(db, 'stamps'));
        await setDoc(stampRef, {
          userId,
          shopId: shop.id,
          timestamp: serverTimestamp(),
        });

        setSuccess('Stamp added successfully!');
      } catch (error) {
        setError('Failed to process QR code. Try again.');
        console.error('Error:', error.message);
      } finally {
        setProcessing(false);
      }
    }
  };

  const resetScanner = () => {
    setScanning(true);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-md mx-auto">
      {scanning ? (
        <QRCode value="Sample QR Code Data" />
      ) : (
        <AlertDialog open={true} onOpenChange={resetScanner}>
          <AlertDialogContent>
            <AlertDialogTitle>
              {processing ? 'Processing...' : error ? 'Error' : 'Success'}
            </AlertDialogTitle>
            <div>{error || success}</div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default RewardScanner;