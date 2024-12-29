import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, QrCode, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';

const ShopRewardCard = ({ reward, onDelete, shop }) => {  // Added shop prop here
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!reward) return;
    
    setIsDeleting(true);
    try {
      await onDelete(reward.id);
    } catch (error) {
      console.error('Error deleting reward:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = () => {
    navigate(`/my-shops/${shop.username}/rewards/edit/${reward.id}`, {
        state: { rewardId: reward.id }
      });
    };

  const handleViewCustomers = () => {
    navigate(`/my-shops/${shop.username}/rewards/${reward.id}/customers`);
  };

  const handleScanQR = () => {
    navigate(`/my-shops/${shop.username}/rewards/scan`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Gift className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{reward.name}</h3>
            <p className="text-sm text-gray-500">Required Stamps: {reward.stampsRequired}</p>
            <div className="flex items-center gap-4 mt-1">
              {reward.isLifetimeReward && (
                <span className="text-sm text-yellow-600">
                  Lifetime Reward
                </span>
              )}
              {!reward.isActive && (
                <span className="text-sm text-red-600">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
              <button
                onClick={() => {
                  handleScanQR();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Scan QR
              </button>

              <button
                onClick={() => {
                  handleViewCustomers();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                View Customers
              </button>

              <button
                onClick={() => {
                  handleEdit();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>

              <div className="h-px bg-gray-200 my-1" />

              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteConfirm} 
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Reward</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this reward? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
            >
              {isDeleting && <LoadingSpinner />}
              Delete
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShopRewardCard;