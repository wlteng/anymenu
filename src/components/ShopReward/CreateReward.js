import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { getShopByUsername } from '../../firebase/utils';
import { ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import RewardForm from './RewardForm';

const CreateReward = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [reward, setReward] = useState(null);
  
  // Get reward ID from URL if editing
  const rewardId = location.state?.rewardId;
  const isEditMode = Boolean(rewardId);

  useEffect(() => {
    loadShop();
    if (rewardId) {
      loadReward();
    }
  }, [username, rewardId]);

  const loadShop = async () => {
    try {
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
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load shop data',
        type: 'error'
      });
    } finally {
      if (!rewardId) {
        setIsLoading(false);
      }
    }
  };

  const loadReward = async () => {
    try {
      const rewardDoc = await getDoc(doc(db, 'rewards', rewardId));
      if (rewardDoc.exists()) {
        setReward({ id: rewardDoc.id, ...rewardDoc.data() });
      } else {
        showToast({
          title: 'Error',
          description: 'Reward not found',
          type: 'error'
        });
        navigate(`/my-shops/${username}/rewards`);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load reward data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
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
      <Header 
        shop={shop} 
        pageTitle={isEditMode ? "Edit Reward" : "Create Reward"} 
      />
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(`/my-shops/${username}/rewards`)}
            className="text-gray-600 hover:bg-gray-100 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <RewardForm 
          shop={shop}
          reward={reward}
          onCancel={() => navigate(`/my-shops/${username}/rewards`)}
          onSuccess={() => {
            navigate(`/my-shops/${username}/rewards`);
          }}
        />
      </div>
    </>
  );
};

export default CreateReward;