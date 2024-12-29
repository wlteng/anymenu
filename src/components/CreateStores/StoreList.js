import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { getShopByUsername, deleteStore, getStores } from '../../firebase/utils';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../ui/alert';
import { Plus, ArrowLeft, Edit2, Trash2 } from 'lucide-react';

import StoreForm from './StoreForm';

const StoreList = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [stores, setStores] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      
      // Get stores
      const storesData = await getStores(shopData.id);
      setStores(storesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load shop data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setShowCreateModal(true);
  };

  const handleDelete = async () => {
    if (!selectedStore) return;
    
    setIsLoading(true);
    try {
      await deleteStore(selectedStore.id, selectedStore.storeImage);

      showToast({
        title: 'Success',
        description: 'Store deleted successfully'
      });
      
      setShowDeleteConfirm(false);
      setSelectedStore(null);
      loadShopAndStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete store',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !stores.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <Header shop={shop} pageTitle="Stores" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/my-shops')}
            className="text-gray-600 hover:bg-gray-100 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <button
            onClick={() => {
              setSelectedStore(null);
              setShowCreateModal(true);
            }}
            className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow divide-y">
          {stores.map(store => (
            <div key={store.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
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
                  <div>
                    <h3 className="font-semibold">{store.name}</h3>
                    {store.storeNumber && (
                      <p className="text-sm text-gray-500">Store #{store.storeNumber}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(store)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStore(store);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {stores.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No stores yet
            </div>
          )}
        </div>
      </div>

      {/* Store Form Modal */}
      <StoreForm 
        shop={shop}
        store={selectedStore}
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedStore(null);
        }}
        onSave={() => {
          setShowCreateModal(false);
          setSelectedStore(null);
          loadShopAndStores();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Store</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this store? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedStore(null);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
            >
              {isLoading && <LoadingSpinner />}
              Delete Store
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StoreList;