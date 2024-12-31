import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { db } from '../../firebase/config';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { LoadingSpinner } from '../ui/loading';
import { useToast } from '../../contexts/ToastContext';
import { getAuth } from 'firebase/auth';
import { getShopByUsername } from '../../firebase/utils';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const RewardScanner = () => {
  const { username, rewardId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [shop, setShop] = useState(null);
  const [reward, setReward] = useState(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    if (username && rewardId) {
      loadShopAndReward();
    }
  }, [username, rewardId]);

  const loadShopAndReward = async () => {
    try {
      // Load shop data
      const shopData = await getShopByUsername(username);
      if (!shopData) {
        throw new Error('Shop not found');
      }
      setShop(shopData);

      // Load reward data
      const rewardDoc = await getDoc(doc(db, 'rewards', rewardId));
      if (!rewardDoc.exists()) {
        throw new Error('Reward not found');
      }
      
      const rewardData = rewardDoc.data();
      if (!rewardData.isActive) {
        throw new Error('This reward program is currently inactive');
      }
      
      setReward(rewardData);
      
    } catch (err) {
      console.error('Error loading data:', err);
      showToast({
        title: 'Error',
        description: err.message || 'Failed to load shop data',
        type: 'error'
      });
      navigate(`/my-shops/${username}/rewards`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserExists = async (email) => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      const userSnapshot = await getDocs(usersQuery);
      return !userSnapshot.empty;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };

  const checkExistingStamps = async (email) => {
    const existingStampsQuery = query(
      collection(db, 'stamps'),
      where('email', '==', email),
      where('shopId', '==', shop.id),
      where('rewardId', '==', rewardId),
      where('status', '==', 'active')
    );
    
    const stampsSnapshot = await getDocs(existingStampsQuery);
    return stampsSnapshot.docs.length; // Returns number of existing stamps
  };

  const generateUniqueStampId = (email) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${email.replace(/[.@]/g, '_')}_${timestamp}_${random}`;
  };

  const validateEarningCriteria = async (email) => {
    if (!reward.howToEarn) return true;

    if (reward.howToEarn.minimumSpend) {
      // Here you would implement the check for minimum spend
      // This might involve checking recent transactions or requiring manual verification
      const minAmount = parseFloat(reward.howToEarn.minimumAmount);
      if (isNaN(minAmount)) {
        throw new Error('Invalid minimum spend amount configured');
      }
      // For now, we'll assume the minimum spend is met
      // You might want to add UI for staff to verify/input actual spend amount
    }

    if (reward.howToEarn.googleReview) {
      // Here you would implement Google review verification
      // This might require manual verification by staff
      // You might want to add UI for staff to confirm review
    }

    if (reward.howToEarn.socialMediaFollow) {
      // Here you would implement social media follow verification
      // This might require manual verification by staff
      // You might want to add UI for staff to confirm follow
    }

    return true;
  };

  const addStamp = async (email) => {
    if (!email) {
      setError('Email is required.');
      return;
    }

    if (!shop || !rewardId) {
      setError('Shop or reward information is missing.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if user exists
      const userExists = await checkUserExists(email);
      if (!userExists) {
        throw new Error('User not found. Customer needs to register first.');
      }

      // Validate earning criteria
      await validateEarningCriteria(email);
      
      // Check existing stamps count
      const existingStampsCount = await checkExistingStamps(email);
      
      if (existingStampsCount >= reward.stampsRequired) {
        throw new Error('This reward card is already full! The customer should redeem their reward.');
      }

      // Generate a unique stamp ID
      const stampId = generateUniqueStampId(email);
      
      // Check for recent stamps to prevent duplicates
      const recentStampsQuery = query(
        collection(db, 'stamps'),
        where('email', '==', email),
        where('shopId', '==', shop.id),
        where('rewardId', '==', rewardId),
        where('timestamp', '>', new Date(Date.now() - 60000)) // Last minute
      );
      
      const recentStamps = await getDocs(recentStampsQuery);
      if (!recentStamps.empty) {
        throw new Error('A stamp was already added for this customer recently');
      }

      // Calculate expiry date based on reward settings
      const expiryDate = reward.isLifetimeReward ? 
        new Date(Date.now() + (100 * 365 * 24 * 60 * 60 * 1000)) : // 100 years for lifetime
        new Date(Date.now() + (reward.expiryDays * 24 * 60 * 60 * 1000));

      // Prepare stamp data
      const stampData = {
        email,
        shopId: shop.id,
        shopName: shop.name,
        shopUsername: shop.username,
        rewardId,
        userId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        type: 'regular',
        expiryDate
      };

      // Add the stamp to Firestore
      await setDoc(doc(db, 'stamps', stampId), stampData);

      const remainingStamps = reward.stampsRequired - (existingStampsCount + 1);
      const successMessage = remainingStamps > 0 
        ? `Stamp added! ${remainingStamps} more stamp${remainingStamps !== 1 ? 's' : ''} needed for reward.`
        : 'Stamp added! Reward card is now complete!';

      setSuccess(successMessage);
      showToast({
        title: 'Success',
        description: successMessage,
        type: 'success'
      });
      
      setEmail('');
    } catch (err) {
      console.error('Error adding stamp:', err);
      setError(err.message || 'Failed to add stamp.');
      showToast({
        title: 'Error',
        description: err.message || 'Failed to add stamp',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = async (result) => {
    if (!result?.text) return;

    try {
      const qrData = JSON.parse(result.text);
      const { email: scannedEmail } = qrData;

      if (!scannedEmail) throw new Error('Invalid QR code format. Missing email.');
      await addStamp(scannedEmail);
    } catch (err) {
      console.error('Error processing QR:', err);
      setError(err.message || 'Failed to process QR code.');
      showToast({
        title: 'Error',
        description: 'Invalid QR code',
        type: 'error'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addStamp(email);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/my-shops/${username}/rewards`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Rewards
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-4">Award Stamps</h2>

      {/* Reward Info */}
      {reward && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium">{reward.name}</h3>
          {reward.howToEarn && (
            <div className="mt-2 text-sm text-gray-600">
              <p className="font-medium">Requirements:</p>
              <ul className="mt-1 space-y-1">
                {reward.howToEarn.minimumSpend && (
                  <li>• Minimum spend: {reward.howToEarn.minimumAmount}</li>
                )}
                {reward.howToEarn.googleReview && (
                  <li>• Must leave a Google review</li>
                )}
                {reward.howToEarn.socialMediaFollow && (
                  <li>• Must follow on social media</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-green-600">
          {success}
        </div>
      )}

      {/* Email Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter customer email"
            className="flex-1 p-2 border rounded-lg"
            required
            disabled={isProcessing}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            disabled={isProcessing}
          >
            {isProcessing && <LoadingSpinner size="w-4 h-4" />}
            Submit
          </button>
        </div>
      </form>

      {/* QR Scanner */}
      <Scanner
        onResult={handleScan}
        constraints={{ facingMode: 'environment' }}
        className="w-full h-64 rounded-lg border"
      />
    </div>
  );
};

export default RewardScanner;