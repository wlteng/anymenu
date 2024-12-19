import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../ui/loading';
import Header from '../Layout/Header';
import { getShopByUsername, createStore, getStores } from '../../firebase/utils';
import { Plus, Upload, X, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

const CreateStores = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [stores, setStores] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    storeNumber: '',
    owner: {
      name: '',
      phone: '',
      email: '',
    },
    storeImageFile: null,
    storeImagePreview: null,
    ownerImageFile: null,
    ownerImagePreview: null
  });

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
      
      const storesData = await getStores(shopData.id);
      setStores(storesData);
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

  const handleImageChange = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [`${type}ImageFile`]: file,
          [`${type}ImagePreview`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createStore(shop.id, {
        ...formData,
        createdAt: new Date()
      });

      showToast({
        title: 'Success',
        description: 'Store created successfully'
      });
      
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        storeNumber: '',
        owner: {
          name: '',
          phone: '',
          email: '',
        },
        storeImageFile: null,
        storeImagePreview: null,
        ownerImageFile: null,
        ownerImagePreview: null
      });
      
      loadShopAndStores(); // Reload the stores list
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to create store',
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
      <Header 
        shop={shop} 
        pageTitle="Stores"
      />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-shops')}
            className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Stores List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Stores</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="divide-y">
            {stores.map(store => (
              <div key={store.id} className="p-4 flex items-center gap-4">
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
                  {store.description && (
                    <p className="text-sm text-gray-600 mt-1">{store.description}</p>
                  )}
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
      </div>

      {/* Create Store Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogTitle className="text-xl font-semibold mb-6">
            Create Store
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Store Image
              </label>
              <div className="flex justify-center">
                {formData.storeImagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.storeImagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        storeImageFile: null,
                        storeImagePreview: null
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-lg flex items-center justify-center w-32 h-32">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <span className="text-sm text-gray-500 mt-2 block">Store Image</span>
                      <input
                        type="file"
                        onChange={handleImageChange('store')}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Basic Store Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Number
                </label>
                <input
                  type="text"
                  value={formData.storeNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeNumber: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="font-medium mb-4">Owner Information</h3>
              
              {/* Owner Image Upload */}
              <div className="flex justify-center mb-4">
                {formData.ownerImagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.ownerImagePreview}
                      alt="Owner"
                      className="w-24 h-24 object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        ownerImageFile: null,
                        ownerImagePreview: null
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer hover:bg-gray-50 border-2 border-dashed rounded-full flex items-center justify-center w-24 h-24">
                    <div className="text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500 mt-1 block">Owner Photo</span>
                      <input
                        type="file"
                        onChange={handleImageChange('owner')}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.owner.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      owner: { ...prev.owner, name: e.target.value }
                    }))}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.owner.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      owner: { ...prev.owner, phone: e.target.value }
                    }))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.owner.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      owner: { ...prev.owner, email: e.target.value }
                    }))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    name: '',
                    description: '',
                    storeNumber: '',
                    owner: {
                      name: '',
                      phone: '',
                      email: '',
                    },
                    storeImageFile: null,
                    storeImagePreview: null,
                    ownerImageFile: null,
                    ownerImagePreview: null
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.owner.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <LoadingSpinner />}
                Create Store
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateStores;