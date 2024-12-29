import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/ui/loading';
import { db } from '../../firebase/config';
import { doc, setDoc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '../../contexts/ToastContext';

const RewardForm = ({ shop, reward = null, onCancel, onSuccess }) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(reward);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stampsRequired: 10,
    howToEarn: '',
    termsAndConditions: '',
    isLifetimeReward: false,
    expiryDays: 365,
    isActive: true
  });

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description,
        stampsRequired: reward.stampsRequired,
        howToEarn: reward.howToEarn,
        termsAndConditions: reward.termsAndConditions,
        isLifetimeReward: reward.isLifetimeReward,
        expiryDays: reward.expiryDays,
        isActive: reward.isActive
      });
    }
  }, [reward]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rewardData = {
        ...formData,
        shopId: shop.id,
        shopName: shop.name,
        shopUsername: shop.username,
        shopLogo: shop.squareLogo,
        updatedAt: new Date()
      };

      if (isEditMode) {
        // Update existing reward
        await updateDoc(doc(db, 'rewards', reward.id), rewardData);
        showToast({
          title: 'Success',
          description: 'Reward updated successfully'
        });
      } else {
        // Create new reward
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
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Describe the reward customers will receive"
            required
          />
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

      {/* Terms and Instructions */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Terms and Instructions</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How to Earn Stamps *
          </label>
          <textarea
            value={formData.howToEarn}
            onChange={(e) => setFormData({ ...formData, howToEarn: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Explain how customers can earn stamps"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms and Conditions *
          </label>
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Enter terms and conditions for this reward"
            required
          />
        </div>
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
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading && <LoadingSpinner />}
          {isEditMode ? 'Save Changes' : 'Create Reward'}
        </button>
      </div>
    </form>
  );
};

export default RewardForm;