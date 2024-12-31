import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, QrCode, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { collection, query, where, getDocs,limit } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ShopCardMenu = ({ shop, reward, onDeleteClick }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [pendingClaims, setPendingClaims] = useState(0);
  const menuRef = React.useRef(null);

  useEffect(() => {
      const loadPendingClaims = async () => {
        try {
          if (!reward?.id || !shop?.id) return;

          // First get the shop data
          const claimsQuery = query(
            collection(db, 'claims'),
            where('shopId', '==', shop.id),  // Important: need shopId for permissions
            where('rewardId', '==', reward.id),
            where('status', '==', 'pending')
          );
          
          const snapshot = await getDocs(claimsQuery);
          setPendingClaims(snapshot.size);
        } catch (error) {
          console.error('Error loading pending claims:', error);
        }
      };
      
      loadPendingClaims();
    }, [reward?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
          <button
            onClick={() => {
              navigate(`/my-shops/${shop.username}/rewards/${reward.id}/scan`);
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Award Stamps
          </button>

          <button
            onClick={() => {
              navigate(`/my-shops/${shop.username}/rewards/${reward.id}/customers`);
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <div className="relative">
              <Users className="w-4 h-4" />
              {pendingClaims > 0 && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {pendingClaims}
                </div>
              )}
            </div>
            View Customers
          </button>

          <button
            onClick={() => {
              navigate(`/my-shops/${shop.username}/rewards/edit/${reward.id}`, {
                state: { rewardId: reward.id }
              });
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={() => navigate(`/my-shops/${shop.username}/claims`)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <div className="relative">
              <Users className="w-4 h-4" />
            </div>
            Claims History
          </button>

          <div className="h-px bg-gray-200 my-1" />

          <button
            onClick={() => {
              onDeleteClick();
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
  );
};

export default ShopCardMenu;