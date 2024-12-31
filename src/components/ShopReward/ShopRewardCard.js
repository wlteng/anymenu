import React, { useState, useEffect } from 'react';
import { Gift, Trash2, Mail} from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/loading';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogTitle, 
  AlertDialogDescription 
} from '../../components/ui/alert';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';
import ShopCardMenu from './ShopCardMenu';

const ShopRewardCard = ({ reward, onDelete, shop }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStamps: 0
  });

  useEffect(() => {
    loadRewardStats();
  }, [reward.id]);

  const loadRewardStats = async () => {
    try {
      // Get only active stamps
      const stampsQuery = query(
        collection(db, 'stamps'),
        where('rewardId', '==', reward.id),
        where('status', '==', 'active')
      );
      const stampsSnapshot = await getDocs(stampsQuery);
      
      // Count unique email addresses from active stamps
      const uniqueEmails = new Set();
      stampsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          uniqueEmails.add(data.email);
        }
      });

      setStats({
        totalUsers: uniqueEmails.size, // This will give actual number of unique users
        totalStamps: stampsSnapshot.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkActiveStamps = async () => {
    try {
      const stampsQuery = query(
        collection(db, 'stamps'),
        where('rewardId', '==', reward.id),
        where('status', '==', 'active')
      );
      
      const stampsSnapshot = await getDocs(stampsQuery);
      return !stampsSnapshot.empty;
    } catch (error) {
      console.error('Error checking stamps:', error);
      return true;
    }
  };

  const handleDelete = async () => {
    if (!reward) return;
    
    setIsDeleting(true);
    try {
      const hasActiveStamps = await checkActiveStamps();
      
      if (hasActiveStamps) {
        setShowDeleteConfirm(false);
        setShowContactAdmin(true);
        showToast({
          title: 'Cannot Delete',
          description: 'This reward has active stamps. Please contact admin for deletion.',
          type: 'error'
        });
        return;
      }

      await onDelete(reward.id);
      showToast({
        title: 'Success',
        description: 'Reward deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting reward:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete reward',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const currencySymbol = reward.currencySymbol || shop?.currencySymbol || '$';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Gift className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{reward.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Active Users: {stats.totalUsers}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                Total Stamps: {stats.totalStamps}
              </span>
            </div>
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

        <ShopCardMenu 
          shop={shop} 
          reward={reward}
          onDeleteClick={() => setShowDeleteConfirm(true)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteConfirm} 
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Reward
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this reward? This action cannot be undone.
            If there are any active stamps, you will not be able to delete this reward.
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

      {/* Contact Admin Dialog */}
      <AlertDialog 
        open={showContactAdmin} 
        onOpenChange={setShowContactAdmin}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Admin Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-4">
              This reward cannot be deleted because it has active stamps. 
              Please contact the admin to request deletion.
            </p>
            <p className="text-sm text-gray-600">
              In the meantime, you can deactivate the reward by editing it
              and unchecking the "Active" status.
            </p>
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowContactAdmin(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Understood
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShopRewardCard;