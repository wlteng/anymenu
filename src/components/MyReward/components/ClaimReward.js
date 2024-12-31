import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/dialog';
import { LoadingSpinner } from '../../../components/ui/loading';
import { Gift, AlertTriangle } from 'lucide-react';
import { db } from '../../../firebase/config';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../../../contexts/ToastContext';

const ClaimReward = ({ isOpen, onClose, shop, onUpdate }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleConfirmAvailability = () => {
    setStep(2);
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      // Create claim record
      const claimData = {
        shopId: shop.id,
        shopName: shop.name,
        rewardId: shop.rewardId,
        rewardName: shop.reward,
        customerEmail: shop.stamps[0].email, // Using first stamp's email
        status: 'pending',
        createdAt: serverTimestamp(),
        stamps: shop.stamps.map(stamp => ({
          id: stamp.id,
          timestamp: stamp.timestamp
        })),
        worth: shop.rewardWorth,
        currencyCode: shop.currencyCode,
        currencySymbol: shop.currencySymbol
      };

      await addDoc(collection(db, 'claims'), claimData);

      // Update stamp status to 'claimed'
      await Promise.all(
        shop.stamps.map(stamp => 
          updateDoc(doc(db, 'stamps', stamp.id), {
            status: 'claimed',
            claimedAt: serverTimestamp()
          })
        )
      );

      showToast({
        title: 'Success',
        description: 'Reward claimed successfully',
        type: 'success'
      });

      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Error claiming reward:', error);
      showToast({
        title: 'Error',
        description: 'Failed to claim reward',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-6">
        <div className="space-y-6">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-600" />
              <span>Claim Your Reward</span>
            </div>
          </DialogTitle>

          {step === 1 ? (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-start gap-2 text-yellow-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    Please check with the shop staff first to confirm reward availability
                    before proceeding with your claim.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Reward Details:</h3>
                <p className="text-gray-600">{shop.reward}</p>
                {shop.rewardWorth && (
                  <p className="text-sm text-blue-600 mt-1">
                    Worth: {shop.currencySymbol}{shop.rewardWorth}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAvailability}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Confirm & Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700">
                  Are you sure you want to claim this reward? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                  {isLoading && <LoadingSpinner size="w-4 h-4" />}
                  Claim Reward
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimReward;