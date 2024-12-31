import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import Menu from '../components/Layout/Menu';
import RewardInfo from '../components/MyReward/components/RewardInfo';
import MyReward from '../components/MyReward';
import UserRewardHistory from '../components/MyReward/components/UserRewardHistory';

const MyRewardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showInfo, setShowInfo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  if (showHistory) {
    return <UserRewardHistory onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Menu />
          <h1 className="text-lg font-semibold">My Rewards</h1>
          <button 
            onClick={() => setShowInfo(true)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ClipboardList className="w-5 h-5" />
            Claimed History
          </button>
        </div>

        <MyReward userId={user.uid} onShowHistory={() => setShowHistory(true)} />
      </div>

      <RewardInfo 
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
};

export default MyRewardPage;