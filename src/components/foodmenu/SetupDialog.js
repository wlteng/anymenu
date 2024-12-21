import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '../ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction } from '../ui/alert';
import { useNavigate } from 'react-router-dom';
import { createShop } from '../../firebase/utils';
import { LoadingSpinner, LoadingOverlay } from '../ui/loading';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { usernameUtils } from '../../firebase/username-utils';
import { availableCategories, shopTypes } from '../../data/general';
import { Check, X } from 'lucide-react';
import ShopTypeDialog from './ShopTypeDialog';

const SetupDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    username: '',
    shopType: '',
    categories: []
  });

  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: false,
    message: ''
  });

  const handleUsernameChange = async (e) => {
    const username = e.target.value.toLowerCase();
    setFormData(prev => ({ ...prev, username }));
    
    if (!username) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: ''
      });
      return;
    }

    setUsernameStatus({
      isChecking: true,
      isAvailable: false,
      message: 'Checking availability...'
    });

    try {
      usernameUtils.validateFormat(username);
      usernameUtils.checkMinLength(username);
      const isAvailable = await usernameUtils.checkAvailability(username);
      
      setUsernameStatus({
        isChecking: false,
        isAvailable,
        message: isAvailable ? 'Username is available' : 'Username is already taken'
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: error.message
      });
    }
  };

  const handleNext = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (step === 1) {
      if (!formData.shopName.trim()) {
        showToast({
          title: 'Error',
          description: 'Please enter a shop name',
          type: 'error'
        });
        return;
      }
      if (!usernameStatus.isAvailable) {
        showToast({
          title: 'Error',
          description: 'Please enter a valid username',
          type: 'error'
        });
        return;
      }
    }

    if (step === 2 && !formData.shopType) {
      showToast({
        title: 'Error',
        description: 'Please select a shop type',
        type: 'error'
      });
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast({
        title: 'Error',
        description: 'Please login to continue',
        type: 'error'
      });
      return;
    }

    if (!usernameStatus.isAvailable) {
      showToast({
        title: 'Invalid Username',
        description: usernameStatus.message || 'Please choose a valid username',
        type: 'error'
      });
      return;
    }

    if (!formData.shopType) {
      showToast({
        title: 'Error',
        description: 'Please select a shop type',
        type: 'error'
      });
      return;
    }

    if (formData.categories.length === 0) {
      showToast({
        title: 'Error',
        description: 'Please select at least one category',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);

      await createShop({
        name: formData.shopName,
        username: formData.username,
        shopType: formData.shopType,
        categories: formData.categories,
        createdAt: new Date(),
        lastUsernameChange: new Date()
      }, user.uid);
      
      showToast({
        title: 'Success',
        description: 'Your shop has been created successfully!'
      });

      navigate('/my-shops');
      onClose();
      setStep(0);
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to create shop. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return formData.shopName.trim() !== '' && 
               formData.username.trim() !== '' && 
               usernameStatus.isAvailable;
      case 2:
        return formData.shopType !== '';
      case 3:
        return formData.categories.length > 0;
      default:
        return true;
    }
  };

  

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="mb-3">Getting Started</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-gray-600">Start creating your digital menu.</p>
              <button 
                onClick={handleNext}
                className="w-full bg-blue-600 text-white rounded-lg py-3 flex items-center justify-center gap-2"
              >
                Get Started
              </button>
            </div>
          </>
        );

      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="mb-3">Basic Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mb-6">
              <div>
                
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={e => setFormData({...formData, shopName: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter your shop name"
                />
              </div>
              <div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">domain.com/</span>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formData.username}
                        onChange={handleUsernameChange}
                        className={`w-full p-2 border rounded-lg pr-10 ${
                          usernameStatus.message ? (
                            usernameStatus.isAvailable ? 'border-green-500' : 'border-red-500'
                          ) : ''
                        }`}
                        placeholder="username"
                      />
                      {usernameStatus.isChecking ? (
                        <LoadingSpinner className="absolute right-3 top-1/2 -translate-y-1/2" />
                      ) : usernameStatus.message && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameStatus.isAvailable ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {usernameStatus.message && (
                    <p className={`text-sm ${
                      usernameStatus.isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {usernameStatus.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return <ShopTypeDialog 
          formData={formData} 
          setFormData={setFormData} 
        />;

      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Choose Categories</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map(category => (
                <label
                  key={category.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    formData.categories.includes(category.value) 
                      ? 'border-blue-500 bg-blue-50' 
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.value)}
                    onChange={() => {
                      const newCategories = formData.categories.includes(category.value)
                        ? formData.categories.filter(c => c !== category.value)
                        : [...formData.categories, category.value];
                      setFormData({...formData, categories: newCategories});
                      }}
                    className="mr-2"
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <LoadingOverlay loading={isLoading}>
            <div className="p-6">
              {renderStep()}
              {step > 0 && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Back
                  </button>
                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canProceedToNext()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Finish
                    </button>
                  )}
                </div>
              )}
            </div>
          </LoadingOverlay>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            Please login first to create your menu.
          </AlertDialogDescription>
          <AlertDialogAction onClick={() => {
            setShowLoginPrompt(false);
          }}>
            Okay
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SetupDialog;