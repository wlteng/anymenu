import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { db } from '../../firebase/config';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { LoadingSpinner } from '../ui/loading';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../ui/alert';
import { CheckCircle2, XCircle, ArrowLeft, Camera, RefreshCcw } from 'lucide-react';
import Header from '../Layout/Header';
import { getShopByUsername } from '../../firebase/utils';

const RewardScanner = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scannerKey, setScannerKey] = useState(0); // For forcing scanner reload
  const [isCameraPermissionChecking, setIsCameraPermissionChecking] = useState(true);

  useEffect(() => {
    loadShop();
    checkCameraPermission();
  }, [username]);

  const checkCameraPermission = async () => {
    setIsCameraPermissionChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately after checking
      stream.getTracks().forEach(track => track.stop());
      
      setError(null);
    } catch (err) {
      console.error('Camera permission error:', err);
      let errorMessage = 'Error accessing camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera access was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera may be in use by another application.';
      } else {
        errorMessage += 'Please check camera permissions and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsCameraPermissionChecking(false);
    }
  };

  const loadShop = async () => {
    try {
      const shopData = await getShopByUsername(username);
      if (!shopData) {
        navigate('/my-shops');
        return;
      }
      setShop(shopData);
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (data) => {
    if (!data || processing) return;
    
    setProcessing(true);
    try {
      const qrData = JSON.parse(data);
      console.log('Scanned QR data:', qrData); // Debug log
      
      const { userId, timestamp } = qrData;

      if (!userId || !timestamp) {
        throw new Error('Invalid QR code format');
      }

      const now = Date.now();
      const validityPeriod = 2 * 60 * 1000; // 2 minutes
      if (now - timestamp > validityPeriod) {
        setError('QR code has expired. Please ask customer to refresh their code.');
        return;
      }

      const stampRef = doc(collection(db, 'stamps'));
      await setDoc(stampRef, {
        userId,
        shopId: shop.id,
        shopName: shop.name,
        timestamp: serverTimestamp(),
      });

      setSuccess('Stamp added successfully!');
    } catch (error) {
      console.error('Error processing QR:', error);
      setError(error.message || 'Failed to process QR code. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleError = (error) => {
    console.error('Scanner error:', error);
    setError('Error with scanner: ' + error.message);
  };

  const resetScanner = () => {
    setError(null);
    setSuccess(null);
    setProcessing(false);
    setScannerKey(prev => prev + 1); // Force scanner reload
  };

  const retryCamera = async () => {
    setError(null);
    await checkCameraPermission();
    resetScanner();
  };

  if (isLoading || isCameraPermissionChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <Header shop={shop} pageTitle="Scan QR Code" />
      <div className="max-w-md mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/my-shops/${username}/rewards`)}
            className="text-gray-600 hover:bg-gray-100 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4 text-center">
            <h2 className="text-lg font-semibold">Scan Customer QR Code</h2>
            <p className="text-sm text-gray-500">Position the QR code within the frame</p>
          </div>

          {error ? (
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <Camera className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 mb-2">{error}</p>
              <button
                onClick={retryCamera}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry Camera
              </button>
            </div>
          ) : (
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Scanner
                key={scannerKey}
                onResult={handleScan}
                onError={handleError}
                constraints={{
                  facingMode: 'environment',
                  aspectRatio: 1
                }}
                className="w-full h-full"
              />
              {processing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <LoadingSpinner className="text-white w-8 h-8" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Dialog */}
        {success && (
          <AlertDialog open={true} onOpenChange={resetScanner}>
            <AlertDialogContent>
              <AlertDialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Success</span>
              </AlertDialogTitle>
              <div className="text-green-600">
                {success}
              </div>
              <button
                onClick={resetScanner}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Scan Another Code
              </button>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
};

export default RewardScanner;