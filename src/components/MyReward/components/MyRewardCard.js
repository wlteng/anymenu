// MyRewardCard.js
import React, { useState } from 'react';
import { Gift, MoreVertical, Send, Trash2, Info, Award } from 'lucide-react';
import StampInfo from './StampInfo';
import TransferStampDialog from './transferstampdialog';
import DeleteStamp from './DeleteStamp';
import HowEarnStamp from './HowEarnStamp';
import ClaimReward from './ClaimReward';
import { db } from '../../../firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '../../../contexts/ToastContext';

const MyRewardCard = ({ shop, onUpdate }) => {
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showHowEarn, setShowHowEarn] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);
  const { showToast } = useToast();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDeleteStamp = async (stampId) => {
    if (!stampId) {
      showToast({
        title: 'Error',
        description: 'No stamp selected for deletion',
        type: 'error'
      });
      return;
    }

    try {
      await deleteDoc(doc(db, 'stamps', stampId));
      
      showToast({
        title: 'Success',
        description: 'Stamp deleted successfully',
        type: 'success'
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting stamp:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete stamp',
        type: 'error'
      });
      throw error;
    }
  };

  const getStampColor = (stamp) => {
    if (stamp?.isTransferred) {
      return 'border-green-500 bg-green-500';
    }
    
    if (stamp?.isGold || shop.isLifetimeReward) {
      return 'border-yellow-500 bg-yellow-500';
    }

    if (!stamp || !stamp.expiryDate) {
      return 'border-gray-200';
    }

    const expiryDate = typeof stamp.expiryDate === 'object' && stamp.expiryDate.seconds 
      ? stamp.expiryDate.seconds * 1000 
      : stamp.expiryDate;
    
    const daysToExpiry = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysToExpiry <= 30) {
      return 'border-red-500 bg-red-500';
    } else if (daysToExpiry <= 60) {
      return 'border-orange-500 bg-orange-500';
    }
    return 'border-blue-500 bg-blue-500';
  };

  const renderStamp = (stamp, index) => {
    const baseClasses = "relative flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:shadow-lg";
    const colorClasses = getStampColor(stamp);
    
    if (!stamp) {
      return (
        <div
          key={`${shop.id}-empty-${index}`}
          className={`${baseClasses} border-gray-200`}
        />
      );
    }

    const stampKey = stamp.id || `${shop.id}-stamp-${index}-${stamp.timestamp}`;

    return (
      <div
        key={stampKey}
        className={`${baseClasses} ${colorClasses}`}
        onClick={() => setSelectedStamp(stamp)}
      >
        <div className="w-4 h-4 bg-white/90 rounded-full shadow-inner" />
        {stamp.isTransferred && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" 
               title="Transferred stamp" />
        )}
      </div>
    );
  };

  const handleShopClick = () => {
    window.open(`/${shop.username}`, '_blank');
  };

  const remainingStamps = shop.stampsRequired - (shop.stamps?.length || 0);
  const stamps = shop.stamps || [];
  const stampSlots = Array(shop.stampsRequired).fill(null).map((_, index) => stamps[index] || null);

  const getLastStamp = () => {
    return stamps.length > 0 ? stamps[stamps.length - 1] : null;
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Shop Header */}
      <div className="flex justify-between mb-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={handleShopClick}
        >
          <img 
            src={shop.logo || '/img/sample/logo-square.jpg'} 
            alt={shop.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">{shop.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Gift className="w-4 h-4" />
              <span>{shop.reward}</span>
              {shop.rewardWorth && (
                <span className="flex items-center gap-1 text-blue-600">
                  ({shop.currencySymbol} {shop.rewardWorth})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-[220px] bg-white rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  setShowTransfer(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Transfer Stamps
              </button>
              <button
                onClick={() => {
                  setShowHowEarn(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                How to Earn Stamps
              </button>
              {getLastStamp() && (
                <button
                  onClick={() => {
                    setSelectedStamp(getLastStamp());
                    setShowDelete(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Last Stamp
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="overflow-x-auto">
          <div className="flex gap-2 py-1 min-w-min">
            {stampSlots.map((stamp, index) => renderStamp(stamp, index))}
          </div>
        </div>
      </div>

      {/* Legend */}
      {stamps.some(stamp => stamp.isTransferred) && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Transferred stamps cannot be transferred again</span>
        </div>
      )}

      {/* Claim Button - Show when all stamps are collected */}
      {stamps.length >= shop.stampsRequired && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowClaim(true)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Award className="w-5 h-5" />
            Claim Reward
          </button>
          <p className="mt-2 text-sm text-gray-500">
            All stamps collected! You can now claim your reward.
          </p>
        </div>
      )}

      {/* Modals */}
      <StampInfo 
        isOpen={!!selectedStamp && !showTransfer && !showDelete}
        onClose={() => setSelectedStamp(null)}
        stamp={selectedStamp}
        shop={shop}
      />

      <TransferStampDialog 
        isOpen={showTransfer}
        onClose={() => {
          setShowTransfer(false);
          setSelectedStamp(null);
        }}
        stamps={stamps}
        shop={shop}
        onUpdate={onUpdate}
      />

      <DeleteStamp 
        isOpen={showDelete}
        onClose={() => {
          setShowDelete(false);
          setSelectedStamp(null);
        }}
        onDelete={handleDeleteStamp}
        stamp={selectedStamp}
        shop={shop}
      />

      <HowEarnStamp
        isOpen={showHowEarn}
        onClose={() => setShowHowEarn(false)}
        shop={shop}
      />

      <ClaimReward
        isOpen={showClaim}
        onClose={() => setShowClaim(false)}
        shop={shop}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default MyRewardCard;