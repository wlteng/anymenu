import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserShops,deleteShop } from '../../firebase/utils';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import ShopCard from './ShopCard';
import SetupDialog from './SetupDialog';

const ShopManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadShops();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const loadShops = async () => {
    setIsLoading(true);
    try {
      const userShops = await getUserShops(user.uid);
      setShops(userShops);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load shops',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewShop = (username) => {
    navigate(`/${username}`);
  };

  const handleEditShop = (shop) => {
    navigate(`/my-shops/${shop.username}/edit`);
  };

  const handleCreateMenu = (username) => {
    navigate(`/menu/${username}`);
  };

  const handleDeleteShop = async (shop) => {
    try {
      await deleteShop(shop.id, shop.squareLogo, shop.rectangleLogo);
      showToast({
        title: 'Success',
        description: 'Shop deleted successfully'
      });
      loadShops();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to delete shop',
        type: 'error'
      });
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {shops.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Shops</h1>
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
            >
              Create New Shop
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="w-8 h-8" />
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">My Shops</h1>
            <p className="text-gray-500 mb-4">You don't have any shops yet</p>
            <button
              onClick={() => setShowSetupDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Shop
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map(shop => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onView={handleViewShop}
                onEdit={handleEditShop}
                onCreateMenu={handleCreateMenu}
                onDelete={handleDeleteShop}
              />
            ))}
          </div>
        )}
      </div>

      <SetupDialog 
        isOpen={showSetupDialog}
        onClose={() => {
          setShowSetupDialog(false);
          loadShops();
        }}
      />
    </>
  );
};

export default ShopManager;