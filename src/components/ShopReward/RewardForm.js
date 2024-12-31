import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/ui/loading';
import { db } from '../../firebase/config';
import { doc, setDoc, collection, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '../../contexts/ToastContext';
import { AlertCircle } from 'lucide-react';

const RewardForm = ({ shop, reward = null, onCancel, onSuccess }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingDeletion, setIsCheckingDeletion] = useState(false);
  const isEditMode = Boolean(reward);

  const [formData, setFormData] = useState({
    name: '',
    rewardWorth: '',
    stampsRequired: 10,
    howToEarn: {
      minimumSpend: false,
      minimumAmount: '',
      googleReview: false,
      socialMediaFollow: false
    },
    isLifetimeReward: false,
    expiryDays: 365,
    isActive: true
  });

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        rewardWorth: reward.rewardWorth || '',
        stampsRequired: reward.stampsRequired,
        howToEarn: reward.howToEarn || {
          minimumSpend: false,
          minimumAmount: '',
          googleReview: false,
          socialMediaFollow: false
        },
        isLifetimeReward: reward.isLifetimeReward,
        expiryDays: reward.expiryDays,
        isActive: reward.isActive
      });
    }
  }, [reward]);

  // Check if reward can be deleted
  const checkCanDeleteReward = async (rewardId) => {
    try {
      setIsCheckingDeletion(true);
      const stampsQuery = query(
        collection(db, 'stamps'),
        where('rewardId', '==', rewardId),
        where('status', '==', 'active')
      );
      const stampsSnapshot = await getDocs(stampsQuery);
      
      if (!stampsSnapshot.empty) {
        showToast({
          title: 'Cannot Delete Reward',
          description: 'This reward has active stamps. Please contact admin to delete this reward.',
          type: 'error'
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking reward deletion:', error);
      return false;
    } finally {
      setIsCheckingDeletion(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate minimum amount if minimum spend is checked
      if (formData.howToEarn.minimumSpend && !formData.howToEarn.minimumAmount) {
        showToast({
          title: 'Validation Error',
          description: 'Please enter minimum spend amount',
          type: 'error'
        });
        return;
      }

      const rewardData = {
        ...formData,
        shopId: shop.id,
        shopName: shop.name,
        shopUsername: shop.username,
        shopLogo: shop.squareLogo,
        // Add shop currency information
        currencyCode: shop.currencyCode,
        currencySymbol: shop.currencySymbol,
        language: shop.language,
        country: shop.country,
        updatedAt: new Date(),
        termsAndConditions: 'The shop reserves the right to modify or terminate this reward program at any time for any reason.'
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'rewards', reward.id), rewardData);
        showToast({
          title: 'Success',
          description: 'Reward updated successfully'
        });
      } else {
        rewardData.createdAt = new Date();
        await setDoc(doc(collection(db, 'rewards')), rewardData);
        showToast({
          title: 'Success',
          description: 'Reward created successfully'
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving reward:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save reward program',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reward Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="e.g., Free Coffee"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reward Worth (in {shop.currencyCode}) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {shop.currencySymbol}
            </span>
            <input
              type="number"
              value={formData.rewardWorth}
              onChange={(e) => setFormData({ ...formData, rewardWorth: e.target.value })}
              className="w-full pl-8 p-2 border rounded-lg"
              placeholder="e.g., 50"
              min="0"
              required
            />
          </div>
        </div>
      </div>

      {/* Stamp Settings */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Stamp Settings</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Stamps *
          </label>
          <input
            type="number"
            value={formData.stampsRequired}
            onChange={(e) => setFormData({ ...formData, stampsRequired: parseInt(e.target.value) })}
            className="w-full p-2 border rounded-lg"
            min="1"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isLifetimeReward"
            checked={formData.isLifetimeReward}
            onChange={(e) => setFormData({ ...formData, isLifetimeReward: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="isLifetimeReward" className="text-sm font-medium text-gray-700">
            Lifetime Reward (Stamps never expire)
          </label>
        </div>

        {!formData.isLifetimeReward && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stamp Validity (Days)
            </label>
            <input
              type="number"
              value={formData.expiryDays}
              onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg"
              min="1"
            />
          </div>
        )}
      </div>

      {/* How to Earn */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ways to Earn Stamps</h2>
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Multiple options available
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          Select different ways customers can earn stamps. Customers can earn stamps through any of these methods - they don't need to complete all of them.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="minimumSpend"
              checked={formData.howToEarn.minimumSpend}
              onChange={(e) => setFormData({
                ...formData,
                howToEarn: {
                  ...formData.howToEarn,
                  minimumSpend: e.target.checked
                }
              })}
              className="mt-1 rounded border-gray-300"
            />
            <div className="flex-1">
              <label htmlFor="minimumSpend" className="text-sm font-medium text-gray-700 block">
                Earn stamp with minimum purchase amount
              </label>
              {formData.howToEarn.minimumSpend && (
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {shop.currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={formData.howToEarn.minimumAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      howToEarn: {
                        ...formData.howToEarn,
                        minimumAmount: e.target.value
                      }
                    })}
                    className="w-full pl-8 p-2 border rounded-lg"
                    placeholder="Enter minimum amount"
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="googleReview"
              checked={formData.howToEarn.googleReview}
              onChange={(e) => setFormData({
                ...formData,
                howToEarn: {
                  ...formData.howToEarn,
                  googleReview: e.target.checked
                }
              })}
              className="rounded border-gray-300"
            />
            <label htmlFor="googleReview" className="text-sm font-medium text-gray-700">
              Earn stamp by leaving a Google Review
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="socialMediaFollow"
              checked={formData.howToEarn.socialMediaFollow}
              onChange={(e) => setFormData({
                ...formData,
                howToEarn: {
                  ...formData.howToEarn,
                  socialMediaFollow: e.target.checked
                }
              })}
              className="rounded border-gray-300"
            />
            <label htmlFor="socialMediaFollow" className="text-sm font-medium text-gray-700">
              Earn stamp by following on social media
            </label>
          </div>
        </div>

        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> These are different ways customers can earn stamps. 
            They can earn stamps through any of these methods independently - they don't need to complete all requirements.
          </p>
        </div>
      </div>

      {/* Terms & Conditions Preview */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">Universal Terms & Conditions:</p>
        <p>The shop reserves the right to modify or terminate this reward program at any time for any reason.</p>
      </div>

      {/* Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Activate this reward program
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isCheckingDeletion}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {(isLoading || isCheckingDeletion) && <LoadingSpinner />}
          {isEditMode ? 'Save Changes' : 'Create Reward'}
        </button>
      </div>
    </form>
  );
};

export default RewardForm;