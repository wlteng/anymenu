import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../../../components/ui/dialog';
import { LoadingSpinner } from '../../../components/ui/loading';
import { Mail, AlertTriangle } from 'lucide-react';
import { db } from '../../../firebase/config';
import { doc, deleteDoc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from '../../../contexts/ToastContext';

const TransferStampDialog = ({ isOpen, onClose, stamps, shop, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStamps, setSelectedStamps] = useState([]);
  const auth = getAuth();
  const { showToast } = useToast();

  // Pre-filter available stamps
  const availableStamps = stamps.filter(stamp => !stamp.isTransferred);

  useEffect(() => {
    if (isOpen) {
      // Reset form state when dialog opens
      setEmail('');
      setError('');
      
      // Only select stamps if we have available ones
      if (availableStamps.length > 0) {
        const sortedStamps = [...availableStamps].sort((a, b) => {
          const getExpiryTime = (stamp) => {
            const expiryDate = stamp.expiryDate.seconds ? 
              new Date(stamp.expiryDate.seconds * 1000) : 
              new Date(stamp.expiryDate);
            return expiryDate.getTime();
          };
          return getExpiryTime(a) - getExpiryTime(b);
        });
        
        setSelectedStamps(sortedStamps.slice(0, Math.min(3, sortedStamps.length)));
      }
    } else {
      // Clear selections when dialog closes
      setSelectedStamps([]);
    }
  }, [isOpen, availableStamps.length]);

  const getExpiryDate = (stamp) => {
    return stamp.expiryDate.seconds ? 
      new Date(stamp.expiryDate.seconds * 1000) : 
      new Date(stamp.expiryDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const checkRecipientStamps = async (recipientEmail) => {
    try {
      const existingStampsQuery = query(
        collection(db, 'stamps'),
        where('email', '==', recipientEmail),
        where('shopId', '==', shop.id),
        where('rewardId', '==', stamps[0].rewardId),
        where('status', '==', 'active')
      );
      
      const stampsSnapshot = await getDocs(existingStampsQuery);
      return stampsSnapshot.docs.length;
    } catch (error) {
      console.error('Error checking recipient stamps:', error);
      throw error;
    }
  };

  const getStatusMessage = () => {
    const transferredCount = stamps.length - availableStamps.length;
    if (transferredCount > 0) {
      return `${transferredCount} stamp${transferredCount !== 1 ? 's' : ''} cannot be transferred as ${transferredCount === 1 ? 'it was' : 'they were'} received from another user.`;
    }
    if (availableStamps.length < 3) {
      return `You need 3 stamps to make a transfer. You currently have ${availableStamps.length} eligible stamp${availableStamps.length !== 1 ? 's' : ''}.`;
    }
    return 'The system will automatically select your 3 stamps with the earliest expiry dates for transfer.';
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (email === auth.currentUser.email) {
      setError('Cannot transfer stamps to yourself');
      return;
    }

    if (selectedStamps.length !== 3) {
      setError('Unable to proceed with transfer - exactly 3 stamps are required');
      return;
    }

    if (selectedStamps.some(stamp => stamp.isTransferred)) {
      setError('Cannot transfer stamps that were received from another user');
      return;
    }

    setIsLoading(true);
    try {
      // Check recipient's stamp count
      const recipientStampCount = await checkRecipientStamps(email);
      const stampsRequired = shop.stampsRequired || 10;

      if (recipientStampCount >= stampsRequired) {
        throw new Error('Recipient already has a full reward card');
      }

      // Delete original stamps
      await Promise.all(
        selectedStamps.map(stamp => deleteDoc(doc(db, 'stamps', stamp.id)))
      );

      // Create new transferred stamp
      const newStampId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const minExpiryDate = Math.min(
        ...selectedStamps.map(stamp => getExpiryDate(stamp).getTime())
      );
      
      await setDoc(doc(db, 'stamps', newStampId), {
        email: email,
        shopId: shop.id,
        shopName: shop.name,
        shopUsername: shop.username,
        rewardId: stamps[0].rewardId,
        timestamp: serverTimestamp(),
        expiryDate: new Date(minExpiryDate),
        status: 'active',
        isTransferred: true,
        transferredFrom: auth.currentUser.email,
        transferredAt: serverTimestamp(),
        originalStamps: selectedStamps.map(s => ({
          id: s.id,
          timestamp: s.timestamp,
          expiryDate: s.expiryDate
        }))
      });

      showToast({
        title: 'Success',
        description: 'Stamps transferred successfully',
        type: 'success'
      });

      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Error transferring stamps:', error);
      setError(error.message || 'Failed to transfer stamps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold">Transfer Stamps</DialogTitle>
          </div>
          
          {/* Status Message */}
          <div className={`px-6 py-4 ${availableStamps.length >= 3 ? 'bg-blue-50' : 'bg-yellow-50'}`}>
            <div className={`flex items-center gap-2 ${availableStamps.length >= 3 ? 'text-blue-700' : 'text-yellow-700'}`}>
              <AlertTriangle className="w-5 h-5" />
              <p>{getStatusMessage()}</p>
            </div>
          </div>

          {/* Selected Stamps Info */}
          {selectedStamps.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Selected Stamps</h3>
              {/* ... (stamp details) */}
            </div>
          )}

          {/* Transfer Form */}
          <form onSubmit={handleTransfer} className="p-6 space-y-4">
            {/* ... (email input and error message) */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || selectedStamps.length !== 3 || !email}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading && <LoadingSpinner size="w-4 h-4" />}
                Transfer Stamps
              </button>
            </div>
          </form>

          {/* Note */}
          <div className="px-6 py-4 bg-gray-50 text-xs text-gray-500">
            Note: This action cannot be undone. The selected stamps will be removed from your account.
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  export default TransferStampDialog;