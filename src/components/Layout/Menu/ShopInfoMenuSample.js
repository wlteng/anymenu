import React, { useState } from 'react';
import { Phone, Globe, Facebook, Twitter, Instagram, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../../../firebase/auth';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingSpinner } from '../../ui/loading';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '../../ui/alert';
import SetupDialog from '../../foodmenu/SetupDialog';
import CreateMenuButton from './CreateMenuButton';
import MyShopButton from './MyShopButton';
import LoveFood from './LoveFood';
import RecentShops from './RecentShops';

const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${
      isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const SocialLink = ({ icon: Icon, url, label }) => {
  if (!url) return null;
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg text-gray-600"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </a>
  );
};

const ShopInfoMenuSample = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  const [isLoading, setIsLoading] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      showToast({
        title: 'Success',
        description: 'Successfully logged in!'
      });
      setShowLoginPrompt(false);
      onClose();
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to login. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = () => {
    setShowLoginPrompt(true);
  };

  const renderUserContent = () => (
    <div className="p-4 space-y-4">
      {user ? (
        <>
          <div className="p-4 border-b">
            <button 
              onClick={() => {
                navigate('/profile');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {(user.displayName || 'U').charAt(0)}
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium text-base">{user.displayName || 'User'}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </button>
          </div>
          <div className="border-b">
            <MyShopButton onClick={() => {
              navigate('/my-shops');
              onClose();
            }} />
          </div>
          <RecentShops />
          <LoveFood />
        </>
      ) : (
        <>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border rounded-lg hover:bg-gray-50 font-medium"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Login with Google</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <CreateMenuButton onClick={handleCreateMenu} />
        </>
      )}
    </div>
  );

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-[60]`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <TabButton
                isActive={activeTab === 'shop'}
                onClick={() => setActiveTab('shop')}
              >
                <img 
                  src="/img/logo/applogo.png"
                  alt="Sample Logo"
                  className="w-7 h-7 object-cover rounded"
                />
              </TabButton>
              
              <TabButton
                isActive={activeTab === 'user'}
                onClick={() => setActiveTab('user')}
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </TabButton>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'shop' ? (
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/img/logo/applogo.png"
                  alt="Sample Logo"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <div className="font-medium text-lg">Sample Restaurant</div>
                  <div className="text-sm text-gray-500">anymenu.info/sample-restaurant</div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Welcome to our restaurant! We serve delicious food made with fresh ingredients. 
                Come experience our wonderful atmosphere and exceptional service.
              </p>

              <button
                onClick={() => window.open('https://wa.me/60123456789', '_blank')}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white rounded-lg py-3 hover:bg-green-600 transition-colors mb-6"
              >
                <Phone className="w-5 h-5" />
                <span>Contact on WhatsApp</span>
              </button>

              <div className="space-y-2">
                <SocialLink 
                  icon={Globe} 
                  url="#" 
                  label="Visit Website" 
                />
                <SocialLink 
                  icon={Facebook} 
                  url="#" 
                  label="Facebook" 
                />
                <SocialLink 
                  icon={Twitter} 
                  url="#" 
                  label="Twitter" 
                />
                <SocialLink 
                  icon={Instagram} 
                  url="#" 
                  label="Instagram" 
                />
              </div>
            </div>
          ) : (
            renderUserContent()
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[50]"
          onClick={onClose}
        />
      )}

      {/* Login Prompt Dialog */}
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogTitle>Login Required</AlertDialogTitle>
          <AlertDialogDescription>
            Please login first to create your menu.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Setup Dialog */}
      <SetupDialog 
        isOpen={setupDialogOpen}
        onClose={() => setSetupDialogOpen(false)}
      />
    </>
  );
};

export default ShopInfoMenuSample;