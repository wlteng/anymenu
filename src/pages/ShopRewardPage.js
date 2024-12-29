import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { LoadingSpinner } from '../components/ui/loading';
import Header from '../components/Layout/Header';
import { getShopByUsername, deleteDoc, doc } from '../firebase/utils';
import { Plus, ArrowLeft } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import ShopRewardCard from '../components/ShopReward/ShopRewardCard';

const ShopRewardPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    loadShopAndRewards();
  }, [username]);

  const loadShopAndRewards = async () => {
    try {
      // Load shop data
      const shopData = await getShopByUsername(username);
      if (!shopData) {
        showToast({
          title: 'Error',
          description: 'Shop not found',
          type: 'error'
        });
        navigate('/my-shops');
        return;
      }
      setShop(shopData);

      // Load rewards
      const rewardsQuery = query(
        collection(db, 'rewards'),
        where('shopId', '==', shopData.id)
      );
      const rewardsSnapshot = await getDocs(rewardsQuery);
      const rewardsData = rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRewards(rewardsData);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (rewardId) => {
    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      showToast({
        title: 'Success',
        description: 'Reward deleted successfully'
      });
      loadShopAndRewards(); // Reload the list
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete reward',
        type: 'error'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <Header shop={shop} pageTitle="Manage Rewards" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/my-shops')}
            className="text-gray-600 hover:bg-gray-100 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => navigate(`/my-shops/${username}/rewards/create`)}
            className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {rewards.length > 0 ? (
            rewards.map(reward => (
              <ShopRewardCard
                key={reward.id}
                reward={reward}
                onDelete={handleDelete}
                shop={shop}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">No rewards created yet</p>
              <button
                onClick={() => navigate(`/my-shops/${username}/rewards/create`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Reward
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopRewardPage;