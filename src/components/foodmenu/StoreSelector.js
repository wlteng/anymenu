import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { ArrowLeft } from 'lucide-react';
import { getShopByUsername, getStores } from '../../firebase/utils';

const StoreSelector = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    loadShopAndStores();
  }, [username]);

  const loadShopAndStores = async () => {
    setIsLoading(true);
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

      // Only load stores if it's a food court
      if (shopData.shopType === 'Food Court') {
        const storesData = await getStores(shopData.id);
        setStores(storesData);
      }
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to load shop data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    // Navigate to menu creator with store ID
    navigate(`/menu/${username}?store=${store.id}`);
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
      <Header shop={shop} pageTitle="Select Store" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/my-shops')}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No stores found</p>
            <button
              onClick={() => navigate(`/my-shops/${username}/stores`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Create Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleStoreSelect(store)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-4"
              >
                {store.storeImage ? (
                  <img 
                    src={store.storeImage} 
                    alt={store.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-gray-500">{store.name.charAt(0)}</span>
                  </div>
                )}
                <div className="text-left">
                  <h3 className="font-semibold">{store.name}</h3>
                  {store.storeNumber && (
                    <p className="text-sm text-gray-500">Store #{store.storeNumber}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StoreSelector;