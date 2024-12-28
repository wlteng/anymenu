import React, { useState } from 'react';
import { Gift, MoreVertical, Send, Trash2 } from 'lucide-react';
import StampInfo from './StampInfo';
import TransferStampDialog from './transferstampdialog';
import DeleteStamp from './DeleteStamp';

const RewardShopCard = ({ shop }) => {
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTransferStamp = async (stampId, email) => {
    try {
      // Call your API to transfer the stamp
      console.log('Transferring stamp', stampId, 'to', email);
      // After successful transfer:
      // refreshStamps();
    } catch (error) {
      console.error('Error transferring stamp:', error);
      throw error;
    }
  };

  const handleDeleteStamp = async (stampId) => {
    try {
      // Call your API to delete the stamp
      console.log('Deleting stamp', stampId);
      // After successful deletion:
      // refreshStamps();
    } catch (error) {
      console.error('Error deleting stamp:', error);
      throw error;
    }
  };

  const getStampColor = (stamp) => {
    if (stamp?.isGold || shop.isLifetimeReward) {
      return 'border-yellow-500 bg-yellow-500';
    }
    if (!stamp || !stamp.expiryDate) {
      return 'border-gray-200';
    }

    const now = new Date().getTime();
    const monthsToExpiry = (stamp.expiryDate - now) / (30 * 24 * 60 * 60 * 1000);

    if (monthsToExpiry <= 1) {
      return 'border-red-500 bg-red-500';
    } else if (monthsToExpiry <= 3) {
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
          key={`empty-${index}`}
          className={`${baseClasses} border-gray-200`}
        />
      );
    }

    return (
      <div
        key={stamp.id || index}
        className={`${baseClasses} ${colorClasses}`}
        onClick={() => setSelectedStamp(stamp)}
      >
        <div className="w-4 h-4 bg-white/90 rounded-full shadow-inner" />
      </div>
    );
  };

  const handleShopClick = () => {
    window.open(`/${shop.username}`, '_blank');
  };

  const remainingStamps = shop.stampsRequired - shop.stamps.length;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Shop Header */}
      <div className="flex justify-between mb-4">
        {/* Shop Info - Clickable */}
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
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg py-1 z-10">
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
                  setShowDelete(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Stamps
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between items-center text-sm mb-2">
          <div className="group relative cursor-help">
            {shop.isLifetimeReward ? (
              <span className="text-yellow-600 font-medium">Never Expires</span>
            ) : (
              <span className="text-gray-500 hover:text-gray-700 border-b border-dotted border-gray-400">
                1y/stamp
                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black/75 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  Each stamp is valid for 1 year from collection date
                </div>
              </span>
            )}
          </div>
          <div className="group relative cursor-help">
            <span className="text-blue-600 font-medium border-b border-dotted border-blue-400 hover:text-blue-700">
              How to earn Stamp!
            </span>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-black/75 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {shop.howToEarn || 'Show your QR code when placing an order to earn a stamp.'}
              {remainingStamps > 0 && ` Collect ${remainingStamps} more stamps to redeem ${shop.reward}!`}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-2 py-1 min-w-min">
            {Array(shop.stampsRequired).fill(null).map((_, index) => 
              renderStamp(shop.stamps[index], index)
            )}
          </div>
        </div>
      </div>

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
        onTransfer={handleTransferStamp}
        stamp={selectedStamp}
      />

      <DeleteStamp 
        isOpen={showDelete}
        onClose={() => {
          setShowDelete(false);
          setSelectedStamp(null);
        }}
        onDelete={handleDeleteStamp}
        stamp={selectedStamp}
      />
    </div>
  );
};

export default RewardShopCard;